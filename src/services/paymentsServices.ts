import mongoose from "mongoose";
import { PaymentMentohdI, PaymentMentohdRequestI, PaymentMentohdResponseI } from "../interfaces/plansuscription.interfaces";
import PaymentMethods from "../models/PaymentMethods";
import PlanSuscription from "../models/Plan";
import Subscriptions from "../models/Subscriptions";
import User from "../models/User";
import { ServiceException } from "../utils/exception/ServiceException";
import { TryPaymentRequestI } from "../interfaces/payment.interfaces";
import Stripe from 'stripe'
import PaymentHistory from "../models/PaymentHistory";
import { emailPaymentFailed, emailPaymentSuccess } from "../helpers/email";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)


const createPaymentMethod = async (data: PaymentMentohdRequestI)
    : Promise<PaymentMentohdResponseI> => {

    // 1. search user
    const user = await User.findById(data.user);
    if (!user) {
        throw new ServiceException("This user does not exists!", 404);
    }

    // 2. check all methods
    const methods = await PaymentMethods.find({
        user: user._id
    });

    const newPayment: PaymentMentohdI = {
        provider: data.provider,
        user: user._id,
        methodType: data.methodType,
        externalId: data.externalId,
        active: true,
        isDefault: false,
        brand: data.brand,
        last4: data.last4,
        expMonth: data.expMonth,
        expYear: data.expYear,
        providerRaw: data.providerRaw
    }

    // 3. when user register first time
    if (methods.length === 0) {
        newPayment.isDefault = true;
    }

    // 4. save method
    //const res = await PaymentMethods.create(newPayment);

    const newMethod = await new PaymentMethods(newPayment);
    await newMethod.save();

    const res = await PaymentMethods
        .findById(newMethod._id)
        .select("_id user externalId methodType brand last4 expMonth expYear isDefault");


    return res as PaymentMentohdResponseI;
}

const getPaymentMethodsByUser = async (userId: string)
    : Promise<PaymentMentohdResponseI[]> => {

    // 1. search user
    const user = await User.findById(userId);
    if (!user) {
        throw new ServiceException("This user does not exists!", 404);
    }

    const methods = await PaymentMethods.find({
        user: user._id
    }).select('_id user externalId methodType brand last4 expMonth expYear isDefault')
        .sort({ createdAt: -1 });

    return methods as PaymentMentohdResponseI[];
}

const deletePaymentMethod = async (methodId: string) => {

    const method = PaymentMethods.findById(methodId);
    if (!method) {
        throw new ServiceException("This method does not exists!", 404);
    }

    method.remove();

}

const changeDefaultMethod = async (newDefualtMethodId: string, userId: string) => {

    // 1. search user
    const user = await User.findById(userId);
    if (!user) {
        throw new ServiceException("This user does not exists!", 404);
    }

    // 2. get all methods by user
    const methods = await PaymentMethods.find({
        user: userId
    });

    // 3. search method to change
    const method = methods.find(m => m.isDefault === true);

    // 4. search method to change if exists
    const methodToChange = PaymentMethods.findById(newDefualtMethodId);
    if (!methodToChange) {
        throw new ServiceException("This method to change does not exists!", 404);
    }

    // 5. update the old method
    await PaymentMethods.findByIdAndUpdate(
        method?._id,
        {
            isDefault: false
        }
    );

    // u6. pdate the new default method
    await PaymentMethods.findByIdAndUpdate(
        newDefualtMethodId,
        {
            isDefault: true
        }
    );
}

const getPaymentMethodAndPlan = async (namePlan: string, userId: string) => {

    const plan = await PlanSuscription.findOne({ name: namePlan });

    if (!plan) {
        throw new ServiceException("This plan does not exists!", 404);
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ServiceException("This user does not exists!", 404);
    }

    const method = await PaymentMethods.findOne({
        user: user._id,
        isDefault: true
    }).select('_id user externalId methodType brand last4 expMonth expYear isDefault');

    return {
        plan,
        method
    }

}


const tryPayment = async (data: TryPaymentRequestI) => {

    const user = await User.findById(data.userId);
    if (!user) {
        throw new ServiceException("This user does not exists!", 404);
    }

    const plan = await PlanSuscription.findById(data.planId);
    if (!plan) {
        throw new ServiceException("This plan does not exists!", 404);
    }

    const method = await PaymentMethods.findById(data.paymentMethodId);
    if (!method) {
        throw new ServiceException("This method does not exists!", 404);
    }

    const subscription = await Subscriptions.findOne(
        { user: user._id }
    );
    if (!subscription) {
        throw new ServiceException("This subscription does not exists!", 404);
    }

    // check price 
    const expectedPrice = data.interval === 'YEAR'
        ? Math.round(plan.price * 0.8 * 12)
        : plan.price

    if (data.price !== expectedPrice) {
        throw new ServiceException(
            `Price mismatch: expected ${expectedPrice} but received ${data.price}`,
            400
        )
    }

    // check if this method is use for first time
    if (!method.customerRef) {

        const customer = await stripe.customers.create({
            email: user.email,
            name: user.name,
            payment_method: method.externalId, // pm_1....
        })

        method.customerRef = customer.id  // cus_xxxxxxxxxxxxx
        await method.save()
    }

    // create subscription in stripe
    // create product first
    const product = await stripe.products.create({
        name: `${plan.name} plan`,
    })

    // create subscription in stripe
    const stripeSubscription = await stripe.subscriptions.create({
        customer: method.customerRef,
        default_payment_method: method.externalId,
        items: [{
            price_data: {
                currency: plan.currency.toLowerCase(),
                unit_amount: expectedPrice * 100,
                recurring: {
                    interval: data.interval === 'YEAR' ? 'year' : 'month',
                    interval_count: 1,
                },
                product: product.id,
            }
        }],
        expand: ['latest_invoice.payment_intent'],
    })

    const invoice = stripeSubscription.latest_invoice as any
 
    // check payment status
    const intentStatus = (stripeSubscription.latest_invoice as any)?.payment_intent?.status

    if (invoice?.status !== 'paid') {
        // rollback stripe subscription if payment failed
        await stripe.subscriptions.cancel(stripeSubscription.id)
        throw new ServiceException('Payment failed, please try again later, nothing is charged to your card', 400)
    }

    // calculate expiration
    const now = new Date()
    const expiresAt = data.interval === 'YEAR'
        ? new Date(new Date(now).setFullYear(now.getFullYear() + 1))
        : new Date(new Date(now).setMonth(now.getMonth() + 1))

    // update subscription in DB
    await subscription.updateOne({
        planSubscription: plan._id,
        isFree: false,
        startedAt: new Date(),
        expiresAt,
        stripeSubscriptionId: stripeSubscription.id,
    });

    await PaymentHistory.create({
        user: user._id,
        subscription: subscription._id,
        stripeInvoiceId: (stripeSubscription.latest_invoice as any)?.id,
        stripeSubId: stripeSubscription.id,
        plan: plan._id,
        amount: expectedPrice,
        currency: plan.currency,
        interval: data.interval,
        status: 'succeeded',
        paidAt: new Date(),
    });

    await emailPaymentSuccess({
        email: user.email,
        name: user.name,
        plan: plan.name,
        amount: expectedPrice,
        currency: plan.currency,
        interval: data.interval,
        expiresAt,
    })


    if (invoice?.status !== 'paid') {
        await stripe.subscriptions.cancel(stripeSubscription.id)

        // save failed attempt
        await PaymentHistory.create({
            user: user._id,
            subscription: subscription._id,
            stripeInvoiceId: (stripeSubscription.latest_invoice as any)?.id,
            stripeSubId: stripeSubscription.id,
            plan: plan._id,
            amount: expectedPrice,
            currency: plan.currency,
            interval: data.interval,
            status: 'failed',
            paidAt: new Date(),
        });

        await emailPaymentFailed({
            email: user.email,
            name: user.name,
            plan: plan.name,
            amount: expectedPrice,
            currency: plan.currency,
        })

        throw new ServiceException('Payment failed, please try again', 400)
    }

    // TODO in the future send a email
    return {
        subscriptionId: stripeSubscription.id,
        status: stripeSubscription.status,
        expiresAt,
        plan: plan.name,
        interval: data.interval,
        amount: expectedPrice,
        currency: plan.currency,
        message: "Payment done successfully!",
        planData: plan,
        isFree: false
    }

}

export default {
    createPaymentMethod,
    getPaymentMethodsByUser,
    deletePaymentMethod,
    changeDefaultMethod,
    getPaymentMethodAndPlan,
    tryPayment
}