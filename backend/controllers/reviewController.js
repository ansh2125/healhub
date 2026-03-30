import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Appointment from '../models/Appointment.js';
import { paginateResults } from '../utils/helpers.js';

// @desc    Create review
// @route   POST /api/reviews
// @access  Private (Patient)
export const createReview = asyncHandler(async (req, res) => {
    const { appointmentId, rating, title, comment } = req.body;

    // Check if appointment exists and belongs to user
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
        res.status(404);
        throw new Error('Appointment not found');
    }

    if (appointment.patient.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to review this appointment');
    }

    if (appointment.status !== 'completed') {
        res.status(400);
        throw new Error('Can only review completed appointments');
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ appointment: appointmentId });
    if (existingReview) {
        res.status(400);
        throw new Error('You have already reviewed this appointment');
    }

    // Create review
    const review = await Review.create({
        patient: req.user._id,
        doctor: appointment.doctor,
        appointment: appointmentId,
        rating,
        title,
        comment
    });

    const populatedReview = await Review.findById(review._id)
        .populate('patient', 'name avatar')
        .populate('doctor', 'name specialization');

    res.status(201).json({
        success: true,
        data: populatedReview
    });
});

// @desc    Get doctor reviews
// @route   GET /api/reviews/doctor/:doctorId
// @access  Public
export const getDoctorReviews = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createdAt' } = req.query;
    const { skip, limit: limitNum } = paginateResults(page, limit);

    const [reviews, total] = await Promise.all([
        Review.find({ doctor: req.params.doctorId })
            .populate('patient', 'name avatar')
            .sort({ [sortBy]: -1 })
            .skip(skip)
            .limit(limitNum),
        Review.countDocuments({ doctor: req.params.doctorId })
    ]);

    // Calculate rating distribution
    const ratingDistribution = await Review.aggregate([
        { $match: { doctor: req.params.doctorId } },
        {
            $group: {
                _id: '$rating',
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: -1 } }
    ]);

    res.json({
        success: true,
        data: reviews,
        ratingDistribution: ratingDistribution.map(r => ({
            rating: r._id,
            count: r.count
        })),
        pagination: {
            page: Number(page),
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
        }
    });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Patient)
export const updateReview = asyncHandler(async (req, res) => {
    const { rating, title, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    if (review.patient.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this review');
    }

    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;

    await review.save();

    res.json({
        success: true,
        data: review
    });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Patient/Admin)
export const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    const isOwner = review.patient.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
        res.status(403);
        throw new Error('Not authorized to delete this review');
    }

    await review.deleteOne();

    res.json({
        success: true,
        message: 'Review deleted successfully'
    });
});

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
export const markHelpful = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    const userId = req.user._id;
    const alreadyMarked = review.helpful.users.includes(userId);

    if (alreadyMarked) {
        // Remove helpful
        review.helpful.users = review.helpful.users.filter(
            id => id.toString() !== userId.toString()
        );
        review.helpful.count -= 1;
    } else {
        // Add helpful
        review.helpful.users.push(userId);
        review.helpful.count += 1;
    }

    await review.save();

    res.json({
        success: true,
        data: {
            helpful: review.helpful.count,
            marked: !alreadyMarked
        }
    });
});