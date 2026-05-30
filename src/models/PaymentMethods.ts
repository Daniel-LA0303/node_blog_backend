import mongoose, { Model, Schema } from "mongoose";
import { PaymentMentohdI } from "../interfaces/plansuscription.interfaces";


const paymentMethodsSchema = new Schema<PaymentMentohdI>({

    provider:{
        type: String,
        required: true
    },
    user:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    methodType:{
        type: String,
        required: true
    },
    customerRef:{ // customer id reference in stripe
        type: String,
        required: false
    },
    externalId:{ // important, external id we use it to do a payment
        type: String, 
        required: true
    },
    liveMode: {
        type: String,
        required: false
    },
    active:{
        type: Boolean,
        required: true
    },
    isDefault:{
        type: Boolean,
        required: true
    },
    brand:{
        type: String,
        required: true
    },
    last4:{
        type: String,
        required: true
    },
    expMonth:{
        type: Number,
        required: true
    },
    expYear:{
        type: Number,
        required: true
    },
    funding:{
        type: String,
        required: false
    },
    displayBrand:{
        type: String,
        required: false
    },
    billingDetails:{
        type: String,
        required: false
    },
    cardDetails:{
        type: String,
        required: false
    },
    walletDetails:{
        type: String,
        required: false
    },
    bankDetails:{
        type: String,
        required: false
    },
    providerRaw:{
        type: Schema.Types.Mixed,
        required: false
    }
},{
    timestamps: true
});

const PaymentMethods: Model<PaymentMentohdI> = mongoose.model<PaymentMentohdI>(
    "PaymentMethods",
    paymentMethodsSchema
);

export default PaymentMethods;



