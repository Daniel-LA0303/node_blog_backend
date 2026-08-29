// middlewares/checkRefreshToken.ts
import dotenv from "dotenv";
dotenv.config();
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";
import { ApiResponse } from "../utils/ApiResponse";
import Tokens from "../models/Tokens";
import { hashToken } from "../utils/hashToken";

interface CustomJwtPayload extends JwtPayload {
    id: string;
}

const checkRefreshToken = async (req: any, res: any, next: any) => {
    // 1. Extraer del header, no del body
    let refreshToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        refreshToken = req.headers.authorization.split(' ')[1];
    }

    if (!refreshToken) {
        return res.status(400).json(
            new ApiResponse(400, "/api" + req.path, req.method, "Authorization header with refresh token is required", null, true)
        );
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_SECRET as string
        ) as CustomJwtPayload;

        const user = await User.findById(decoded.id).select("-password -confirmado -token -__v");
        if (!user) {
            return res.status(401).json(
                new ApiResponse(401, "/api" + req.path, req.method, "User not found", null, true)
            );
        }

        const tokenDoc = await Tokens.findOne({
            token: hashToken(refreshToken)
        });

        if (!tokenDoc) {
            return res.status(401).json(
                new ApiResponse(401, "/api" + req.path, req.method, "Refresh token not recognized", null, true)
            );
        }

        if (tokenDoc.isRevoked || tokenDoc.status === 'REVOKED') {
            return res.status(401).json(
                new ApiResponse(401, "/api" + req.path, req.method, "Refresh token has been revoked", null, true)
            );
        }

        req.tokenDoc = tokenDoc;
        req.user = user;
        req.refreshToken = refreshToken;
        return next();
    } catch (err) {

        // change token status when token is in db but is not valid
        try {
            
            console.log("token expired");
            
            // search token
            const tokenDoc = await Tokens.findOne({
                token: hashToken(refreshToken)
            })

            if (tokenDoc && !tokenDoc.isRevoked) {
                tokenDoc.isRevoked = true;
                tokenDoc.status = 'REVOKED';
                await tokenDoc.save();
            }

        } catch (error) {
            // when token is not in db or another final error
            console.error("Error al intentar revocar token tras fallo de verify:", error);
        }

        return res.status(401).json(
            new ApiResponse(401, "/api" + req.path, req.method, "Invalid or expired refresh token", null, true)
        );
    }
};

export default checkRefreshToken;