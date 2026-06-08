// src/models/PaymentHistory.ts
import mongoose, { Schema, Model } from 'mongoose'
import { PaymentHistoryI } from '../interfaces/payment.interfaces'

const paymentHistorySchema = new Schema<PaymentHistoryI>({
    user: {
        type:     Schema.Types.ObjectId,
        ref:      'User',
        required: true,
    },
    subscription: {
        type:     Schema.Types.ObjectId,
        ref:      'Subscriptions',
        required: true,
    },
    stripeInvoiceId: {
        type:     String,
        required: true,
    },
    stripeSubId: {
        type:     String,
        required: true,
    },
    plan: {
        type:     Schema.Types.ObjectId,
        ref:      'PlanSuscription',
        required: true,
    },
    amount: {
        type:     Number,
        required: true,
    },
    currency: {
        type:     String,
        required: true,
        default:  'USD',
    },
    interval: {
        type:     String,
        enum:     ['MONTH', 'YEAR'],
        required: true,
    },
    status: {
        type:     String,
        enum:     ['succeeded', 'failed'],
        required: true,
    },
    paidAt: {
        type:     Date,
        required: true,
    },
}, {
    timestamps: true,
})

const PaymentHistory: Model<PaymentHistoryI> = mongoose.model<PaymentHistoryI>(
    'PaymentHistory',
    paymentHistorySchema
)

export default PaymentHistory