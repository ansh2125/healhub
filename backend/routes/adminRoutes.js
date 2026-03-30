import express from 'express';
import {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllDoctors,
    updateDoctor,
    deleteDoctor,
    getAllAppointments,
    getDashboardStats
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(admin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Doctors management
router.get('/doctors', getAllDoctors);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);

// Appointments management
router.get('/appointments', getAllAppointments);

export default router;