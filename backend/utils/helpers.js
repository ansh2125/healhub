import jwt from 'jsonwebtoken';

export const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

export const generateTimeSlots = (startTime, endTime, duration = 30) => {
    const slots = [];
    let current = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    while (current < end) {
        slots.push(current.toTimeString().slice(0, 5));
        current = new Date(current.getTime() + duration * 60000);
    }

    return slots;
};

export const paginateResults = (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return { skip, limit: parseInt(limit) };
};