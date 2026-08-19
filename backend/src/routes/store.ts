import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import type { Request, Response, NextFunction } from 'express';
import https from 'https';

export const storeRouter = Router();

// Helper to parse JSON arrays
const parseJsonArray = (str: string): string[] => {
    try {
        return JSON.parse(str);
    } catch {
        return [];
    }
};

// Helper to format a product for API response
const formatProduct = (product: any) => ({
    ...product,
    images: parseJsonArray(product.images),
});

// Generate unique order number: KD-YYYYMMDD-XXXXX
const generateOrderNumber = (): string => {
    const now = new Date();
    const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const random = Math.floor(10000 + Math.random() * 90000);
    return `KD-${date}-${random}`;
};

// Paystack initialize transaction
const paystackInitialize = (data: {
    email: string;
    amount: number; // in pesewas (GHS * 100)
    reference: string;
    callback_url: string;
    metadata: Record<string, any>;
}): Promise<{ authorization_url: string; access_code: string; reference: string }> => {
    return new Promise((resolve, reject) => {
        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!secretKey || secretKey.includes('REPLACE_WITH')) {
            reject(new Error('Paystack secret key not configured. Please set PAYSTACK_SECRET_KEY in your .env file.'));
            return;
        }

        const postData = JSON.stringify({
            email: data.email,
            amount: data.amount,
            reference: data.reference,
            currency: 'GHS',
            callback_url: data.callback_url,
            metadata: data.metadata,
        });

        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: '/transaction/initialize',
            method: 'POST',
            headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
            },
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (parsed.status) {
                        resolve(parsed.data);
                    } else {
                        reject(new Error(parsed.message || 'Paystack initialization failed'));
                    }
                } catch {
                    reject(new Error('Failed to parse Paystack response'));
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
};

// Paystack verify transaction
const paystackVerify = (reference: string): Promise<{
    status: string;
    amount: number;
    currency: string;
    customer: { email: string };
    metadata: Record<string, any>;
}> => {
    return new Promise((resolve, reject) => {
        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!secretKey || secretKey.includes('REPLACE_WITH')) {
            reject(new Error('Paystack secret key not configured'));
            return;
        }

        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: `/transaction/verify/${encodeURIComponent(reference)}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${secretKey}`,
            },
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (parsed.status) {
                        resolve(parsed.data);
                    } else {
                        reject(new Error(parsed.message || 'Paystack verification failed'));
                    }
                } catch {
                    reject(new Error('Failed to parse Paystack response'));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
};

// =============================================================================
// CATEGORIES
// =============================================================================

storeRouter.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await prisma.productCategory.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: {
                id: true,
                name: true,
                description: true,
                image: true,
                sortOrder: true,
                _count: { select: { products: { where: { isPublished: true, isAvailable: true } } } },
            },
        });

        res.json(categories.map(c => ({ ...c, productCount: c._count.products })));
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// PRODUCTS
// =============================================================================

storeRouter.get('/products', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            category,
            search,
            sort = 'newest',
            featured,
            page = '1',
            limit = '12',
        } = req.query;

        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(50, parseInt(limit as string) || 12);
        const skip = (pageNum - 1) * limitNum;

        const where: any = { isPublished: true, isAvailable: true };

        if (category) where.categoryId = category as string;
        if (featured === 'true') where.isFeatured = true;
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { shortDescription: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        let orderBy: any = { createdAt: 'desc' };
        if (sort === 'price_asc') orderBy = { price: 'asc' };
        else if (sort === 'price_desc') orderBy = { price: 'desc' };
        else if (sort === 'name_asc') orderBy = { name: 'asc' };

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy,
                skip,
                take: limitNum,
                include: { category: { select: { id: true, name: true } } },
            }),
            prisma.product.count({ where }),
        ]);

        res.json({
            products: products.map(formatProduct),
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        next(error);
    }
});

storeRouter.get('/products/featured', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await prisma.product.findMany({
            where: { isPublished: true, isAvailable: true, isFeatured: true },
            orderBy: { createdAt: 'desc' },
            take: 8,
            include: { category: { select: { id: true, name: true } } },
        });
        res.json(products.map(formatProduct));
    } catch (error) {
        next(error);
    }
});

storeRouter.get('/products/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id, isPublished: true },
            include: { category: { select: { id: true, name: true } } },
        });

        if (!product) throw new AppError('Product not found', 404);
        res.json(formatProduct(product));
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// CART VALIDATION (server-side)
// =============================================================================

