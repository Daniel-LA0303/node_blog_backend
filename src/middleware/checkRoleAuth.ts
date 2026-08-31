import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";
import { ApiResponse } from "../utils/ApiResponse";
import { error } from "console";

interface JwtRole {
  name: string;
}

interface CustomJwtPayload extends JwtPayload {
    id: string;
    roles: JwtRole[];
}

const allowedRoles = ['ROLE_ADMIN'];

// middleware to check jwt
const checkRoleAuth = async (req: any, res: any, next: any) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. extract token
            token = req.headers.authorization.split(' ')[1];

            // 2. decoded token
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as CustomJwtPayload;

            // 3. check roles
            const roles: string[] = decoded.roles.map((r) => r.name);
            const haveAccess = roles.some((r) => allowedRoles.includes(r));
            if(!haveAccess){
                return res.status(400).json(
                    new ApiResponse(400, '/api' + req.path, req.method, 'You do not have permissions to do that', null, true)
                );
            }

            // 4. search user
            const user = await User.findById(decoded.id).select("-password -confirmado -token -__v");

            // 5. check if user exists
            if (!user) {
                return res.status(400).json(
                    new ApiResponse(400, '/api' + req.path, req.method, 'User not found', null, true)
                );
            }
            req.user = user;
            return next();
        } catch (error) {
            // 401 triggers the frontend refresh flow
            return res.status(400).json(
                new ApiResponse(400, '/api' + req.path, req.method, 'Access token expired or invalid', null, true)
            );
        }
    }

    if (!token) {
        const error = new Error('Invalid token');
        return res.status(400).json(new ApiResponse(
            400,
            "/api" + req.path,
            req.method,
            error.message,
            null,
            true
        ));
    }

    next(error);
}

export default checkRoleAuth;