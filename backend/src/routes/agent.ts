import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import { config } from '../utils/config.js';
import { agentAuthMiddleware, type AgentRequest } from '../middleware/agentAuth.js';
import { AppError } from '../middleware/errorHandler.js';
import type { Request, Response, NextFunction } from 'express';
import { loginLimiter } from '../middleware/rateLimiter.js';

export const agentRouter = Router();

// Helper to parse JSON fields
const parseCarFields = (car: any) => ({
    ...car,
    images: JSON.parse(car.images || '[]'),
    features: JSON.parse(car.features || '[]'),
});

// =============================================================================
// AUTH
// =============================================================================

agentRouter.post('/login', loginLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new AppError('Email and password are required', 400);
        }

        const agent = await prisma.agent.findUnique({ where: { email } });

        if (!agent || !agent.isActive) {
            throw new AppError('Invalid credentials', 401);
        }

        // Agents MUST have a password set by admin. Reject if none exists.
        if (!agent.password) {
            throw new AppError('Account not yet activated. Please contact your administrator.', 401);
        }

        const valid = await bcrypt.compare(password, agent.password);
        if (!valid) {
            throw new AppError('Invalid credentials', 401);
        }

        const token = jwt.sign({ agentId: agent.id, type: 'agent' }, config.jwtSecret as string, {
            expiresIn: '24h',
        } as jwt.SignOptions);

        res.json({
            success: true,
            token,
            agent: {
                id: agent.id,
                email: agent.email,
                name: agent.name,
                role: agent.role,
                avatar: agent.avatar,
            },
        });
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// PROFILE
// =============================================================================

// Get current agent
agentRouter.get('/me', agentAuthMiddleware, async (req: AgentRequest, res: Response) => {
    res.json({ agent: req.agent });
});

// Update current agent profile
agentRouter.put('/me', agentAuthMiddleware, async (req: AgentRequest, res: Response, next: NextFunction) => {
    try {
        const { name, role, phone, avatar, bio, password, currentPassword } = req.body;

        const updateData: Record<string, string> = {};
        if (name) updateData.name = name;
        if (role) updateData.role = role;
        if (phone) updateData.phone = phone;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (bio !== undefined) updateData.bio = bio;

        // Password change requires current password verification
        if (password) {
            if (!currentPassword) {
                throw new AppError('Current password is required to set a new password', 400);
            }

            // Fetch agent with password hash
            const agentWithPw = await prisma.agent.findUnique({
                where: { id: req.agent!.id },
                select: { password: true },
            });

            if (!agentWithPw?.password) {
                throw new AppError('Account not properly configured. Contact admin.', 400);
            }

            const isCurrentValid = await bcrypt.compare(currentPassword, agentWithPw.password);
            if (!isCurrentValid) {
                throw new AppError('Current password is incorrect', 401);
            }

            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedAgent = await prisma.agent.update({
            where: { id: req.agent!.id },
            data: updateData,
        });

        const { password: _, ...agentWithoutPassword } = updatedAgent;
        res.json({ agent: agentWithoutPassword });
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// AGENT CARS
// =============================================================================

// Get agent's cars
agentRouter.get('/cars', agentAuthMiddleware, async (req: AgentRequest, res: Response, next: NextFunction) => {
    try {
        const cars = await prisma.car.findMany({
            where: { agentId: req.agent!.id },
            orderBy: { createdAt: 'desc' },
        });
        res.json(cars.map(parseCarFields));
    } catch (error) {
        next(error);
    }
});

// Get agent stats
agentRouter.get('/stats', agentAuthMiddleware, async (req: AgentRequest, res: Response, next: NextFunction) => {
    try {
        const [totalCars, publishedCars, featuredCars] = await Promise.all([
            prisma.car.count({ where: { agentId: req.agent!.id } }),
            prisma.car.count({ where: { agentId: req.agent!.id, isPublished: true } }),
            prisma.car.count({ where: { agentId: req.agent!.id, isFeatured: true } }),
        ]);
        res.json({ totalCars, publishedCars, featuredCars });
    } catch (error) {
        next(error);
    }
});

// Create a new car
agentRouter.post('/cars', agentAuthMiddleware, async (req: AgentRequest, res: Response, next: NextFunction) => {
    try {
        const { title, price, priceType, status, category, manufacturer, year, mileage, engine, fuel, transmission, city, images, features, description } = req.body;

        if (!title || !price || !category || !manufacturer || !year || !description) {
            throw new AppError('Missing required car fields', 400);
        }

        // Generate slug
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const existingSlug = await prisma.car.findUnique({ where: { slug } });
        const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

        const car = await prisma.car.create({
            data: {
                slug: finalSlug,
                title,
                price: parseFloat(price),
                priceType: priceType?.toUpperCase() || 'FIXED',
                status: status?.toUpperCase() || 'FOREIGN_USED',
                category,
                manufacturer,
                year: parseInt(year),
                mileage: parseInt(mileage),
                engine,
                fuel: fuel?.toUpperCase() || 'GASOLINE',
                transmission: transmission?.toUpperCase() || 'AUTOMATIC',
                city,
                images: JSON.stringify(images || []),
                features: JSON.stringify(features || []),
                description,
                agentId: req.agent!.id,
                isPublished: false, // Needs admin approval
                isFeatured: false,
            },
        });

        res.status(201).json(parseCarFields(car));
    } catch (error) {
        next(error);
    }
});

// Update agent's own car
agentRouter.put('/cars/:id', agentAuthMiddleware, async (req: AgentRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        // Check ownership
        const existingCar = await prisma.car.findFirst({
            where: { id, agentId: req.agent!.id },
        });

        if (!existingCar) {
            throw new AppError('Car not found or not yours', 404);
        }

        const { title, price, priceType, status, category, manufacturer, year, mileage, engine, fuel, transmission, city, images, features, description } = req.body;

        const car = await prisma.car.update({
            where: { id },
            data: {
                title,
                price: parseFloat(price),
                priceType: priceType?.toUpperCase(),
                status: status?.toUpperCase(),
                category,
                manufacturer,
                year: parseInt(year),
                mileage: parseInt(mileage),
                engine,
                fuel: fuel?.toUpperCase(),
                transmission: transmission?.toUpperCase(),
                city,
                images: JSON.stringify(images || []),
                features: JSON.stringify(features || []),
                description,
            },
        });

        res.json(parseCarFields(car));
    } catch (error) {
        next(error);
    }
});

// Delete agent's own car
agentRouter.delete('/cars/:id', agentAuthMiddleware, async (req: AgentRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        // Check ownership
        const existingCar = await prisma.car.findFirst({
            where: { id, agentId: req.agent!.id },
        });

        if (!existingCar) {
            throw new AppError('Car not found or not yours', 404);
        }

        await prisma.car.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});
