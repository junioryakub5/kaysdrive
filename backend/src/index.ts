import express from 'express';
import cors from 'cors';
import { config } from './utils/config.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import { publicRouter } from './routes/public.js';
import { adminRouter } from './routes/admin.js';
import { agentRouter } from './routes/agent.js';
import { uploadRouter } from './routes/upload.js';

const app = express();

// Middleware - Allow frontend, admin, and agent portal origins
const allowedOrigins = config.corsOrigin ? config.corsOrigin.split(',') : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Root health check for Railway
app.get('/', (_req, res) => {
    res.json({ status: 'ok', service: 'Kays Drive Backend', timestamp: new Date().toISOString() });
});

// API health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api', publicRouter);
app.use('/api/admin', adminRouter);
app.use('/api/agent', agentRouter);
app.use('/api/upload', uploadRouter);


// Error handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
    console.log(`🚀 Backend server running on http://localhost:${config.port}`);
    console.log(`📊 Admin API: http://localhost:${config.port}/api/admin`);
});
