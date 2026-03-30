import React, { useState, useEffect } from 'react';
import { Clock, Save } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const DoctorAvailability = () => {
    const [availability, setAvailability] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const response = await api.get('/auth/me');
                const doctorAvailability = response.data.data.availability || [];

                const fullAvailability = days.map(day => {
                    const existing = doctorAvailability.find(a => a.day === day);
                    return existing || { day, startTime: '09:00', endTime: '17:00', isAvailable: false };
                });

                setAvailability(fullAvailability);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAvailability();
    }, []);

    const handleChange = (day, field, value) => {
        setAvailability(prev => prev.map(a => a.day === day ? { ...a, [field]: value } : a));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/doctors/availability', { availability });
            toast.success('Availability updated!');
        } catch (error) {
            toast.error('Update failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            <h1 className="text-2xl font-bold text-white">Manage Availability</h1>

            <form onSubmit={handleSubmit} className="card">
                <div className="space-y-4">
                    {availability.map((slot) => (
                        <div key={slot.day} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-dark-800/50 rounded-xl">
                            <div className="w-32">
                                <span className="text-white font-medium capitalize">{slot.day}</span>
                            </div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={slot.isAvailable}
                                    onChange={(e) => handleChange(slot.day, 'isAvailable', e.target.checked)}
                                    className="w-5 h-5 rounded bg-dark-700 border-dark-600 text-primary-500 focus:ring-primary-500"
                                />
                                <span className="text-dark-300">Available</span>
                            </label>
                            {slot.isAvailable && (
                                <div className="flex items-center gap-2 flex-1">
                                    <input
                                        type="time"
                                        value={slot.startTime}
                                        onChange={(e) => handleChange(slot.day, 'startTime', e.target.value)}
                                        className="input py-2"
                                    />
                                    <span className="text-dark-400">to</span>
                                    <input
                                        type="time"
                                        value={slot.endTime}
                                        onChange={(e) => handleChange(slot.day, 'endTime', e.target.value)}
                                        className="input py-2"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <button type="submit" disabled={saving} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
                    {saving ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
                </button>
            </form>
        </div>
    );
};

export default DoctorAvailability;