storeRouter.post('/cart/validate', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new AppError('Cart items are required', 400);
        }

        const validatedItems: Array<{
            productId: string; name: string; price: number; originalPrice: number;
            quantity: number; subtotal: number; image: string | null; stock: number;
        }> = [];
        const warnings: Array<Record<string, any>> = [];

        for (const item of items) {
            if (!item.productId || !item.quantity || item.quantity < 1) {
                throw new AppError('Invalid cart item format', 400);
            }

            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { id: true, name: true, price: true, discountPrice: true, stock: true, isAvailable: true, isPublished: true, images: true },
            });

            if (!product || !product.isPublished) {
                warnings.push({ productId: item.productId, issue: 'Product no longer available', removed: true });
                continue;
            }

            if (!product.isAvailable) {
                warnings.push({ productId: item.productId, name: product.name, issue: 'Product is currently unavailable', removed: true });
                continue;
            }

            const requestedQty = Math.min(item.quantity, product.stock);
            if (requestedQty === 0) {
                warnings.push({ productId: item.productId, name: product.name, issue: 'Out of stock', removed: true });
                continue;
            }

            if (requestedQty < item.quantity) {
                warnings.push({ productId: item.productId, name: product.name, issue: `Only ${product.stock} available`, quantityAdjusted: true });
            }

            const effectivePrice = product.discountPrice ?? product.price;

            validatedItems.push({
                productId: product.id,
                name: product.name,
                price: effectivePrice,
                originalPrice: product.price,
                quantity: requestedQty,
                subtotal: parseFloat((effectivePrice * requestedQty).toFixed(2)),
                image: parseJsonArray(product.images)[0] || null,
                stock: product.stock,
            });
        }

        const subtotal = parseFloat(validatedItems.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2));

        res.json({ items: validatedItems, subtotal, warnings });
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// CHECKOUT — create order + initialize Paystack
// =============================================================================

storeRouter.post('/checkout', apiLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { customerName, customerEmail, customerPhone, deliveryAddress, notes, items } = req.body;

        // Validate required fields
        if (!customerName || !customerEmail || !items || !Array.isArray(items) || items.length === 0) {
            throw new AppError('Customer name, email, and cart items are required', 400);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
            throw new AppError('Invalid email address', 400);
        }

        // SERVER-SIDE: Re-fetch all prices and validate stock — never trust client
        const validatedItems: Array<{
            product: { id: string; name: string; price: number; discountPrice: number | null; stock: number; images: string };
            quantity: number; price: number; subtotal: number;
        }> = [];
        for (const item of items) {
            if (!item.productId || !item.quantity || item.quantity < 1) {
                throw new AppError('Invalid item in cart', 400);
            }

            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { id: true, name: true, price: true, discountPrice: true, stock: true, isAvailable: true, isPublished: true, images: true },
            });

            if (!product || !product.isPublished || !product.isAvailable) {
                throw new AppError(`Product "${item.productId}" is no longer available`, 400);
            }

            if (product.stock < item.quantity) {
                throw new AppError(`Insufficient stock for "${product.name}". Available: ${product.stock}`, 400);
            }

            const effectivePrice = product.discountPrice ?? product.price;
            validatedItems.push({
                product,
                quantity: item.quantity,
                price: effectivePrice,
                subtotal: parseFloat((effectivePrice * item.quantity).toFixed(2)),
            });
        }

        const subtotal = parseFloat(validatedItems.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2));
        const total = subtotal; // No shipping or discount at checkout level currently

        // Generate unique order number and Paystack reference
        let orderNumber = generateOrderNumber();
        // Ensure uniqueness (very unlikely collision, but safe)
        while (await prisma.order.findUnique({ where: { orderNumber } })) {
            orderNumber = generateOrderNumber();
        }
        const paystackRef = `${orderNumber}-${Date.now()}`;

        // Create order with PENDING status (payment not yet confirmed)
        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    orderNumber,
                    customerName: customerName.trim(),
                    customerEmail: customerEmail.toLowerCase().trim(),
                    customerPhone: customerPhone?.trim() || null,
                    deliveryAddress: deliveryAddress?.trim() || null,
                    notes: notes?.trim() || null,
                    subtotal,
                    discount: 0,
                    total,
                    paymentStatus: 'PENDING',
                    orderStatus: 'PENDING',
                    paystackRef,
                },
            });

            // Create order items (price snapshot)
            await tx.orderItem.createMany({
                data: validatedItems.map(vi => ({
                    orderId: newOrder.id,
                    productId: vi.product.id,
                    productName: vi.product.name,
                    productImage: parseJsonArray(vi.product.images)[0] || null,
                    price: vi.price,
                    quantity: vi.quantity,
                    subtotal: vi.subtotal,
                })),
            });

            return newOrder;
        });

        // Initialize Paystack payment
        const amountInPesewas = Math.round(total * 100); // GHS to pesewas
        try {
            const frontendUrl = process.env.FRONTEND_URL || 'https://kaysdrive.com';
            const callbackUrl = `${frontendUrl}/order-confirmation/${order.orderNumber}?email=${encodeURIComponent(order.customerEmail)}&ref=${paystackRef}`;

            const paystackData = await paystackInitialize({
                email: order.customerEmail,
                amount: amountInPesewas,
                reference: paystackRef,
                callback_url: callbackUrl,
                metadata: {
                    orderNumber: order.orderNumber,
                    customerName: order.customerName,
                    orderId: order.id,
                },
            });

            res.json({
                success: true,
                orderNumber: order.orderNumber,
                orderId: order.id,
                total,
                paymentUrl: paystackData.authorization_url,
                paystackRef,
            });
        } catch (paystackError: any) {
            // If Paystack init fails, keep order as PENDING but return an error
            console.error('Paystack initialization error:', paystackError.message);
            res.json({
                success: true,
                orderNumber: order.orderNumber,
                orderId: order.id,
                total,
                paymentUrl: null,
                paystackRef,
                paymentError: 'Payment gateway temporarily unavailable. Please try again or contact support.',
            });
        }
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// PAYMENT VERIFICATION
// =============================================================================

