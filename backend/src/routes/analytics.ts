import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import crypto from 'crypto';

const router = Router();

// Helper function to hash IP address for privacy
function hashIP(ip: string): string {
    return crypto.createHash('sha256').update(ip + 'salt-secret-key').digest('hex');
}

// Helper to get client IP
function getClientIP(req: Request): string {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
        req.headers['x-real-ip'] as string ||
        req.socket.remoteAddress ||
        'unknown';
}

// PUBLIC: Track page view
router.post('/track', async (req: Request, res: Response) => {
    try {
        const { page, referrer } = req.body;

        if (!page) {
            return res.status(400).json({ error: 'Page is required' });
        }

        const ip = getClientIP(req);
        const ipHash = hashIP(ip);
        const userAgent = req.headers['user-agent'] || '';

        await prisma.pageView.create({
            data: {
                ipHash,
                userAgent,
                page,
                referrer: referrer || null,
            },
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error tracking page view:', error);
        res.status(500).json({ error: 'Failed to track page view' });
    }
});

// ADMIN: Get analytics stats
router.get('/stats', async (req: Request, res: Response) => {
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
        console.error('Error fetching analytics stats:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

export default router;
