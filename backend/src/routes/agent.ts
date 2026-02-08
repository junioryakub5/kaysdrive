import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import { config } from '../utils/config.js';
import { agentAuthMiddleware, type AgentRequest } from '../middleware/agentAuth.js';

export const agentRouter = Router();

// Helper to parse JSON fields
const parseCarFields = (car: any) => ({
    ...car,
    images: JSON.parse(car.images || '[]'),
    features: JSON.parse(car.features || '[]'),
});

// Agent login
agentRouter.post('/login', async (req, res) => {
    try {
        console.log('Agent login attempt:', req.body.email);
        const { email, password } = req.body;

        const agent = await prisma.agent.findUnique({ where: { email } });
        console.log('Agent found:', agent ? agent.email : 'not found');

        if (!agent || !agent.isActive) {
            console.log('Agent not found or inactive');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // First-time login: if no password set, set it now
        if (!agent.password) {
            console.log('First-time login, setting password');
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.agent.update({
                where: { id: agent.id },
                data: { password: hashedPassword },
            });
            console.log('Password set successfully');
        } else {
            console.log('Verifying existing password');
            // Verify password
            const valid = await bcrypt.compare(password, agent.password);
            if (!valid) {
                console.log('Password verification failed');
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            console.log('Password verified');
        }

        console.log('Signing JWT token');
        const token = jwt.sign({ agentId: agent.id, type: 'agent' }, config.jwtSecret as string, {
            expiresIn: '24h',
        } as jwt.SignOptions);
        console.log('Token signed successfully');

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
        console.error('Agent login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


// Note: Agent auth middleware moved to ../middleware/agentAuth.ts

// Get current agent
agentRouter.get('/me', agentAuthMiddleware, async (req: AgentRequest, res) => {
    res.json({ agent: req.agent });
});

// Update current agent profile
agentRouter.put('/me', agentAuthMiddleware, async (req: AgentRequest, res) => {
    try {
        const { name, role, phone, avatar, bio, password } = req.body;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (role) updateData.role = role;
        if (phone) updateData.phone = phone;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (bio !== undefined) updateData.bio = bio;

        // Hash new password if provided
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedAgent = await prisma.agent.update({
            where: { id: req.agent!.id },
            data: updateData,
        });

        const { password: _, ...agentWithoutPassword } = updatedAgent;
        res.json({ agent: agentWithoutPassword });
    } catch (error) {
        console.error('Error updating agent profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get agent's cars
agentRouter.get('/cars', agentAuthMiddleware, async (req: AgentRequest, res) => {
    try {
        const cars = await prisma.car.findMany({
            where: { agentId: req.agent!.id },
            orderBy: { createdAt: 'desc' },
        });
        res.json(cars.map(parseCarFields));
    } catch (error) {
        console.error('Error fetching agent cars:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get agent stats
agentRouter.get('/stats', agentAuthMiddleware, async (req: AgentRequest, res) => {
    try {
        const [totalCars, publishedCars, featuredCars] = await Promise.all([
            prisma.car.count({ where: { agentId: req.agent!.id } }),
            prisma.car.count({ where: { agentId: req.agent!.id, isPublished: true } }),
            prisma.car.count({ where: { agentId: req.agent!.id, isFeatured: true } }),
        ]);
        res.json({ totalCars, publishedCars, featuredCars });
    } catch (error) {
        console.error('Error fetching agent stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new car
agentRouter.post('/cars', agentAuthMiddleware, async (req: AgentRequest, res) => {
    try {
        const { title, price, priceType, status, category, manufacturer, year, mileage, engine, fuel, transmission, city, images, features, description } = req.body;

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
        console.error('Error creating car:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update agent's own car
agentRouter.put('/cars/:id', agentAuthMiddleware, async (req: AgentRequest, res) => {
    try {
        const { id } = req.params;

        // Check ownership
        const existingCar = await prisma.car.findFirst({
            where: { id, agentId: req.agent!.id },
        });

        if (!existingCar) {
            return res.status(404).json({ error: 'Car not found or not yours' });
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
        console.error('Error updating car:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete agent's own car
agentRouter.delete('/cars/:id', agentAuthMiddleware, async (req: AgentRequest, res) => {
    try {
        const { id } = req.params;

        // Check ownership
        const existingCar = await prisma.car.findFirst({
            where: { id, agentId: req.agent!.id },
        });

        if (!existingCar) {
            return res.status(404).json({ error: 'Car not found or not yours' });
        }

        await prisma.car.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting car:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
