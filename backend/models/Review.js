import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Please add a rating'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    title: {
        type: String,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    comment: {
        type: String,
        required: [true, 'Please add a comment'],
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    helpful: {
        count: { type: Number, default: 0 },
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }
}, {
    timestamps: true
});

// Indexes
reviewSchema.index({ doctor: 1, createdAt: -1 });
reviewSchema.index({ patient: 1 });
reviewSchema.index({ rating: -1 });

// Prevent multiple reviews for same appointment
reviewSchema.index({ patient: 1, appointment: 1 }, { unique: true });

// Update doctor rating after review
reviewSchema.post('save', async function () {
    const Doctor = mongoose.model('Doctor');
    const reviews = await this.constructor.find({ doctor: this.doctor });

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Doctor.findByIdAndUpdate(this.doctor, {
        'rating.average': Math.round(averageRating * 10) / 10,
        'rating.count': reviews.length
    });
});

export default mongoose.model('Review', reviewSchema);