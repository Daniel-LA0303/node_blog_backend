import { Types } from "mongoose";


export interface IToken extends Document{

    token: string;

    ipAddress: string;

    userAgent: string;

    origin: string;

    host: string;

    status: string; // ACTIVE - REVOKED

    isRevoked: boolean;

    userId: Types.ObjectId;

}

export interface IInfoUser {
    ip: string,
    userAgent: string;
    origin: string;
    host: string;
}