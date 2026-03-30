import express from 'express';
import {
    getUserGrowth,
    getAppointmentAnalytics,
    getRevenueAnalytics,
    getDoctorPerformance,
    getPatientAnalytics,
    getDoctorAnalytics
} from '../controllers/analyticsController.js';
import { protect, admin, doctor } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Admin analytics
router.get('/user-growth', admin, getUserGrowth);
router.get('/appointments', admin, getAppointmentAnalytics);
router.get('/revenue', admin, getRevenueAnalytics);
router.get('/doctor-performance', admin, getDoctorPerformance);

// Patient analytics
router.get('/patient', getPatientAnalytics);

// Doctor analytics
router.get('/doctor', doctor, getDoctorAnalytics);

export default router;