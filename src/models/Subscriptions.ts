import mongoose, { Model, Schema } from "mongoose";
import { SubscriptionsI } from "../interfaces/plansuscription.interfaces";


const subscriptionSchema = new Schema<SubscriptionsI>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    planSubscription: {
        type: Schema.Types.ObjectId,
        ref: "PlanSuscription",
    },
    startedAt: {
        type: Date,
        required: true
    },
    isFree: {
        type: Boolean,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

const Subscriptions: Model<SubscriptionsI> = mongoose.model<SubscriptionsI>(
    "Subscriptions",
    subscriptionSchema
);

export default Subscriptions;