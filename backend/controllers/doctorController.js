import asyncHandler from 'express-async-handler';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { paginateResults, generateTimeSlots } from '../utils/helpers.js';

// @desc    Get all doctors with filters
// @route   GET /api/doctors
// @access  Public
export const getDoctors = asyncHandler(async (req, res) => {
    const {
        specialization,
        city,
        minFee,
        maxFee,
        minRating,
        search,
        sortBy = 'rating.average',
        sortOrder = 'desc',
        page = 1,
        limit = 10
    } = req.query;

    // Build query
    const query = { isActive: true, isVerified: true };

    if (specialization) {
        query.specialization = specialization;
    }

    if (city) {
        query['address.city'] = { $regex: city, $options: 'i' };
    }

    if (minFee || maxFee) {
        query.consultationFee = {};
        if (minFee) query.consultationFee.$gte = Number(minFee);
        if (maxFee) query.consultationFee.$lte = Number(maxFee);
    }

    if (minRating) {
        query['rating.average'] = { $gte: Number(minRating) };
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { specialization: { $regex: search, $options: 'i' } },
            { 'address.city': { $regex: search, $options: 'i' } }
        ];
    }

    // Pagination
    const { skip, limit: limitNum } = paginateResults(page, limit);

    // Sort
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [doctors, total] = await Promise.all([
        Doctor.find(query)
            .select('-password -availability')
            .sort(sortOptions)
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

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id).select('-password');

    if (!doctor) {
        res.status(404);
        throw new Error('Doctor not found');
    }

    res.json({
        success: true,
        data: doctor
    });
});

// @desc    Get doctor availability slots
// @route   GET /api/doctors/:id/slots
// @access  Public
export const getDoctorSlots = asyncHandler(async (req, res) => {
    const { date } = req.query;

    if (!date) {
        res.status(400);
        throw new Error('Please provide a date');
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
        res.status(404);
        throw new Error('Doctor not found');
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // Get doctor's availability for that day
    const dayAvailability = doctor.availability.find(a => a.day === dayOfWeek);

    if (!dayAvailability || !dayAvailability.isAvailable) {
        return res.json({
            success: true,
            data: {
                date,
                available: false,
                slots: [],
                message: 'Doctor is not available on this day'
            }
        });
    }

    // Generate all possible slots
    const allSlots = generateTimeSlots(dayAvailability.startTime, dayAvailability.endTime, 30);

    // Get booked appointments for this date
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
        doctor: req.params.id,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['pending', 'confirmed'] }
    }).select('timeSlot');

    const bookedSlots = bookedAppointments.map(a => a.timeSlot);

    // Filter available slots
    const availableSlots = allSlots.map(slot => ({
        time: slot,
        available: !bookedSlots.includes(slot)
    }));

    res.json({
        success: true,
        data: {
            date,
            available: true,
            dayOfWeek,
            workingHours: {
                start: dayAvailability.startTime,
                end: dayAvailability.endTime
            },
            slots: availableSlots
        }
    });
});

// @desc    Update doctor availability
// @route   PUT /api/doctors/availability
// @access  Private (Doctor)
export const updateAvailability = asyncHandler(async (req, res) => {
    const { availability } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
        req.user._id,
        { availability },
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        data: doctor.availability
    });
});

// @desc    Get doctor's patients
// @route   GET /api/doctors/patients
// @access  Private (Doctor)
export const getDoctorPatients = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const { skip, limit: limitNum } = paginateResults(page, limit);

    // Get unique patients from appointments
    const appointments = await Appointment.aggregate([
        { $match: { doctor: req.user._id } },
        { $group: { _id: '$patient', lastVisit: { $max: '$date' }, totalVisits: { $sum: 1 } } },
        { $sort: { lastVisit: -1 } },
        { $skip: skip },
        { $limit: limitNum },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'patientInfo'
            }
        },
        { $unwind: '$patientInfo' },
        {
            $project: {
                _id: '$patientInfo._id',
                name: '$patientInfo.name',
                email: '$patientInfo.email',
                phone: '$patientInfo.phone',
                avatar: '$patientInfo.avatar',
                lastVisit: 1,
                totalVisits: 1
            }
        }
    ]);

    const total = await Appointment.distinct('patient', { doctor: req.user._id });

    res.json({
        success: true,
        data: appointments,
        pagination: {
            page: Number(page),
            limit: limitNum,
            total: total.length,
            pages: Math.ceil(total.length / limitNum)
        }
    });
});

// @desc    Get specializations list
// @route   GET /api/doctors/specializations
// @access  Public
export const getSpecializations = asyncHandler(async (req, res) => {
    const specializations = await Doctor.distinct('specialization', {
        isActive: true,
        isVerified: true
    });

    // Get count for each specialization
    const specializationCounts = await Doctor.aggregate([
        { $match: { isActive: true, isVerified: true } },
        { $group: { _id: '$specialization', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);

    res.json({
        success: true,
        data: specializationCounts
    });
});