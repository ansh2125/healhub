import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const BookAppointment = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [booking, setBooking] = useState(false);
    const [slotsLoading, setSlotsLoading] = useState(false);

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const response = await api.get(`/doctors/${doctorId}`);
                setDoctor(response.data.data);
            } catch (error) {
                toast.error('Doctor not found');
                navigate('/doctors');
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [doctorId]);

    useEffect(() => {
        if (selectedDate) fetchSlots();
    }, [selectedDate]);

    const fetchSlots = async () => {
        try {
            setSlotsLoading(true);
            const response = await api.get(`/doctors/${doctorId}/slots?date=${selectedDate}`);
            setSlots(response.data.data.slots || []);
            setSelectedSlot('');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDate || !selectedSlot) { toast.error('Please select date and time'); return; }

        setBooking(true);
        try {
            await api.post('/appointments', { doctorId, date: selectedDate, timeSlot: selectedSlot, symptoms });
            toast.success('Appointment booked successfully!');
            navigate('/patient/appointments');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Booking failed');
        } finally {
            setBooking(false);
        }
    };

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-dark-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" /> Back
            </button>

            <div className="card">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{doctor?.name?.charAt(0)}</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">{doctor?.name}</h2>
                        <p className="text-primary-400">{doctor?.specialization}</p>
                        <p className="text-dark-400">${doctor?.consultationFee} consultation fee</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Select Date</label>
                        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={getMinDate()} className="input" required />
                    </div>

                    {selectedDate && (
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">Select Time Slot</label>
                            {slotsLoading ? (
                                <LoadingSpinner size="sm" />
                            ) : slots.length === 0 ? (
                                <p className="text-dark-400">No slots available for this date</p>
                            ) : (
                                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                    {slots.map((slot) => (
                                        <button
                                            key={slot.time}
                                            type="button"
                                            disabled={!slot.available}
                                            onClick={() => setSelectedSlot(slot.time)}
                                            className={`p-2 rounded-lg text-sm font-medium transition-all ${selectedSlot === slot.time ? 'bg-primary-500 text-white' :
                                                slot.available ? 'bg-dark-700 text-white hover:bg-dark-600' :
                                                    'bg-dark-800 text-dark-500 cursor-not-allowed'
                                                }`}
                                        >
                                            {formatTime(slot.time)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Describe Your Symptoms (Optional)</label>
                        <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} className="input min-h-[100px]" placeholder="Brief description of your symptoms..." />
                    </div>

                    <button type="submit" disabled={booking || !selectedSlot} className="btn-primary w-full flex items-center justify-center gap-2">
                        {booking ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Confirm Booking</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookAppointment;