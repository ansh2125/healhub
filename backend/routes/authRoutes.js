import express from 'express';
import {
    registerPatient,
    registerDoctor,
    login,
    getMe,
    updateProfile,
    changePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerPatient);
router.post('/register/doctor', registerDoctor);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

export default router;