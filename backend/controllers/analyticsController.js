import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';

// @desc    Get user growth analytics
// @route   GET /api/analytics/user-growth
// @access  Private (Admin)
export const getUserGrowth = asyncHandler(async (req, res) => {
    const { period = 12 } = req.query;
    const months = parseInt(period);

    const data = await User.aggregate([
        {
            $match: {
                role: 'patient',
                createdAt: {
                    $gte: new Date(new Date().setMonth(new Date().getMonth() - months))
                }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Fill in missing months with 0
    const result = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const found = data.find(d => d._id.year === year && d._id.month === month);

        result.push({
            month: date.toLocaleString('default', { month: 'short' }),
            year,
            users: found ? found.count : 0
        });
    }

    res.json({
        success: true,
        data: result
    });
});

// @desc    Get appointment analytics
// @route   GET /api/analytics/appointments
// @access  Private (Admin)
export const getAppointmentAnalytics = asyncHandler(async (req, res) => {
    const { period = 12 } = req.query;
    const months = parseInt(period);
    const startDate = new Date(new Date().setMonth(new Date().getMonth() - months));

    // Monthly appointments trend
    const monthlyData = await Appointment.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
            $group: {
                _id: {
                    year: { $year: '$date' },
                    month: { $month: '$date' }
                },
                total: { $sum: 1 },
                completed: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                cancelled: {
                    $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                },
                revenue: {
                    $sum: {
                        $cond: [
                            { $eq: ['$status', 'completed'] },
                            '$fee',
                            0
                        ]
                    }
                }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Status distribution
    const statusDistribution = await Appointment.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    // Type distribution
    const typeDistribution = await Appointment.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 }
            }
        }
    ]);

    // Format monthly data
    const result = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const found = monthlyData.find(d => d._id.year === year && d._id.month === month);

        result.push({
            month: date.toLocaleString('default', { month: 'short' }),
            year,
            total: found ? found.total : 0,
            completed: found ? found.completed : 0,
            cancelled: found ? found.cancelled : 0,
            revenue: found ? found.revenue : 0
        });
    }

    res.json({
        success: true,
        data: {
            monthly: result,
            statusDistribution: statusDistribution.map(s => ({
                status: s._id,
                count: s.count
            })),
            typeDistribution: typeDistribution.map(t => ({
                type: t._id || 'consultation',
                count: t.count
            }))
        }
    });
});

// @desc    Get revenue analytics
// @route   GET /api/analytics/revenue
// @access  Private (Admin)
export const getRevenueAnalytics = asyncHandler(async (req, res) => {
    const { period = 12 } = req.query;
    const months = parseInt(period);
    const startDate = new Date(new Date().setMonth(new Date().getMonth() - months));

    // Monthly revenue
    const monthlyRevenue = await Appointment.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                status: 'completed',
                paymentStatus: 'paid'
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$date' },
                    month: { $month: '$date' }
                },
                revenue: { $sum: '$fee' },
                appointments: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Revenue by specialization
    const revenueBySpecialization = await Appointment.aggregate([
        {
            $match: {
                status: 'completed',
                paymentStatus: 'paid'
            }
        },
        {
            $lookup: {
                from: 'doctors',
                localField: 'doctor',
                foreignField: '_id',
                as: 'doctorInfo'
            }
        },
        { $unwind: '$doctorInfo' },
        {
            $group: {
                _id: '$doctorInfo.specialization',
                revenue: { $sum: '$fee' },
                count: { $sum: 1 }
            }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
    ]);

    // Top earning doctors
    const topDoctors = await Doctor.find({ isActive: true })
        .select('name specialization totalEarnings totalPatients rating')
        .sort({ totalEarnings: -1 })
        .limit(5);

    // Format monthly data
    const result = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const found = monthlyRevenue.find(d => d._id.year === year && d._id.month === month);

        result.push({
            month: date.toLocaleString('default', { month: 'short' }),
            year,
            revenue: found ? found.revenue : 0,
            appointments: found ? found.appointments : 0
        });
    }

    // Calculate totals
    const totalRevenue = result.reduce((sum, r) => sum + r.revenue, 0);
    const totalAppointments = result.reduce((sum, r) => sum + r.appointments, 0);
    const averageRevenue = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;

    res.json({
        success: true,
        data: {
            monthly: result,
            bySpecialization: revenueBySpecialization.map(r => ({
                specialization: r._id,
                revenue: r.revenue,
                appointments: r.count
            })),
            topDoctors,
            summary: {
                totalRevenue,
                totalAppointments,
                averagePerAppointment: Math.round(averageRevenue)
            }
        }
    });
});

