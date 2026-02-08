export const config = {
    port: process.env.PORT || 3001,
    jwtSecret: (process.env.JWT_SECRET || 'dev-secret-key') as string,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
