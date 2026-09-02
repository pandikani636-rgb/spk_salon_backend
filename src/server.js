import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import salonRoutes from './routes/salonRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import salonCategoryRoutes from './routes/salonCategoryRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import path from 'path';

dotenv.config();

const app = express();

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// Dynamic CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : [process.env.FRONTEND_URL];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// Ensure DB is connected for serverless functions
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url);
  next();
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/salons', salonRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/owner', ownerRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/salon-categories', salonCategoryRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/banners', bannerRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/leaves', leaveRoutes);

// Default Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Apex Salon Booking API',
    status: 'Running'
  });
});

// Serve static uploads
const __dirname = path.resolve();
if (process.env.VERCEL) {
  app.use('/uploads', express.static('/tmp/uploads'));
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error Handling
app.use(errorHandler);

// Only listen locally, Vercel will handle listening in production
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

export default app;
