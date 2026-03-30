import express from 'express';
import {
    createAppointment,
    getMyAppointments,
    getDoctorAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    cancelAppointment,
    rescheduleAppointment
} from '../controllers/appointmentController.js';
import { protect, doctor } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Patient routes
router.post('/', createAppointment);
router.get('/my', getMyAppointments);
router.put('/:id/cancel', cancelAppointment);
router.put('/:id/reschedule', rescheduleAppointment);

// Doctor routes
router.get('/doctor', doctor, getDoctorAppointments);
router.put('/:id/status', doctor, updateAppointmentStatus);

// Common
router.get('/:id', getAppointmentById);

export default router;