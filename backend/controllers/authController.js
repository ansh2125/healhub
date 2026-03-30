import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import { generateToken } from '../utils/helpers.js';

// @desc    Register patient
// @route   POST /api/auth/register
// @access  Public
export const registerPatient = asyncHandler(async (req, res) => {
    const { name, email, password, phone, dateOfBirth, gender } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists with this email');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        phone,
        dateOfBirth,
        gender,
        role: 'patient'
    });

    if (user) {
        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role)
            }
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Register doctor
// @route   POST /api/auth/register/doctor
// @access  Public
export const registerDoctor = asyncHandler(async (req, res) => {
    const {
        name, email, password, phone, specialization,
        qualification, experience, consultationFee, bio, address
    } = req.body;

    // Check if doctor exists
    const doctorExists = await Doctor.findOne({ email });
    if (doctorExists) {
        res.status(400);
        throw new Error('Doctor already exists with this email');
    }

    // Default availability (Mon-Fri, 9 AM - 5 PM)
    const defaultAvailability = [
        { day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'saturday', startTime: '10:00', endTime: '14:00', isAvailable: true },
        { day: 'sunday', startTime: '00:00', endTime: '00:00', isAvailable: false }
    ];

    // Create doctor
    const doctor = await Doctor.create({
        name,
        email,
        password,
        phone,
        specialization,
        qualification,
        experience,
        consultationFee,
        bio,
        address,
        availability: defaultAvailability
    });

    if (doctor) {
        res.status(201).json({
            success: true,
            data: {
                _id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                specialization: doctor.specialization,
                role: 'doctor',
                isVerified: doctor.isVerified,
                token: generateToken(doctor._id, 'doctor')
            }
        });
    } else {
        res.status(400);
        throw new Error('Invalid doctor data');
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user
    let user = await User.findOne({ email }).select('+password');
    let role = user?.role;

    // If not found in users, check doctors
    if (!user) {
        user = await Doctor.findOne({ email }).select('+password');
        role = 'doctor';
    }

    if (!user) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    // Check if account is active
    if (!user.isActive) {
        res.status(401);
        throw new Error('Your account has been deactivated. Please contact support.');
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    // Update last login for regular users
    if (user.updateLastLogin) {
        await user.updateLastLogin();
    }

    res.json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role,
            ...(role === 'doctor' && {
                specialization: user.specialization,
                isVerified: user.isVerified
            }),
            token: generateToken(user._id, role)
        }
    });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
    const user = req.user;

    res.json({
        success: true,
        data: user
    });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
    const user = req.user;
    const Model = user.role === 'doctor' ? Doctor : User;

    const allowedFields = ['name', 'phone', 'avatar', 'address', 'bio'];
    const updates = {};

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    // Additional fields for patients
    if (user.role !== 'doctor') {
        ['dateOfBirth', 'gender', 'bloodGroup'].forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });
    }

    const updatedUser = await Model.findByIdAndUpdate(
        user._id,
        { $set: updates },
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        data: updatedUser
    });
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const Model = req.user.role === 'doctor' ? Doctor : User;

    const user = await Model.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
        res.status(400);
        throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    res.json({
        success: true,
        message: 'Password updated successfully'
    });
});