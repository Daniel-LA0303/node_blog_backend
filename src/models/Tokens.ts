import mongoose, { Model, Schema } from "mongoose";
import { IToken } from "../interfaces/tokens.interfaces";


const tokensSchema = new Schema<IToken>(
    {
        token:{
            type: String,
            required: true
        },
        ipAddress: {
            type: String,
            required: true,
        },
        userAgent: {
            type: String,
            required: true,
        },
        origin: {
            type: String,
            required: true,
        },
        host: {
            type: String,
            required: false,
        },
        status: {
            type: String, // ACTIVE - REVOKED
            required: true,
            default: 'ACTIVE'
        }, 
        isRevoked:  {
            type: Boolean,
            required: true,
            default: false
        },
        userId:{
            type: Schema.Types.ObjectId,
            ref: "User",
        }
    },
    {
        timestamps: true
    }
);

const Tokens: Model<IToken> = mongoose.model<IToken>("Token", tokensSchema);

export default Tokens;