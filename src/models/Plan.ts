import mongoose, { Model, Schema } from "mongoose";
import { PlanSuscriptionI } from "../interfaces/plansuscription.interfaces";


const planSchema = new Schema<PlanSuscriptionI>({

    name: {
        type: String,
        requiered: true,
    },
    descirption: {
        type: String,
        requiered: false,
    },
    price: {
        type: Number,
        requiered: true,
    },
    currency: {
        type: String,
        requiered: true,
    },
    interval: {
        type: String,
        requiered: true,
    },
    stripePriceId: {
        type: String,
        requiered: false,
    },
    isActive: {
        type: Boolean,
        requiered: true,
    },
    isFree: {
        type: Boolean,
        requiered: true,
    },
    config: {
        type: Schema.Types.Mixed,
        requiered: true,
    }
}, {
    timestamps: true
});

const PlanSuscription: Model<PlanSuscriptionI> = mongoose.model<PlanSuscriptionI>(
    "PlanSuscription",
    planSchema
);

export default PlanSuscription;
