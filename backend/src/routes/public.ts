import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import type { Request, Response, NextFunction } from 'express';

export const publicRouter = Router();

// Helper to parse JSON arrays from SQLite
const parseJsonArray = (str: string): string[] => {
    try {
        return JSON.parse(str);
    } catch {
        return [];
    }
};

// Helper to format car for API response
const formatCar = (car: any) => ({
    ...car,
    images: parseJsonArray(car.images),
    features: parseJsonArray(car.features),
    priceType: car.priceType.toLowerCase(),
    status: car.status.toLowerCase(),
    fuel: car.fuel.toLowerCase(),
    transmission: car.transmission.toLowerCase(),
});

// Helper to format agent for API response
const formatAgent = (agent: any) => ({
    ...agent,
    socials: parseJsonArray(agent.socials),
});

// =============================================================================
// CARS
// =============================================================================

publicRouter.get('/cars', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status, type, manufacturer, city, fuel, transmission, minPrice, maxPrice, minYear, maxYear, search } = req.query;

        const where: any = { isPublished: true };

        if (status && status !== 'all') {
            where.status = (status as string).toUpperCase();
        }
        if (type) where.category = type;
        if (manufacturer) where.manufacturer = manufacturer;
        if (city) where.city = city;
        if (fuel) where.fuel = (fuel as string).toUpperCase();
        if (transmission) where.transmission = (transmission as string).toUpperCase();
        if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice as string) };
        if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice as string) };
        if (minYear) where.year = { ...where.year, gte: parseInt(minYear as string) };
        if (maxYear) where.year = { ...where.year, lte: parseInt(maxYear as string) };
        if (search) {
            where.OR = [
                { title: { contains: search as string } },
                { manufacturer: { contains: search as string } },
                { category: { contains: search as string } },
            ];
        }

        const cars = await prisma.car.findMany({
            where,
            include: { agent: true },
            orderBy: { createdAt: 'desc' },
        });

        res.json(cars.map(formatCar));
    } catch (error) {
        next(error);
    }
});

publicRouter.get('/cars/featured', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const cars = await prisma.car.findMany({
            where: { isPublished: true, isFeatured: true },
            include: { agent: true },
            take: 6,
            orderBy: { createdAt: 'desc' },
        });
        res.json(cars.map(formatCar));
    } catch (error) {
        next(error);
    }
});

publicRouter.get('/cars/filters', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const cars = await prisma.car.findMany({
            where: { isPublished: true },
            select: { manufacturer: true, category: true, city: true, year: true },
        });

        res.json({
            manufacturers: [...new Set(cars.map(c => c.manufacturer.trim()))].filter(Boolean).sort(),
            categories: [...new Set(cars.map(c => c.category.trim()))].filter(Boolean).sort(),
            cities: [...new Set(cars.map(c => c.city.trim()))].filter(Boolean).sort(),
            years: [...new Set(cars.map(c => c.year))].sort((a, b) => b - a),
        });
    } catch (error) {
        next(error);
    }
});

publicRouter.get('/cars/:slug', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const car = await prisma.car.findUnique({
            where: { slug: req.params.slug, isPublished: true },
            include: { agent: true },
        });

        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }

        res.json(formatCar(car));
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// AGENTS
// =============================================================================

publicRouter.get('/agents', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const agents = await prisma.agent.findMany({
            where: { isActive: true },
        });
        res.json(agents.map(formatAgent));
    } catch (error) {
        next(error);
    }
});

publicRouter.get('/agents/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const agent = await prisma.agent.findUnique({
            where: { id: req.params.id, isActive: true },
        });

        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        res.json(formatAgent(agent));
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// SERVICES
// =============================================================================

publicRouter.get('/services', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const services = await prisma.service.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
        });
        res.json(services.map(s => ({ ...s, features: parseJsonArray(s.features) })));
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// FAQ
// =============================================================================

publicRouter.get('/faqs', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category } = req.query;
        const where: any = { isActive: true };
        if (category) where.category = category;

        const faqs = await prisma.fAQ.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
        });
        res.json(faqs);
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// TESTIMONIALS
// =============================================================================

publicRouter.get('/testimonials', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const testimonials = await prisma.testimonial.findMany({
            where: { isActive: true },
        });
        res.json(testimonials);
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// BRANDS
// =============================================================================

publicRouter.get('/brands', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const brands = await prisma.brand.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
        });
        res.json(brands);
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// SETTINGS
// =============================================================================

publicRouter.get('/settings', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        let settings = await prisma.siteSettings.findUnique({
            where: { id: 'default' },
        });

        if (!settings) {
            settings = await prisma.siteSettings.create({
                data: { id: 'default' },
            });
        }

        res.json({
            ...settings,
            socials: parseJsonArray(settings.socials),
        });
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// CONTACT
// =============================================================================

publicRouter.post('/contact', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        await prisma.contactSubmission.create({
            data: { name, email, phone, subject, message },
        });

        res.json({
            success: true,
            message: 'Thank you for your message! We will get back to you within 24 hours.',
        });
    } catch (error) {
        next(error);
    }
});
