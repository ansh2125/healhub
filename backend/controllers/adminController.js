import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { paginateResults } from '../utils/helpers.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = asyncHandler(async (req, res) => {
    const { search, role, status, page = 1, limit = 10 } = req.query;
    const { skip, limit: limitNum } = paginateResults(page, limit);

    const query = {};

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const [users, total] = await Promise.all([
        User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        User.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: users,
        pagination: {
            page: Number(page),
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
        }
    });
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
export const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Get user's appointment history
    const appointments = await Appointment.find({ patient: user._id })
        .populate('doctor', 'name specialization')
        .sort({ date: -1 })
        .limit(10);

    res.json({
        success: true,
        data: {
            ...user.toObject(),
            recentAppointments: appointments
        }
    });
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
export const updateUser = asyncHandler(async (req, res) => {
    const { isActive, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (role) user.role = role;

    await user.save();

    res.json({
        success: true,
        data: user
    });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Soft delete by deactivating
    user.isActive = false;
    await user.save();

    res.json({
        success: true,
        message: 'User deactivated successfully'
    });
});

// @desc    Get all doctors (admin view)
// @route   GET /api/admin/doctors
// @access  Private (Admin)
export const getAllDoctors = asyncHandler(async (req, res) => {
    const { search, specialization, status, verified, page = 1, limit = 10 } = req.query;
    const { skip, limit: limitNum } = paginateResults(page, limit);

    const query = {};

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    if (specialization) query.specialization = specialization;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (verified === 'true') query.isVerified = true;
    if (verified === 'false') query.isVerified = false;

    const [doctors, total] = await Promise.all([
        Doctor.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        Doctor.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: doctors,
        pagination: {
            page: Number(page),
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
        }
    });
});

// @desc    Update doctor verification/status
// @route   PUT /api/admin/doctors/:id
// @access  Private (Admin)
export const updateDoctor = asyncHandler(async (req, res) => {
    const { isVerified, isActive } = req.body;

    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
        res.status(404);
        throw new Error('Doctor not found');
    }

    if (isVerified !== undefined) doctor.isVerified = isVerified;
    if (isActive !== undefined) doctor.isActive = isActive;

    await doctor.save();

    res.json({
        success: true,
        data: doctor
    });
});

// @desc    Delete doctor
// @route   DELETE /api/admin/doctors/:id
// @access  Private (Admin)
export const deleteDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
        res.status(404);
        throw new Error('Doctor not found');
    }

    // Check for active appointments
    const activeAppointments = await Appointment.countDocuments({
        doctor: doctor._id,
        status: { $in: ['pending', 'confirmed'] }
    });

    if (activeAppointments > 0) {
        res.status(400);
        throw new Error(`Cannot delete doctor with ${activeAppointments} active appointments`);
    }

    // Soft delete
    doctor.isActive = false;
    doctor.isVerified = false;
    await doctor.save();

    res.json({
        success: true,
        message: 'Doctor deactivated successfully'
    });
});

// @desc    Get all appointments (admin view)
// @route   GET /api/admin/appointments
// @access  Private (Admin)
export const getAllAppointments = asyncHandler(async (req, res) => {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const { skip, limit: limitNum } = paginateResults(page, limit);

    const query = {};

    if (status) query.status = status;

    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
    }

    const [appointments, total] = await Promise.all([
        Appointment.find(query)
            .populate('doctor', 'name specialization')
            .populate('patient', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        Appointment.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: appointments,
        pagination: {
            page: Number(page),
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
        }
    });
});

// @desc    Get dashboard overview
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getDashboardStats = asyncHandler(async (req, res) => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
        totalUsers,
        totalDoctors,
        totalAppointments,
        activeAppointments,
        thisMonthUsers,
        lastMonthUsers,
        thisMonthAppointments,
        lastMonthAppointments,
        pendingVerifications,
        revenueData
    ] = await Promise.all([
        User.countDocuments({ role: 'patient' }),
        Doctor.countDocuments(),
        Appointment.countDocuments(),
        Appointment.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
        User.countDocuments({ createdAt: { $gte: startOfMonth }, role: 'patient' }),
        User.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
            role: 'patient'
        }),
        Appointment.countDocuments({ createdAt: { $gte: startOfMonth } }),
        Appointment.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        }),
        Doctor.countDocuments({ isVerified: false }),
        Appointment.aggregate([
            { $match: { status: 'completed', paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$fee' } } }
        ])
    ]);

    const totalRevenue = revenueData[0]?.total || 0;

    // Calculate growth percentages
    const userGrowth = lastMonthUsers > 0
        ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1)
        : 100;

    const appointmentGrowth = lastMonthAppointments > 0
        ? ((thisMonthAppointments - lastMonthAppointments) / lastMonthAppointments * 100).toFixed(1)
        : 100;

    res.json({
        success: true,
        data: {
            overview: {
                totalUsers,
                totalDoctors,
                totalAppointments,
                activeAppointments,
                totalRevenue,
                pendingVerifications
            },
            growth: {
                users: {
                    current: thisMonthUsers,
                    previous: lastMonthUsers,
                    percentage: parseFloat(userGrowth)
                },
                appointments: {
                    current: thisMonthAppointments,
                    previous: lastMonthAppointments,
                    percentage: parseFloat(appointmentGrowth)
                }
            }
        }
    });
});