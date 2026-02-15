import rateLimit from 'express-rate-limit';

// Rate limiter for login endpoints - prevents brute force attacks
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per window
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many login attempts',
            message: 'Please try again after 15 minutes',
            retryAfter: 15 * 60 // seconds
        });
    }
});

// General API rate limiter - prevents API abuse
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});
