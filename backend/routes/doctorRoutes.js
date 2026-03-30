import express from 'express';
import {
    getDoctors,
    getDoctorById,
    getDoctorSlots,
    updateAvailability,
    getDoctorPatients,
    getSpecializations
} from '../controllers/doctorController.js';
import { protect, doctor } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/specializations', getSpecializations);
router.get('/:id', getDoctorById);
router.get('/:id/slots', getDoctorSlots);

// Doctor protected routes
router.put('/availability', protect, doctor, updateAvailability);
router.get('/my/patients', protect, doctor, getDoctorPatients);

export default router;