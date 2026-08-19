import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { authMiddleware } from '../middleware/auth.js';
import { agentAuthMiddleware } from '../middleware/agentAuth.js';

const uploadRouter = express.Router();

// Configure Cloudinary from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage instead of disk (for Cloudinary upload)
const storage = multer.memoryStorage();

// File filter to only accept images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit (was 100MB — unreasonable for images)
    },
});

// Helper: Upload buffer to Cloudinary
const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `kaysdrive/${folder}`,
                resource_type: 'image',
                transformation: [
                    { width: 1200, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
                ],
            },
            (error, result) => {
                if (error) return reject(error);
                if (result) return resolve(result.secure_url);
                reject(new Error('Upload failed'));
            }
        );
        const readable = Readable.from(buffer);
        readable.pipe(uploadStream);
    });
};

// Combined auth middleware: accepts either admin or agent tokens
const adminOrAgentAuth = async (req: Request, res: Response, next: NextFunction) => {
    // Try admin auth first
    try {
        await authMiddleware(req as any, res, (err?: any) => {
            if (!err) return next();
            // If admin auth failed, try agent auth
            agentAuthMiddleware(req as any, res, next);
        });
    } catch {
        // If admin auth threw, try agent auth
        agentAuthMiddleware(req as any, res, next);
    }
};

// Upload single image (cars) — requires admin or agent auth
uploadRouter.post('/single', adminOrAgentAuth, upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const imageUrl = await uploadToCloudinary(req.file.buffer, 'cars');
        res.json({ url: imageUrl });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Upload multiple images for cars (max 10) — requires admin or agent auth
uploadRouter.post('/multiple', adminOrAgentAuth, upload.array('images', 10), async (req: Request, res: Response) => {
    try {
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const files = req.files as Express.Multer.File[];
        const uploadPromises = files.map(file => uploadToCloudinary(file.buffer, 'cars'));
        const imageUrls = await Promise.all(uploadPromises);

        res.json({ urls: imageUrls });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload images' });
    }
});

// Upload multiple images for products (max 10) — requires admin auth
uploadRouter.post('/products/multiple', adminOrAgentAuth, upload.array('images', 10), async (req: Request, res: Response) => {
    try {
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const files = req.files as Express.Multer.File[];
        const uploadPromises = files.map(file => uploadToCloudinary(file.buffer, 'products'));
        const imageUrls = await Promise.all(uploadPromises);

        res.json({ urls: imageUrls });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload images' });
    }
});

// Upload single product image — requires admin auth
uploadRouter.post('/products/single', adminOrAgentAuth, upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const imageUrl = await uploadToCloudinary(req.file.buffer, 'products');
        res.json({ url: imageUrl });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Error handling middleware for multer
uploadRouter.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size is too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ error: err.message });
    }
    next(err);
});

export { uploadRouter };
