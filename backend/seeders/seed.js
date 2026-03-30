import mongoose from 'mongoose';
import dotenv from 'dotenv';
// ❌ bcrypt hata diya
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Review from '../models/Review.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    await Review.deleteMany({});

    // ADMIN
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@healhub.com',
      password: 'admin123',
      role: 'admin',
      phone: '1234567890',
      isActive: true
    });
    console.log('✅ Admin created: admin@healhub.com / admin123');

    // PATIENTS
    const patient1 = await User.create({
      name: 'John Patient',
      email: 'patient@test.com',
      password: 'patient123',
      role: 'patient',
      phone: '9876543210',
      gender: 'male',
      bloodGroup: 'O+',
      dateOfBirth: new Date('1990-05-15'),
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      isActive: true
    });

    const patient2 = await User.create({
      name: 'Jane Doe',
      email: 'jane@test.com',
      password: 'patient123',
      role: 'patient',
      phone: '5551234567',
      gender: 'female',
      bloodGroup: 'A+',
      dateOfBirth: new Date('1985-08-20'),
      address: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA'
      },
      isActive: true
    });

    console.log('✅ Patients created');

    // DOCTORS
    const defaultAvailability = [
      { day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'saturday', startTime: '10:00', endTime: '14:00', isAvailable: true },
      { day: 'sunday', startTime: '00:00', endTime: '00:00', isAvailable: false }
    ];

    const doctors = [
      {
        name: 'Dr. Sarah Smith',
        email: 'sarah@healhub.com',
        password: 'doctor123',
        phone: '5551234567',
        specialization: 'Cardiologist',
        qualification: 'MD, FACC - Harvard Medical School',
        experience: 12,
        consultationFee: 150,
        bio: 'Experienced cardiologist...',
        address: {
          clinic: 'Heart Care Center',
          street: '100 Medical Plaza',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        isVerified: true,
        isActive: true,
        availability: defaultAvailability,
        rating: { average: 4.8, count: 45 },
        totalPatients: 250,
        totalEarnings: 37500
      },

      // 👇 BAaki sab doctors EXACT same rehne de
      // bas password: 'doctor123' kar dena
    ];

    const createdDoctors = await Doctor.insertMany(doctors);

    console.log('✅ Doctors created');

    // APPOINTMENTS
    const today = new Date();

    const appointments = [
      {
        patient: patient1._id,
        doctor: createdDoctors[0]._id,
        date: new Date(today.getTime() + 2 * 86400000),
        timeSlot: '10:00',
        type: 'consultation',
        status: 'confirmed',
        symptoms: 'Chest pain',
        fee: 150,
        paymentStatus: 'pending'
      }
    ];

    await Appointment.insertMany(appointments);

    console.log('🎉 DONE');

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();