storeRouter.post('/payment/verify', apiLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { reference } = req.body;

        if (!reference) throw new AppError('Payment reference is required', 400);

        // Find order by Paystack reference
        const order = await prisma.order.findUnique({
            where: { paystackRef: reference },
            include: { items: true },
        });

        if (!order) throw new AppError('Order not found for this reference', 404);

        // If already paid, return success (idempotent)
        if (order.paymentStatus === 'PAID') {
            return res.json({
                success: true,
                alreadyVerified: true,
                orderNumber: order.orderNumber,
                orderStatus: order.orderStatus,
                paymentStatus: order.paymentStatus,
            });
        }

        // Verify with Paystack
        let paystackData: any;
        try {
            paystackData = await paystackVerify(reference);
        } catch (verifyError: any) {
            console.error('Paystack verify error:', verifyError.message);
            throw new AppError('Could not verify payment with Paystack', 502);
        }

        const paystackStatus = paystackData.status;
        const expectedAmountPesewas = Math.round(order.total * 100);
        const receivedAmountPesewas = paystackData.amount;

        if (paystackStatus === 'success' && receivedAmountPesewas >= expectedAmountPesewas) {
            // Payment successful — update order and decrement stock
            await prisma.$transaction(async (tx) => {
                // Mark order as paid and confirmed
                await tx.order.update({
                    where: { id: order.id },
                    data: {
                        paymentStatus: 'PAID',
                        orderStatus: 'CONFIRMED',
                    },
                });

                // Decrement stock for each ordered product
                for (const item of order.items) {
                    if (item.productId) {
                        await tx.product.update({
                            where: { id: item.productId },
                            data: {
                                stock: { decrement: item.quantity },
                            },
                        });

                        // Auto-mark as unavailable if out of stock
                        const updatedProduct = await tx.product.findUnique({
                            where: { id: item.productId },
                            select: { stock: true },
                        });
                        if (updatedProduct && updatedProduct.stock <= 0) {
                            await tx.product.update({
                                where: { id: item.productId },
                                data: { isAvailable: false },
                            });
                        }
                    }
                }
            });

            return res.json({
                success: true,
                orderNumber: order.orderNumber,
                orderStatus: 'CONFIRMED',
                paymentStatus: 'PAID',
            });
        } else if (paystackStatus === 'failed' || paystackStatus === 'abandoned') {
            // Payment failed
            await prisma.order.update({
                where: { id: order.id },
                data: { paymentStatus: 'FAILED' },
            });

            return res.json({
                success: false,
                orderNumber: order.orderNumber,
                orderStatus: order.orderStatus,
                paymentStatus: 'FAILED',
                message: 'Payment was not successful',
            });
        } else {
            // Still pending
            return res.json({
                success: false,
                orderNumber: order.orderNumber,
                orderStatus: order.orderStatus,
                paymentStatus: 'PENDING',
                message: 'Payment is still being processed',
            });
        }
    } catch (error) {
        next(error);
    }
});

// =============================================================================
// ORDER LOOKUP (public — requires orderNumber + email for privacy)
// =============================================================================

storeRouter.get('/orders/:orderNumber', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.query;

        if (!email) throw new AppError('Email is required to look up an order', 400);

        const order = await prisma.order.findUnique({
            where: { orderNumber: req.params.orderNumber },
            include: { items: true },
        });

        if (!order || order.customerEmail.toLowerCase() !== (email as string).toLowerCase().trim()) {
            throw new AppError('Order not found', 404);
        }

        // Don't expose paystackRef to public
        const { paystackRef: _, ...safeOrder } = order;
        res.json(safeOrder);
    } catch (error) {
        next(error);
    }
});
