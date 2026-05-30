import { Types } from "mongoose";

export interface PlanSuscriptionI {
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

export interface SubscriptionsI {
    user: Types.ObjectId;
    planSubscription: Types.ObjectId;
    startedAt: Date;
    isFree: boolean;
    expiresAt?: Date;
}

export interface PaymentMentohdI {
    provider: string;
    user: Types.ObjectId;
    methodType: string;
    customerRef?: string;
    externalId: string; // important, this is used when we want to pay something
    liveMode?: boolean;
    active: boolean;
    isDefault: boolean;
    brand: string; // type card VISA | MASTERCARD etc
    last4: string;
    expMonth: Number;
    expYear: Number;
    funding?: string;
    displayBrand?: string;
    billingDetails?: string;
    cardDetails?: string;
    walletDetails?: string;
    bankDetails?: string;
    providerRaw?: Record<string, any>;
}

export interface PaymentMentohdRequestI {
    user: Types.ObjectId; 
    provider: string;
    methodType: string; 
    externalId: string; 
    brand: string; 
    last4: string; 
    expMonth: Number; 
    expYear: Number; 
    providerRaw?: Record<string, any>;
}

export interface PaymentMentohdResponseI{
    _id: Types.ObjectId; //
    user: Types.ObjectId; //
    externalId: string; //
    methodType: string; //
    brand: string; // 
    last4: string; //
    expMonth: Number; //
    expYear: Number; //
    isDefault: boolean;
}