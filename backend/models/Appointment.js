import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
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
    date: {
        type: Date,
        required: [true, 'Please add appointment date']
    },
    timeSlot: {
        type: String,
        required: [true, 'Please add time slot']
    },
    endTime: {
        type: String
    },
    type: {
        type: String,
        enum: ['consultation', 'follow-up', 'emergency', 'routine-checkup'],
        default: 'consultation'
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
        default: 'pending'
    },
    symptoms: {
        type: String,
        maxlength: [500, 'Symptoms description cannot exceed 500 characters']
    },
    notes: {
        type: String,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    prescription: {
        type: String
    },
    diagnosis: {
        type: String
    },
    fee: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'insurance', 'online'],
        default: 'cash'
    },
    cancelledBy: {
        type: String,
        enum: ['patient', 'doctor', 'admin']
    },
    cancellationReason: {
        type: String
    },
    reminders: [{
        type: { type: String, enum: ['email', 'sms'] },
        sentAt: Date,
        status: String
    }]
}, {
    timestamps: true
});

// Indexes for optimization
appointmentSchema.index({ patient: 1, date: -1 });
appointmentSchema.index({ doctor: 1, date: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1, timeSlot: 1 });
appointmentSchema.index({ createdAt: -1 });

// Virtual for appointment duration (30 min default)
appointmentSchema.virtual('duration').get(function () {
    return 30; // minutes
});

// Pre-save middleware to set end time
appointmentSchema.pre('save', function (next) {
    if (this.timeSlot && !this.endTime) {
        const [hours, minutes] = this.timeSlot.split(':').map(Number);
        const endDate = new Date(2000, 0, 1, hours, minutes + 30);
        this.endTime = endDate.toTimeString().slice(0, 5);
    }
    next();
});

export default mongoose.model('Appointment', appointmentSchema);