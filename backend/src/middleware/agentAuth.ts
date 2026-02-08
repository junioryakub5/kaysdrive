import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../utils/config.js';
import { AppError } from './errorHandler.js';
import { prisma } from '../utils/prisma.js';

export interface AgentRequest extends Request {
    agent?: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}

export const agentAuthMiddleware = async (
    req: AgentRequest,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecret) as { agentId: string; type: string };

        // Verify it's an agent token
        if (decoded.type !== 'agent') {
            throw new AppError('Access denied - agent access required', 403);
        }

        const agent = await prisma.agent.findUnique({
            where: { id: decoded.agentId },
            select: { id: true, email: true, name: true, role: true, isActive: true },
        });

        if (!agent || !agent.isActive) {
            throw new AppError('Agent not found or inactive', 401);
        }

        req.agent = {
            id: agent.id,
            email: agent.email,
            name: agent.name,
            role: agent.role,
        };

        next();
    } catch (error) {
        next(error);
    }
};
