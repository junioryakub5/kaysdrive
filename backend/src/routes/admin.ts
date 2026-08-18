import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import { config } from '../utils/config.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import type { Request, Response, NextFunction } from 'express';
import { loginLimiter } from '../middleware/rateLimiter.js';

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

adminRouter.post('/login', loginLimiter, async (req: Request, res: Response, next: NextFunction) => {
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
        const [totalCars, totalAgents, totalContacts, unreadContacts, totalOrders, pendingOrders, paidOrders, cancelledOrders] = await Promise.all([
            prisma.car.count(),
            prisma.agent.count({ where: { isActive: true } }),
            prisma.contactSubmission.count(),
            prisma.contactSubmission.count({ where: { isRead: false } }),
            prisma.order.count(),
            prisma.order.count({ where: { orderStatus: 'PENDING' } }),
            prisma.order.count({ where: { paymentStatus: 'PAID' } }),
            prisma.order.count({ where: { orderStatus: 'CANCELLED' } }),
        ]);

        // Calculate total sales revenue from paid orders
        const salesAggregate = await prisma.order.aggregate({
            where: { paymentStatus: 'PAID' },
            _sum: { total: true },
        });

        // Recent orders (last 5)
        const recentOrders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true, orderNumber: true, customerName: true,
                total: true, orderStatus: true, paymentStatus: true, createdAt: true,
            },
        });

        // Low stock products (stock < 5)
        const lowStockProducts = await prisma.product.findMany({
            where: { isPublished: true, stock: { lt: 5 } },
            orderBy: { stock: 'asc' },
            take: 5,
            select: { id: true, name: true, stock: true, isAvailable: true },
        });

        res.json({
            totalCars,
            totalAgents,
            totalContacts,
            unreadContacts,
            // E-commerce stats
            totalOrders,
            pendingOrders,
            paidOrders,
            cancelledOrders,
            totalRevenue: salesAggregate._sum.total || 0,
            recentOrders,
            lowStockProducts,
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
        const { images, features, priceType, status, fuel, transmission, slug, ...data } = req.body;

        // Sanitize slug: trim, lowercase, replace spaces with hyphens, remove special chars
        const sanitizeSlug = (str: string): string => {
            return str
                .trim()                           // Remove leading/trailing spaces
                .toLowerCase()                    // Convert to lowercase
                .replace(/\s+/g, '-')            // Replace spaces with hyphens
                .replace(/[^\w\-]+/g, '')        // Remove special characters except hyphens
                .replace(/\-\-+/g, '-')          // Replace multiple hyphens with single
                .replace(/^-+/, '')              // Remove leading hyphens
                .replace(/-+$/, '');             // Remove trailing hyphens
        };

        // Validate and ensure unique slug
        let uniqueSlug = sanitizeSlug(slug);
        const originalSlug = slug;
        const existingCar = await prisma.car.findUnique({
            where: { slug: uniqueSlug },
        });

        if (existingCar) {
            // Auto-generate unique slug by appending number
            let counter = 2;
            let newSlug = `${uniqueSlug}-${counter}`;

            while (await prisma.car.findUnique({ where: { slug: newSlug } })) {
                counter++;
                newSlug = `${uniqueSlug}-${counter}`;
            }

            console.log(`Slug '${uniqueSlug}' already exists. Auto-generated unique slug: '${newSlug}'`);
            uniqueSlug = newSlug;
        }

        const car = await prisma.car.create({
            data: {
                ...data,
                slug: uniqueSlug,
                images: stringifyJson(images || []),
                features: stringifyJson(features || []),
                priceType: priceType?.toUpperCase() || 'FIXED',
                status: status?.toUpperCase() || 'FOREIGN_USED',
                fuel: fuel?.toUpperCase() || 'GASOLINE',
                transmission: transmission?.toUpperCase() || 'AUTOMATIC',
            },
        });

        res.status(201).json({
            ...car,
            _slugWasModified: uniqueSlug !== originalSlug,
            _originalSlug: originalSlug,
            _sanitizedSlug: uniqueSlug,
        });
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

adminRouter.patch('/cars/:id/sold', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const car = await prisma.car.findUnique({ where: { id: req.params.id } });
        if (!car) throw new AppError('Car not found', 404);

        const updated = await prisma.car.update({
            where: { id: req.params.id },
            data: { isSold: !car.isSold },
        });

        res.json({ success: true, isSold: updated.isSold });
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

// =============================================================================
// ANALYTICS
// =============================================================================

adminRouter.get('/analytics/stats', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Total page views
        const totalPageViews = await prisma.pageView.count();

        // Total unique visitors (unique IP hashes)
        const uniqueVisitors = await prisma.pageView.groupBy({
            by: ['ipHash'],
        });

        // Today's visitors
        const todayVisitors = await prisma.pageView.groupBy({
            by: ['ipHash'],
            where: {
                createdAt: { gte: todayStart },
            },
        });

        // This week's visitors
        const weekVisitors = await prisma.pageView.groupBy({
            by: ['ipHash'],
            where: {
                createdAt: { gte: weekStart },
            },
        });

        // Popular pages (top 10)
        const pageViewsByPage = await prisma.pageView.groupBy({
            by: ['page'],
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: 'desc',
                },
            },
            take: 10,
        });

        const popularPages = pageViewsByPage.map((p: any) => ({
            page: p.page,
            views: p._count.id,
        }));

        res.json({
            totalPageViews,
            totalVisitors: uniqueVisitors.length,
            todayVisitors: todayVisitors.length,
            weekVisitors: weekVisitors.length,
            popularPages,
        });
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// PRODUCT CATEGORIES CRUD
// =============================================================================

adminRouter.get('/categories', authMiddleware, async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await prisma.productCategory.findMany({
            orderBy: { sortOrder: 'asc' },
            include: { _count: { select: { products: true } } },
        });
        res.json(categories.map(c => ({ ...c, productCount: c._count.products })));
    } catch (error) {
        next(error);
    }
});

