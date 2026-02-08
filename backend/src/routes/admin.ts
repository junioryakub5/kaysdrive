import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import { config } from '../utils/config.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import type { Request, Response, NextFunction } from 'express';

export const adminRouter = Router();

// Helper to stringify JSON for SQLite
const stringifyJson = (arr: any[]): string => JSON.stringify(arr);

// Helper to parse JSON arrays from SQLite
const parseJsonArray = (str: string): any[] => {
    try {
        return JSON.parse(str);
    } catch {
        return [];
    }
};

// =============================================================================
// AUTH
// =============================================================================

adminRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new AppError('Email and password required', 400);
        }

        const admin = await prisma.admin.findUnique({ where: { email } });

        if (!admin || !admin.isActive) {
            throw new AppError('Invalid credentials', 401);
        }

        const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid) {
            throw new AppError('Invalid credentials', 401);
        }

        const token = jwt.sign(
            { adminId: admin.id, type: 'admin' },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
        );

        res.json({
            success: true,
            token,
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
            },
        });
    } catch (error) {
        next(error);
    }
});

adminRouter.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    res.json({ success: true, admin: req.admin });
});

// =============================================================================
// DASHBOARD STATS
// =============================================================================

adminRouter.get('/stats', authMiddleware, async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const [totalCars, totalAgents, totalContacts, unreadContacts] = await Promise.all([
            prisma.car.count(),
            prisma.agent.count({ where: { isActive: true } }),
            prisma.contactSubmission.count(),
            prisma.contactSubmission.count({ where: { isRead: false } }),
        ]);

        res.json({
            totalCars,
            totalAgents,
            totalContacts,
            unreadContacts,
        });
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// CARS CRUD
// =============================================================================

adminRouter.get('/cars', authMiddleware, async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const cars = await prisma.car.findMany({
            include: { agent: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(cars.map(c => ({
            ...c,
            images: parseJsonArray(c.images),
            features: parseJsonArray(c.features),
        })));
    } catch (error) {
        next(error);
    }
});

adminRouter.get('/cars/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const car = await prisma.car.findUnique({
            where: { id: req.params.id },
            include: { agent: true },
        });
        if (!car) throw new AppError('Car not found', 404);
        res.json({
            ...car,
            images: parseJsonArray(car.images),
            features: parseJsonArray(car.features),
        });
    } catch (error) {
        next(error);
    }
});

adminRouter.post('/cars', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { images, features, priceType, status, fuel, transmission, ...data } = req.body;

        const car = await prisma.car.create({
            data: {
                ...data,
                images: stringifyJson(images || []),
                features: stringifyJson(features || []),
                priceType: priceType?.toUpperCase() || 'FIXED',
                status: status?.toUpperCase() || 'FOREIGN_USED',
                fuel: fuel?.toUpperCase() || 'GASOLINE',
                transmission: transmission?.toUpperCase() || 'AUTOMATIC',
            },
        });

        res.status(201).json(car);
    } catch (error) {
        next(error);
    }
});

adminRouter.put('/cars/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { images, features, priceType, status, fuel, transmission, ...data } = req.body;

        const updateData: any = { ...data };
        if (images) updateData.images = stringifyJson(images);
        if (features) updateData.features = stringifyJson(features);
        if (priceType) updateData.priceType = priceType.toUpperCase();
        if (status) updateData.status = status.toUpperCase();
        if (fuel) updateData.fuel = fuel.toUpperCase();
        if (transmission) updateData.transmission = transmission.toUpperCase();

        const car = await prisma.car.update({
            where: { id: req.params.id },
            data: updateData,
        });

        res.json(car);
    } catch (error) {
        next(error);
    }
});

adminRouter.delete('/cars/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.car.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

adminRouter.patch('/cars/:id/publish', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const car = await prisma.car.findUnique({ where: { id: req.params.id } });
        if (!car) throw new AppError('Car not found', 404);

        const updated = await prisma.car.update({
            where: { id: req.params.id },
            data: { isPublished: !car.isPublished },
        });

        res.json({ success: true, isPublished: updated.isPublished });
    } catch (error) {
        next(error);
    }
});

adminRouter.patch('/cars/:id/feature', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const car = await prisma.car.findUnique({ where: { id: req.params.id } });
        if (!car) throw new AppError('Car not found', 404);

        const updated = await prisma.car.update({
            where: { id: req.params.id },
            data: { isFeatured: !car.isFeatured },
        });

        res.json({ success: true, isFeatured: updated.isFeatured });
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// AGENTS CRUD
// =============================================================================

adminRouter.get('/agents', authMiddleware, async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const agents = await prisma.agent.findMany({ orderBy: { name: 'asc' } });
        res.json(agents.map(a => ({ ...a, socials: parseJsonArray(a.socials) })));
    } catch (error) {
        next(error);
    }
});

