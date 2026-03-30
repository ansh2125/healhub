import React, { useState, useEffect } from "react";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
    AppointmentLineChart,
    RevenueBarChart,
    StatusPieChart,
} from "../../components/charts/DashboardCharts";

const AdminAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [userGrowth, setUserGrowth] = useState([]);
    const [appointmentData, setAppointmentData] = useState({});
    const [revenueData, setRevenueData] = useState({});

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [userRes, appointmentRes, revenueRes] =
                    await Promise.all([
                        api.get("/analytics/user-growth"),
                        api.get("/analytics/appointments"),
                        api.get("/analytics/revenue"),
                    ]);

                setUserGrowth(userRes.data?.data || []);
                setAppointmentData(appointmentRes.data?.data || {});
                setRevenueData(revenueRes.data?.data || {});
            } catch (error) {
                console.error("Analytics error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const totalRevenue = revenueData?.summary?.totalRevenue || 0;
    const totalAppointments = revenueData?.summary?.totalAppointments || 0;

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-white">
                    Analytics
                </h1>
                <p className="text-sm text-gray-400">
                    Detailed platform insights
                </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                <div className="card flex gap-4 items-center">
                    <DollarSign className="text-green-400" />
                    <div>
                        <p className="text-gray-400 text-sm">Revenue</p>
                        <p className="text-white text-lg font-semibold">
                            ${totalRevenue}
                        </p>
                    </div>
                </div>

                <div className="card flex gap-4 items-center">
                    <Calendar className="text-indigo-400" />
                    <div>
                        <p className="text-gray-400 text-sm">Appointments</p>
                        <p className="text-white text-lg font-semibold">
                            {totalAppointments}
                        </p>
                    </div>
                </div>

                <div className="card flex gap-4 items-center">
                    <TrendingUp className="text-purple-400" />
                    <div>
                        <p className="text-gray-400 text-sm">Avg</p>
                        <p className="text-white text-lg font-semibold">
                            $
                            {Math.round(
                                totalRevenue / (totalAppointments || 1)
                            )}
                        </p>
                    </div>
                </div>

            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AppointmentLineChart
                    data={userGrowth.map((u) => ({
                        month: u.month,
                        appointments: u.users,
                    }))}
                />

                <RevenueBarChart
                    data={appointmentData?.monthly || []}
                />
            </div>

            <StatusPieChart
                data={
                    appointmentData?.statusDistribution?.map((s) => ({
                        name: s.status,
                        count: s.count,
                    })) || []
                }
            />
        </div>
    );
};

export default AdminAnalytics;