adminRouter.post('/categories', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, image, sortOrder, isActive } = req.body;
        if (!name) throw new AppError('Category name is required', 400);
        const category = await prisma.productCategory.create({
            data: { name, description, image, sortOrder: sortOrder ?? 0, isActive: isActive ?? true },
        });
        res.status(201).json(category);
    } catch (error) {
        next(error);
    }
});

adminRouter.put('/categories/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, image, sortOrder, isActive } = req.body;
        const category = await prisma.productCategory.update({
            where: { id: req.params.id },
            data: { name, description, image, sortOrder, isActive },
        });
        res.json(category);
    } catch (error) {
        next(error);
    }
});

adminRouter.delete('/categories/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.productCategory.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// PRODUCTS CRUD
// =============================================================================

const parseProductImages = (str: string): string[] => {
    try { return JSON.parse(str); } catch { return []; }
};

adminRouter.get('/products', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { search, category, page = '1', limit = '50' } = req.query;
        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, parseInt(limit as string) || 50);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (category) where.categoryId = category as string;
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { sku: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
                include: { category: { select: { id: true, name: true } } },
            }),
            prisma.product.count({ where }),
        ]);

        res.json({
            products: products.map(p => ({ ...p, images: parseProductImages(p.images) })),
            pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
        });
    } catch (error) {
        next(error);
    }
});

adminRouter.get('/products/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: { category: { select: { id: true, name: true } } },
        });
        if (!product) throw new AppError('Product not found', 404);
        res.json({ ...product, images: parseProductImages(product.images) });
    } catch (error) {
        next(error);
    }
});

adminRouter.post('/products', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            name, shortDescription, description, categoryId,
            price, discountPrice, sku, stock, images,
            isAvailable, isFeatured, isPublished,
        } = req.body;

        if (!name || !description || price === undefined) {
            throw new AppError('Name, description, and price are required', 400);
        }

        const product = await prisma.product.create({
            data: {
                name, shortDescription, description,
                categoryId: categoryId || null,
                price: parseFloat(price),
                discountPrice: discountPrice ? parseFloat(discountPrice) : null,
                sku: sku || null,
                stock: parseInt(stock) || 0,
                images: JSON.stringify(images || []),
                isAvailable: isAvailable ?? true,
                isFeatured: isFeatured ?? false,
                isPublished: isPublished ?? true,
            },
        });
        res.status(201).json({ ...product, images: parseProductImages(product.images) });
    } catch (error) {
        next(error);
    }
});

