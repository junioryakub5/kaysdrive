import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../utils/config.js';
import { AppError } from './errorHandler.js';
import { prisma } from '../utils/prisma.js';

export interface AuthRequest extends Request {
    admin?: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}

export const authMiddleware = async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecret) as { adminId: string; type: string };

        // Verify it's an admin token
        if (decoded.type !== 'admin') {
            throw new AppError('Access denied - admin access required', 403);
        }

        const admin = await prisma.admin.findUnique({
            where: { id: decoded.adminId },
            select: { id: true, email: true, name: true, role: true, isActive: true },
        });

        if (!admin || !admin.isActive) {
            throw new AppError('Admin not found or inactive', 401);
        }

        req.admin = {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
        };

        next();
    } catch (error) {
        next(error);
    }
};
