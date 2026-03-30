import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();

// Connect to database
connectDB();

const app = express();

// ===============================
// ✅ CORS CONFIG (FINAL FIX)
// ===============================
const corsOptions = {
    origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://healhub-two.vercel.app/" // later replace with real
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};

// 🔥 Apply CORS
app.use(cors(corsOptions));

// 🔥 VERY IMPORTANT (fix preflight error)
app.options("*", cors(corsOptions));

// ===============================
// Middleware
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ===============================
// API Routes
// ===============================
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reviews', reviewRoutes);

// ===============================
// Health check
// ===============================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'HealHub API is running',
        timestamp: new Date().toISOString()
    });
});

// ===============================
// Error handling
// ===============================
app.use(notFound);
app.use(errorHandler);

// ===============================
// Server start
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
🏥 HealHub API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Server running in ${process.env.NODE_ENV} mode
🌐 Port: ${PORT}
📡 API: http://localhost:${PORT}/api
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});