// @desc    Get doctor performance analytics
// @route   GET /api/analytics/doctor-performance
// @access  Private (Admin)
export const getDoctorPerformance = asyncHandler(async (req, res) => {
    // Top rated doctors
    const topRated = await Doctor.find({ isActive: true, isVerified: true })
        .select('name specialization rating totalPatients totalEarnings')
        .sort({ 'rating.average': -1 })
        .limit(10);

    // Most booked doctors
    const mostBooked = await Appointment.aggregate([
        {
            $group: {
                _id: '$doctor',
                totalAppointments: { $sum: 1 },
                completedAppointments: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                }
            }
        },
        { $sort: { totalAppointments: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'doctors',
                localField: '_id',
                foreignField: '_id',
                as: 'doctor'
            }
        },
        { $unwind: '$doctor' },
        {
            $project: {
                _id: '$doctor._id',
                name: '$doctor.name',
                specialization: '$doctor.specialization',
                totalAppointments: 1,
                completedAppointments: 1,
                completionRate: {
                    $multiply: [
                        { $divide: ['$completedAppointments', '$totalAppointments'] },
                        100
                    ]
                }
            }
        }
    ]);

    // Appointments by specialization
    const bySpecialization = await Appointment.aggregate([
        {
            $lookup: {
                from: 'doctors',
                localField: 'doctor',
                foreignField: '_id',
                as: 'doctorInfo'
            }
        },
        { $unwind: '$doctorInfo' },
        {
            $group: {
                _id: '$doctorInfo.specialization',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);

    res.json({
        success: true,
        data: {
            topRated,
            mostBooked,
            bySpecialization: bySpecialization.map(s => ({
                name: s._id,
                value: s.count
            }))
        }
    });
});

// @desc    Get patient's analytics
// @route   GET /api/analytics/patient
// @access  Private (Patient)
export const getPatientAnalytics = asyncHandler(async (req, res) => {
    const patientId = req.user._id;
    const period = 12;
    const startDate = new Date(new Date().setMonth(new Date().getMonth() - period));

    // Monthly appointments
    const monthlyAppointments = await Appointment.aggregate([
        {
            $match: {
                patient: patientId,
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$date' },
                    month: { $month: '$date' }
                },
                count: { $sum: 1 },
                spent: { $sum: '$fee' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Summary stats
    const stats = await Appointment.aggregate([
        { $match: { patient: patientId } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                completed: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                cancelled: {
                    $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                },
                upcoming: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $in: ['$status', ['pending', 'confirmed']] },
                                    { $gte: ['$date', new Date()] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                totalSpent: {
                    $sum: {
                        $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$fee', 0]
                    }
                }
            }
        }
    ]);

    // Most visited specializations
    const topSpecializations = await Appointment.aggregate([
        { $match: { patient: patientId } },
        {
            $lookup: {
                from: 'doctors',
                localField: 'doctor',
                foreignField: '_id',
                as: 'doctorInfo'
            }
        },
        { $unwind: '$doctorInfo' },
        {
            $group: {
                _id: '$doctorInfo.specialization',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);

    // Format monthly data
    const result = [];
    const now = new Date();

    for (let i = period - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const found = monthlyAppointments.find(d => d._id.year === year && d._id.month === month);

        result.push({
            month: date.toLocaleString('default', { month: 'short' }),
            appointments: found ? found.count : 0,
            spent: found ? found.spent : 0
        });
    }

    res.json({
        success: true,
        data: {
            monthly: result,
            summary: stats[0] || {
                total: 0,
                completed: 0,
                cancelled: 0,
                upcoming: 0,
                totalSpent: 0
            },
            topSpecializations: topSpecializations.map(s => ({
                specialization: s._id,
                visits: s.count
            }))
        }
    });
});

// @desc    Get doctor's analytics
// @route   GET /api/analytics/doctor
// @access  Private (Doctor)
export const getDoctorAnalytics = asyncHandler(async (req, res) => {
    const doctorId = req.user._id;
    const period = 12;
    const startDate = new Date(new Date().setMonth(new Date().getMonth() - period));

    // Monthly stats
    const monthlyStats = await Appointment.aggregate([
        {
            $match: {
                doctor: doctorId,
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$date' },
                    month: { $month: '$date' }
                },
                appointments: { $sum: 1 },
                earnings: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'completed'] }, '$fee', 0]
                    }
                },
                patients: { $addToSet: '$patient' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Summary stats
    const [summary] = await Appointment.aggregate([
        { $match: { doctor: doctorId } },
        {
            $group: {
                _id: null,
                totalAppointments: { $sum: 1 },
                completedAppointments: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                pendingAppointments: {
                    $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                },
                cancelledAppointments: {
                    $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                },
                totalEarnings: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ['$status', 'completed'] },
                                    { $eq: ['$paymentStatus', 'paid'] }
                                ]
                            },
                            '$fee',
                            0
                        ]
                    }
                },
                uniquePatients: { $addToSet: '$patient' }
            }
        },
        {
            $project: {
                totalAppointments: 1,
                completedAppointments: 1,
                pendingAppointments: 1,
                cancelledAppointments: 1,
                totalEarnings: 1,
                totalPatients: { $size: '$uniquePatients' }
            }
        }
    ]);

    // Today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.countDocuments({
        doctor: doctorId,
        date: { $gte: today, $lt: tomorrow },
        status: { $in: ['pending', 'confirmed'] }
    });

    // Format monthly data
    const result = [];
    const now = new Date();

    for (let i = period - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const found = monthlyStats.find(d => d._id.year === year && d._id.month === month);

        result.push({
            month: date.toLocaleString('default', { month: 'short' }),
            appointments: found ? found.appointments : 0,
            earnings: found ? found.earnings : 0,
            patients: found ? found.patients.length : 0
        });
    }

    res.json({
        success: true,
        data: {
            monthly: result,
            summary: summary || {
                totalAppointments: 0,
                completedAppointments: 0,
                pendingAppointments: 0,
                cancelledAppointments: 0,
                totalEarnings: 0,
                totalPatients: 0
            },
            todayAppointments
        }
    });
});