import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/common/StatsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { formatDate, formatTime, getStatusColor } from '../../utils/helpers';

const PatientDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, appointmentsRes] = await Promise.all([
                    api.get('/analytics/patient'),
                    api.get('/appointments/my?limit=5')
                ]);
                setStats(statsRes.data.data.summary);
                setAppointments(appointmentsRes.data.data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                <p className="text-dark-400">Here's your health overview</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Total Appointments" value={stats?.total || 0} icon={Calendar} color="primary" />
                <StatsCard title="Completed" value={stats?.completed || 0} icon={CheckCircle} color="green" />
                <StatsCard title="Pending" value={stats?.pending || 0} icon={Clock} color="orange" />
                <StatsCard title="Cancelled" value={stats?.cancelled || 0} icon={XCircle} color="purple" />
            </div>

            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Recent Appointments</h2>
                    <Link to="/patient/appointments" className="text-primary-400 hover:text-primary-300 flex items-center gap-1">View All <ArrowRight className="w-4 h-4" /></Link>
                </div>
                {appointments.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-dark-400 mb-4">No appointments yet</p>
                        <Link to="/doctors" className="btn-primary">Book Your First Appointment</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {appointments.map((apt) => (
                            <div key={apt._id} className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                                        <span className="text-white font-semibold">{apt.doctor?.name?.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{apt.doctor?.name}</p>
                                        <p className="text-dark-400 text-sm">{apt.doctor?.specialization}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white">{formatDate(apt.date)}</p>
                                    <p className="text-dark-400 text-sm">{formatTime(apt.timeSlot)}</p>
                                </div>
                                <Badge variant={getStatusColor(apt.status)}>{apt.status}</Badge>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientDashboard;