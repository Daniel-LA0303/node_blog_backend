import { PaymentMentohdI, PaymentMentohdRequestI, PaymentMentohdResponseI } from "../interfaces/plansuscription.interfaces";
import PaymentMethods from "../models/PaymentMethods";
import User from "../models/User";
import { ServiceException } from "../utils/exception/ServiceException";



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

export default {
    createPaymentMethod,
    getPaymentMethodsByUser,
    deletePaymentMethod,
    changeDefaultMethod
}