adminRouter.post('/agents', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { socials, password, ...data } = req.body;

        // Hash password if provided
        const agentData: any = { ...data, socials: stringifyJson(socials || []) };
        if (password) {
            agentData.password = await bcrypt.hash(password, 10);
        }

        const agent = await prisma.agent.create({
            data: agentData,
        });
        res.status(201).json(agent);
    } catch (error) {
        next(error);
    }
});

adminRouter.put('/agents/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { socials, ...data } = req.body;
        const updateData: any = { ...data };
        if (socials) updateData.socials = stringifyJson(socials);

        const agent = await prisma.agent.update({
            where: { id: req.params.id },
            data: updateData,
        });
        res.json(agent);
    } catch (error) {
        next(error);
    }
});

adminRouter.delete('/agents/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.agent.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// SERVICES CRUD
// =============================================================================

adminRouter.get('/services', authMiddleware, async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const services = await prisma.service.findMany({ orderBy: { sortOrder: 'asc' } });
        res.json(services.map(s => ({ ...s, features: parseJsonArray(s.features) })));
    } catch (error) {
        next(error);
    }
});

adminRouter.post('/services', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { features, ...data } = req.body;
        const service = await prisma.service.create({
            data: { ...data, features: stringifyJson(features || []) },
        });
        res.status(201).json(service);
    } catch (error) {
        next(error);
    }
});

adminRouter.put('/services/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { features, ...data } = req.body;
        const updateData: any = { ...data };
        if (features) updateData.features = stringifyJson(features);

        const service = await prisma.service.update({
            where: { id: req.params.id },
            data: updateData,
        });
        res.json(service);
    } catch (error) {
        next(error);
    }
});

adminRouter.delete('/services/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.service.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// FAQ CRUD
// =============================================================================

adminRouter.get('/faqs', authMiddleware, async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const faqs = await prisma.fAQ.findMany({ orderBy: { sortOrder: 'asc' } });
        res.json(faqs);
    } catch (error) {
        next(error);
    }
});

adminRouter.post('/faqs', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const faq = await prisma.fAQ.create({ data: req.body });
        res.status(201).json(faq);
    } catch (error) {
        next(error);
    }
});

adminRouter.put('/faqs/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const faq = await prisma.fAQ.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(faq);
    } catch (error) {
        next(error);
    }
});

adminRouter.delete('/faqs/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.fAQ.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// TESTIMONIALS CRUD
// =============================================================================

adminRouter.get('/testimonials', authMiddleware, async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const testimonials = await prisma.testimonial.findMany();
        res.json(testimonials);
    } catch (error) {
        next(error);
    }
});

adminRouter.post('/testimonials', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const testimonial = await prisma.testimonial.create({ data: req.body });
        res.status(201).json(testimonial);
    } catch (error) {
        next(error);
    }
});

adminRouter.put('/testimonials/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const testimonial = await prisma.testimonial.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(testimonial);
    } catch (error) {
        next(error);
    }
});

adminRouter.delete('/testimonials/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.testimonial.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// BRANDS CRUD
// =============================================================================

adminRouter.get('/brands', authMiddleware, async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const brands = await prisma.brand.findMany({ orderBy: { sortOrder: 'asc' } });
        res.json(brands);
    } catch (error) {
        next(error);
    }
});

adminRouter.post('/brands', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const brand = await prisma.brand.create({ data: req.body });
        res.status(201).json(brand);
    } catch (error) {
        next(error);
    }
});

adminRouter.put('/brands/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const brand = await prisma.brand.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(brand);
    } catch (error) {
        next(error);
    }
});

adminRouter.delete('/brands/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.brand.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// CONTACTS
// =============================================================================

adminRouter.get('/contacts', authMiddleware, async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const contacts = await prisma.contactSubmission.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(contacts);
    } catch (error) {
        next(error);
    }
});

adminRouter.patch('/contacts/:id/read', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const contact = await prisma.contactSubmission.update({
            where: { id: req.params.id },
            data: { isRead: true },
        });
        res.json(contact);
    } catch (error) {
        next(error);
    }
});

adminRouter.delete('/contacts/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.contactSubmission.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// SETTINGS
// =============================================================================

adminRouter.get('/settings', authMiddleware, async (_req: Request, res: Response, next: NextFunction) => {
    try {
        let settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
        if (!settings) {
            settings = await prisma.siteSettings.create({ data: { id: 'default' } });
        }
        res.json({ ...settings, socials: parseJsonArray(settings.socials) });
    } catch (error) {
        next(error);
    }
});

adminRouter.put('/settings', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { socials, ...data } = req.body;
        const updateData: any = { ...data };
        if (socials) updateData.socials = stringifyJson(socials);

        const settings = await prisma.siteSettings.upsert({
            where: { id: 'default' },
            update: updateData,
            create: { id: 'default', ...updateData },
        });
        res.json(settings);
    } catch (error) {
        next(error);
    }
});
