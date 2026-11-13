import './config/env.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import fashionRoutes from './routes/fashion.js';
import artGalleryRoutes from './routes/artGallery.js';
import orderRoutes from './routes/orders.js';
import enquiryRoutes from './routes/enquiries.js';
import settingsRoutes from './routes/settings.js';
import uploadRoutes from './routes/upload.js';
import sellerRoutes from './routes/sellers.js';
import moderationRoutes from './routes/moderation.js';
import { validateJwtConfiguration } from './middleware/auth.js';

const jwtStatus = validateJwtConfiguration();
if (!jwtStatus.valid) {
  if (process.env.NODE_ENV === 'production') {
    console.error(`❌ Fatal startup error: ${jwtStatus.error}`);
    process.exit(1);
  } else {
    console.warn(`⚠ Warning: ${jwtStatus.error} Legacy admin JWT authentication will reject requests until configured.`);
  }
} else if (jwtStatus.usingLegacyExampleSecret) {
  console.warn('⚠ Security Notice: JWT_SECRET matches the legacy example placeholder. Replace it with a strong random secret in server/.env or .env.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded static files
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/fashion', fashionRoutes);
app.use('/api/art-gallery', artGalleryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/moderation', moderationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Petal & Thread Atelier API',
    time: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error occurred in Atelier system.'
  });
});

app.listen(PORT, (err) => {
  if (err) {
    console.error(`❌ Failed to start Petal & Thread Backend API on port ${PORT}:`, err.message);
    process.exit(1);
  }
  console.log(`🌸 Petal & Thread Backend API running on http://localhost:${PORT}`);
});
