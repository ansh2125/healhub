import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/common/StatsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { AppointmentLineChart, RevenueBarChart } from '../../components/charts/DashboardCharts';
import { formatDate, formatTime, getStatusColor } from '../../utils/helpers';

const DoctorDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, appointmentsRes] = await Promise.all([
                    api.get('/analytics/doctor'),
                    api.get('/appointments/doctor?limit=5')
                ]);
                setStats(statsRes.data.data);
                setAppointments(appointmentsRes.data.data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
        </div>
    );

    return (
        <div className="space-y-6 overflow-x-hidden">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">
                        Welcome, Dr. {user?.name?.split(' ').slice(-1)[0]}! 👨‍⚕️
                    </h1>
                    <p className="text-dark-400">Here's your practice overview</p>
                </div>

                {!user?.isVerified && (
                    <div className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                        <p className="text-yellow-400 text-sm">
                            ⚠️ Account pending verification
                        </p>
                    </div>
                )}
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Total Appointments" value={stats?.summary?.totalAppointments || 0} icon={Calendar} color="primary" />
                <StatsCard title="Total Patients" value={stats?.summary?.totalPatients || 0} icon={Users} color="green" />
                <StatsCard title="Total Earnings" value={`$${stats?.summary?.totalEarnings || 0}`} icon={DollarSign} color="purple" />
                <StatsCard title="Pending" value={stats?.summary?.pendingAppointments || 0} icon={Clock} color="orange" />
            </div>

            {/* CHARTS */}
            {stats?.monthly && stats.monthly.length > 0 && (
                <div className="grid lg:grid-cols-2 gap-4">
                    <div className="card">
                        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
                            Appointments Trend
                        </h2>
                        <AppointmentLineChart data={stats.monthly} />
                    </div>
                    <div className="card">
                        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
                            Earnings Trend
                        </h2>
                        <RevenueBarChart data={stats.monthly} />
                    </div>
                </div>
            )}

            {/* RECENT APPOINTMENTS */}
            <div className="card">
                <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-white">
                        Recent Appointments
                    </h2>
                    <Link
                        to="/doctor/appointments"
                        className="text-primary-400 flex items-center gap-1"
                    >
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {appointments.length === 0 ? (
                    <p className="text-dark-400 text-center py-8">
                        No appointments yet
                    </p>
                ) : (
                    <div className="space-y-4">
                        {appointments.map((apt) => (
                            <div
                                key={apt._id}
                                className="p-4 bg-dark-800/50 rounded-xl"
                            >
                                <div className="flex flex-col gap-3">

                                    {/* PATIENT */}
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center">
                                            <span className="text-white font-semibold">
                                                {apt.patient?.name?.charAt(0)}
                                            </span>
                                        </div>

                                        <div className="w-full">
                                            <p className="text-white font-medium truncate">
                                                {apt.patient?.name}
                                            </p>

                                            <p className="text-dark-400 text-sm truncate">
                                                {apt.patient?.email}
                                            </p>

                                            {/* ✅ MOBILE TEXT STATUS */}
                                            <p className="text-xs text-green-400 sm:hidden">
                                                {apt.status}
                                            </p>
                                        </div>
                                    </div>

                                    {/* DATE + TIME + BADGE */}
                                    <div className="flex justify-between items-start sm:items-center">
                                        <div className="text-sm text-dark-300">
                                            <p>{formatDate(apt.date)}</p>
                                            <p className="text-xs">
                                                {formatTime(apt.timeSlot)}
                                            </p>
                                        </div>

                                        {/* ✅ DESKTOP BADGE */}
                                        <div className="hidden sm:block">
                                            <Badge variant={getStatusColor(apt.status)}>
                                                {apt.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorDashboard;