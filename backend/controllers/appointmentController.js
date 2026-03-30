import asyncHandler from 'express-async-handler';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import { paginateResults } from '../utils/helpers.js';

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private (Patient)
export const createAppointment = asyncHandler(async (req, res) => {
    const { doctorId, date, timeSlot, type, symptoms } = req.body;

    // Get doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        res.status(404);
        throw new Error('Doctor not found');
    }

    if (!doctor.isActive || !doctor.isVerified) {
        res.status(400);
        throw new Error('Doctor is not available for appointments');
    }

    // Check if slot is available
    const appointmentDate = new Date(date);
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointment = await Appointment.findOne({
        doctor: doctorId,
        date: { $gte: startOfDay, $lte: endOfDay },
        timeSlot,
        status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
        res.status(400);
        throw new Error('This time slot is already booked');
    }

    // Check if appointment is in the past
    const now = new Date();
    const appointmentDateTime = new Date(date);
    const [hours, minutes] = timeSlot.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

    if (appointmentDateTime < now) {
        res.status(400);
        throw new Error('Cannot book appointments in the past');
    }

    // Create appointment
    const appointment = await Appointment.create({
        patient: req.user._id,
        doctor: doctorId,
        date: appointmentDate,
        timeSlot,
        type: type || 'consultation',
        symptoms,
        fee: doctor.consultationFee,
        status: 'pending'
    });

    // Populate and return
    const populatedAppointment = await Appointment.findById(appointment._id)
        .populate('doctor', 'name specialization avatar phone address')
        .populate('patient', 'name email phone avatar');

    res.status(201).json({
        success: true,
        data: populatedAppointment
    });
});

// @desc    Get patient's appointments
// @route   GET /api/appointments/my
// @access  Private (Patient)
export const getMyAppointments = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    const { skip, limit: limitNum } = paginateResults(page, limit);

    const query = { patient: req.user._id };
    if (status) query.status = status;

    const [appointments, total] = await Promise.all([
        Appointment.find(query)
            .populate('doctor', 'name specialization avatar phone address consultationFee')
            .sort({ date: -1, timeSlot: -1 })
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

// @desc    Get doctor's appointments
// @route   GET /api/appointments/doctor
// @access  Private (Doctor)
export const getDoctorAppointments = asyncHandler(async (req, res) => {
    const { status, date, page = 1, limit = 10 } = req.query;
    const { skip, limit: limitNum } = paginateResults(page, limit);

    const query = { doctor: req.user._id };

    if (status) query.status = status;

    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const [appointments, total] = await Promise.all([
        Appointment.find(query)
            .populate('patient', 'name email phone avatar dateOfBirth gender bloodGroup')
            .sort({ date: -1, timeSlot: 1 })
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

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id)
        .populate('doctor', 'name specialization avatar phone address email consultationFee qualification experience')
        .populate('patient', 'name email phone avatar dateOfBirth gender bloodGroup address');

    if (!appointment) {
        res.status(404);
        throw new Error('Appointment not found');
    }

    // Check authorization
    const isPatient = appointment.patient._id.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
        res.status(403);
        throw new Error('Not authorized to view this appointment');
    }

    res.json({
        success: true,
        data: appointment
    });
});

// @desc    Update appointment status (Doctor)
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor)
export const updateAppointmentStatus = asyncHandler(async (req, res) => {
    const { status, notes, prescription, diagnosis } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
        res.status(404);
        throw new Error('Appointment not found');
    }

    // Check if doctor owns this appointment
    if (appointment.doctor.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this appointment');
    }

    // Validate status transitions
    const validTransitions = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['completed', 'cancelled', 'no-show'],
        completed: [],
        cancelled: [],
        'no-show': []
    };

    if (!validTransitions[appointment.status].includes(status)) {
        res.status(400);
        throw new Error(`Cannot change status from ${appointment.status} to ${status}`);
    }

    // Update appointment
    appointment.status = status;
    if (notes) appointment.notes = notes;
    if (prescription) appointment.prescription = prescription;
    if (diagnosis) appointment.diagnosis = diagnosis;

    // If completed, update doctor stats
    if (status === 'completed') {
        appointment.paymentStatus = 'paid';

        await Doctor.findByIdAndUpdate(req.user._id, {
            $inc: {
                totalPatients: 1,
                totalEarnings: appointment.fee
            }
        });
    }

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
        .populate('doctor', 'name specialization avatar')
        .populate('patient', 'name email phone avatar');

    res.json({
        success: true,
        data: updatedAppointment
    });
});

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
export const cancelAppointment = asyncHandler(async (req, res) => {
    const { reason } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
        res.status(404);
        throw new Error('Appointment not found');
    }

    // Check authorization
    const isPatient = appointment.patient.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
        res.status(403);
        throw new Error('Not authorized to cancel this appointment');
    }

    // Check if cancellable
    if (!['pending', 'confirmed'].includes(appointment.status)) {
        res.status(400);
        throw new Error('This appointment cannot be cancelled');
    }

    // Update appointment
    appointment.status = 'cancelled';
    appointment.cancelledBy = req.user.role;
    appointment.cancellationReason = reason;

    await appointment.save();

    res.json({
        success: true,
        data: appointment
    });
});

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private (Patient)
export const rescheduleAppointment = asyncHandler(async (req, res) => {
    const { date, timeSlot } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
        res.status(404);
        throw new Error('Appointment not found');
    }

    // Check if patient owns this appointment
    if (appointment.patient.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to reschedule this appointment');
    }

    // Check if reschedulable
    if (!['pending', 'confirmed'].includes(appointment.status)) {
        res.status(400);
        throw new Error('This appointment cannot be rescheduled');
    }

    // Check if new slot is available
    const newDate = new Date(date);
    const startOfDay = new Date(newDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(newDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointment = await Appointment.findOne({
        _id: { $ne: appointment._id },
        doctor: appointment.doctor,
        date: { $gte: startOfDay, $lte: endOfDay },
        timeSlot,
        status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
        res.status(400);
        throw new Error('This time slot is already booked');
    }

    // Update appointment
    appointment.date = newDate;
    appointment.timeSlot = timeSlot;
    appointment.status = 'pending'; // Reset to pending for confirmation

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
        .populate('doctor', 'name specialization avatar')
        .populate('patient', 'name email phone');

    res.json({
        success: true,
        data: updatedAppointment
    });
});