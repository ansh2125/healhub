import express from 'express';
import {
    createReview,
    getDoctorReviews,
    updateReview,
    deleteReview,
    markHelpful
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/doctor/:doctorId', getDoctorReviews);

router.use(protect);

router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.post('/:id/helpful', markHelpful);

export default router;