adminRouter.put('/products/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            name, shortDescription, description, categoryId,
            price, discountPrice, sku, stock, images,
            isAvailable, isFeatured, isPublished,
        } = req.body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
        if (description !== undefined) updateData.description = description;
        if (categoryId !== undefined) updateData.categoryId = categoryId || null;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (discountPrice !== undefined) updateData.discountPrice = discountPrice ? parseFloat(discountPrice) : null;
        if (sku !== undefined) updateData.sku = sku || null;
        if (stock !== undefined) updateData.stock = parseInt(stock);
        if (images !== undefined) updateData.images = JSON.stringify(images);
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
        if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
        if (isPublished !== undefined) updateData.isPublished = isPublished;

        const product = await prisma.product.update({
            where: { id: req.params.id },
            data: updateData,
        });
        res.json({ ...product, images: parseProductImages(product.images) });
    } catch (error) {
        next(error);
    }
});

adminRouter.delete('/products/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.product.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

adminRouter.patch('/products/:id/publish', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await prisma.product.findUnique({ where: { id: req.params.id } });
        if (!product) throw new AppError('Product not found', 404);
        const updated = await prisma.product.update({
            where: { id: req.params.id },
            data: { isPublished: !product.isPublished },
        });
        res.json({ success: true, isPublished: updated.isPublished });
    } catch (error) {
        next(error);
    }
});

adminRouter.patch('/products/:id/feature', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await prisma.product.findUnique({ where: { id: req.params.id } });
        if (!product) throw new AppError('Product not found', 404);
        const updated = await prisma.product.update({
            where: { id: req.params.id },
            data: { isFeatured: !product.isFeatured },
        });
        res.json({ success: true, isFeatured: updated.isFeatured });
    } catch (error) {
        next(error);
    }
});

adminRouter.patch('/products/:id/availability', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await prisma.product.findUnique({ where: { id: req.params.id } });
        if (!product) throw new AppError('Product not found', 404);
        const updated = await prisma.product.update({
            where: { id: req.params.id },
            data: { isAvailable: !product.isAvailable },
        });
        res.json({ success: true, isAvailable: updated.isAvailable });
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// ORDERS (Admin View)
// =============================================================================

adminRouter.get('/orders', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { search, orderStatus, paymentStatus, page = '1', limit = '20' } = req.query;
        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, parseInt(limit as string) || 20);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (orderStatus) where.orderStatus = orderStatus as string;
        if (paymentStatus) where.paymentStatus = paymentStatus as string;
        if (search) {
            where.OR = [
                { orderNumber: { contains: search as string, mode: 'insensitive' } },
                { customerName: { contains: search as string, mode: 'insensitive' } },
                { customerEmail: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
                include: { items: true },
            }),
            prisma.order.count({ where }),
        ]);

        res.json({
            orders,
            pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
        });
    } catch (error) {
        next(error);
    }
});

adminRouter.get('/orders/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.id },
            include: { items: { include: { product: { select: { id: true, name: true, images: true, stock: true } } } } },
        });
        if (!order) throw new AppError('Order not found', 404);
        res.json(order);
    } catch (error) {
        next(error);
    }
});

adminRouter.patch('/orders/:id/status', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orderStatus, paymentStatus } = req.body;

        const validOrderStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];
        const validPaymentStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

        const updateData: any = {};
        if (orderStatus) {
            if (!validOrderStatuses.includes(orderStatus)) throw new AppError('Invalid order status', 400);
            updateData.orderStatus = orderStatus;
        }
        if (paymentStatus) {
            if (!validPaymentStatuses.includes(paymentStatus)) throw new AppError('Invalid payment status', 400);
            updateData.paymentStatus = paymentStatus;
        }

        if (Object.keys(updateData).length === 0) throw new AppError('No status to update', 400);

        const order = await prisma.order.update({
            where: { id: req.params.id },
            data: updateData,
        });
        res.json({ success: true, order });
    } catch (error) {
        next(error);
    }
});
