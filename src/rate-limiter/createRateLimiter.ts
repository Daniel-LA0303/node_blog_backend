import { NextFunction, Request, Response } from "express";
import { IRateLimiterClusterOptions, RateLimiterMemory } from "rate-limiter-flexible";



interface RateLimitConfig extends IRateLimiterClusterOptions{
    message?: string;
    keyGenerator?: (req: Request) => string; // decide how identify client by ip, bu userId etc
}

export const createRateLimiter = (config: RateLimitConfig) => {

    const {
        message = "Too many requests in limit time.",
        keyGenerator = (req: Request) => req.ip || "unknown",
        ...limiterOptions
    } = config;
    
    const limiter = new RateLimiterMemory(limiterOptions);

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const key = keyGenerator(req);
            const rateLimiterRes =  await limiter.consume(key);

            res.setHeader("X-RateLimit-Limit", limiterOptions.points ?? 0);
            res.setHeader("X-RateLimit-Remaining", rateLimiterRes.remainingPoints);
            res.setHeader(
                "X-RateLimit-Reset",
                new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString()
            );
            next();
        } catch (rateLimiterRes: any) {
            const retryAfterSec = Math.ceil((rateLimiterRes?.msBeforeNext ?? 1000) / 1000);
            res.setHeader("Retry-After", retryAfterSec);
            return res.status(429).json({
                statusCode: 429,
                message,
            });
        }
    }
}