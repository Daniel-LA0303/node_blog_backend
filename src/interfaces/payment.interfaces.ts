import mongoose from "mongoose";


export interface TryPaymentRequestI{
    currency: string;
    interval: string;
    paymentMethodId: string;
    planId: string;
    userId: string;
    price: number;
}

export interface PaymentHistoryI {
    user:            mongoose.Types.ObjectId
    subscription:    mongoose.Types.ObjectId
    stripeInvoiceId: string
    stripeSubId:     string
    plan:            mongoose.Types.ObjectId
    amount:          number
    currency:        string
    interval:        'MONTH' | 'YEAR'
    status:          'succeeded' | 'failed'
    paidAt:          Date
}