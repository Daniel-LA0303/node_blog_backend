import { createRateLimiter } from "./createRateLimiter";
import { Request } from "express";

// limit by ip

export const registerRateLimiter = createRateLimiter({
    points: 5,
    duration: 60 * 60, // 1 hora
    message: "Too many accounts created from this IP, try again later",
});


export const loginRateLimiter = createRateLimiter({
    points: 10,
    duration: 60, // 15 min
    message: "Too many login attempts, try again later",
});

// limit by account
export const sendMessageRateLimiter = createRateLimiter({
    points: 20,
    duration: 60, // 20 mgs by minute
    message: "You're sending messages too fast",
    keyGenerator: (req: Request) => {
        // checkauth first so we get info
        return req.user?._id?.toString() ?? req.ip ?? "unknown";
    },
});