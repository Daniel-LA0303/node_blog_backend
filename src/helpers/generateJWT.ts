import dotenv from "dotenv"; 
dotenv.config();
import jwt from "jsonwebtoken";

// generate a new jwt
export const generateAccessToken = (id: any, roles: any[]) => {
    return jwt.sign({
        id,
        roles
    }, process.env.JWT_SECRET as string,
    {
        expiresIn: "1d"
    })
}

export const generateRefreshToken = (id: any, roles: any[]) => {
    return jwt.sign({
        id,
        roles
    }, process.env.JWT_SECRET as string,
    {
        expiresIn: "3d"
    })
}

