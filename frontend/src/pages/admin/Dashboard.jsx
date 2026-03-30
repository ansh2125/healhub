import React, { useState, useEffect } from "react";
import {
    Users,
    UserCheck,
    Calendar,
    DollarSign,
    TrendingUp,
    AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import StatsCard from "../../components/common/StatsCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
    AppointmentLineChart,
    StatusPieChart,
    RevenueBarChart,
} from "../../components/charts/DashboardCharts";

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashboardRes, appointmentRes] = await Promise.all([
                    api.get("/admin/dashboard"),
                    api.get("/analytics/appointments"),
                ]);

                setStats(dashboardRes.data.data);
                setAnalytics(appointmentRes.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    /* =========================
       ⏳ Loading
    ========================= */
    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-white">
                    Admin Dashboard
                </h1>
                <p className="text-sm text-gray-400">
                    Overview of your healthcare platform
                </p>
            </div>

            {/* 📊 Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Users"
                    value={stats?.overview?.totalUsers || 0}
                    icon={Users}
                    trend="up"
                    trendValue={stats?.growth?.users?.percentage || 0}
                />
                <StatsCard
                    title="Total Doctors"
                    value={stats?.overview?.totalDoctors || 0}
                    icon={UserCheck}
                    color="green"
                />
                <StatsCard
                    title="Appointments"
                    value={stats?.overview?.totalAppointments || 0}
                    icon={Calendar}
                    color="purple"
                    trend="up"
                    trendValue={stats?.growth?.appointments?.percentage || 0}
                />
                <StatsCard
                    title="Revenue"
                    value={`$${stats?.overview?.totalRevenue?.toLocaleString() || 0}`}
                    icon={DollarSign}
                    color="orange"
                />
            </div>

            {/* ⚠️ Alert */}
            {stats?.overview?.pendingVerifications > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                        <div>
                            <p className="text-yellow-400 font-medium text-sm">
                                Pending Verifications
                            </p>
                            <p className="text-gray-400 text-sm">
                                {stats.overview.pendingVerifications} doctors awaiting approval
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/admin/doctors?verified=false"
                        className="btn-outline text-sm"
                    >
                        Review
                    </Link>
                </div>
            )}

            {/* 📈 Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AppointmentLineChart
                    data={
                        analytics?.monthly?.map((m) => ({
                            month: m.month,
                            appointments: m.total,
                        })) || []
                    }
                />

                <RevenueBarChart data={analytics?.monthly || []} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <StatusPieChart
                    data={
                        analytics?.statusDistribution?.map((s) => ({
                            name: s.status,
                            count: s.count,
                        })) || []
                    }
                />

                {/* ⚡ Quick Actions */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        Quick Actions
                    </h2>

                    <div className="grid grid-cols-2 gap-3">

                        <Link
                            to="/admin/users"
                            className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition"
                        >
                            <Users className="w-6 h-6 text-indigo-400 mb-2" />
                            <p className="text-sm text-white font-medium">
                                Users
                            </p>
                            <p className="text-xs text-gray-400">
                                {stats?.overview?.totalUsers || 0}
                            </p>
                        </Link>

                        <Link
                            to="/admin/doctors"
                            className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition"
                        >
                            <UserCheck className="w-6 h-6 text-green-400 mb-2" />
                            <p className="text-sm text-white font-medium">
                                Doctors
                            </p>
                            <p className="text-xs text-gray-400">
                                {stats?.overview?.totalDoctors || 0}
                            </p>
                        </Link>

                        <Link
                            to="/admin/appointments"
                            className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition"
                        >
                            <Calendar className="w-6 h-6 text-purple-400 mb-2" />
                            <p className="text-sm text-white font-medium">
                                Appointments
                            </p>
                            <p className="text-xs text-gray-400">
                                {stats?.overview?.totalAppointments || 0}
                            </p>
                        </Link>

                        <Link
                            to="/admin/analytics"
                            className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition"
                        >
                            <TrendingUp className="w-6 h-6 text-orange-400 mb-2" />
                            <p className="text-sm text-white font-medium">
                                Analytics
                            </p>
                            <p className="text-xs text-gray-400">
                                View reports
                            </p>
                        </Link>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;