import dotenv from "dotenv";
dotenv.config();
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";
import { ApiResponse } from "../utils/ApiResponse";
import { error } from "console";

interface CustomJwtPayload extends JwtPayload {
    id: string;
}

// middleware to check jwt
const checkAuth = async (req: any, res: any, next: any) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. extract token
            token = req.headers.authorization.split(' ')[1];

            // 2. decoded token
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as CustomJwtPayload;;

            // 3. search user
            const user = await User.findById(decoded.id).select("-password -confirmado -token -__v");

            // 4. check if user exists
            if (!user) {
                return res.status(401).json(
                    new ApiResponse(401, '/api' + req.path, req.method, 'User not found', null, true)
                );
            }
            req.user = user;
            return next();
        } catch (error) {
            // 401 triggers the frontend refresh flow
            return res.status(401).json(
                new ApiResponse(401, '/api' + req.path, req.method, 'Access token expired or invalid', null, true)
            );
        }
    }

    if (!token) {
        const error = new Error('Invalid token');
        return res.status(401).json(new ApiResponse(
            401,
            "/api" + req.path,
            req.method,
            error.message,
            null,
            true
        ));
    }

    next(error);
}

export default checkAuth;