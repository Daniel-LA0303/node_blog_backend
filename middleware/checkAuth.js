import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { error } from "console";

//aqui se auntentica todo antes de mandar la info del perfil
const checkAuth = async (req, res, next) => {
    console.log("middleware checkAuth");
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. extract token
            token = req.headers.authorization.split(' ')[1];

            // 2. decoded token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. search user
            const user = await User.findById(decoded.id).select("-password -confirmado -token -__v");

            // 4. check if user exists
            if (user === null) {

                return res.status(404).json(new ApiResponse(
                    404,
                    "/api" + req.path,
                    req.method,
                    "Invalid token or user not found",
                    null,
                    true)
                );
            }
            req.user = user;
            return next();
        } catch (error) {
            console.error("Error in checkAuth middleware:", error);

            return res.status(401).json(new ApiResponse(
                401,
                "/api" + req.path,
                req.method,
                "Invalid or expired token",
                null,
                true
            ));

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