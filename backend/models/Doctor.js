import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const availabilitySchema = new mongoose.Schema({
    day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { _id: false });

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
        maxlength: [15, 'Phone number cannot exceed 15 characters']
    },
    avatar: {
        type: String,
        default: ''
    },
    specialization: {
        type: String,
        required: [true, 'Please add a specialization'],
        enum: [
            'General Physician',
            'Cardiologist',
            'Dermatologist',
            'Pediatrician',
            'Orthopedic',
            'Neurologist',
            'Psychiatrist',
            'Gynecologist',
            'Urologist',
            'ENT Specialist',
            'Ophthalmologist',
            'Dentist',
            'Oncologist',
            'Endocrinologist',
            'Gastroenterologist'
        ]
    },
    qualification: {
        type: String,
        required: [true, 'Please add qualifications']
    },
    experience: {
        type: Number,
        required: [true, 'Please add years of experience'],
        min: [0, 'Experience cannot be negative']
    },
    consultationFee: {
        type: Number,
        required: [true, 'Please add consultation fee'],
        min: [0, 'Fee cannot be negative']
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    address: {
        clinic: String,
        street: String,
        city: { type: String, required: true },
        state: String,
        zipCode: String,
        country: { type: String, default: 'USA' }
    },
    availability: [availabilitySchema],
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        default: 'doctor'
    },
    totalPatients: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for optimization
doctorSchema.index({ email: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ 'address.city': 1 });
doctorSchema.index({ consultationFee: 1 });
doctorSchema.index({ 'rating.average': -1 });
doctorSchema.index({ isVerified: 1, isActive: 1 });

// Hash password before saving
doctorSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
doctorSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Update rating
doctorSchema.methods.updateRating = async function (newRating) {
    const totalRating = this.rating.average * this.rating.count + newRating;
    this.rating.count += 1;
    this.rating.average = totalRating / this.rating.count;
    await this.save();
};

export default mongoose.model('Doctor', doctorSchema);