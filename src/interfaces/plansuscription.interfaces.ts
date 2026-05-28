import { Types } from "mongoose";

export interface PlanSuscriptionI{
    name: string;
    descirption: string;

    price: number;
    currency: string;

    interval: "MONTH" | "YEAR";

    stripePriceId?: string;

    isActive: boolean;
    isFree: boolean;
    config: Record<string, any>;

}

export interface SubscriptionsI{
    user: Types.ObjectId;
    planSubscription: Types.ObjectId;
    startedAt: Date;
    isFree: boolean;
    expiresAt?: Date;
}