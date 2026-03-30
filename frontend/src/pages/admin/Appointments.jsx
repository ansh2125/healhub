import React, { useState, useEffect } from "react";
import { Calendar, Clock, User, UserCheck } from "lucide-react";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Badge from "../../components/common/Badge";
import Pagination from "../../components/common/Pagination";
import EmptyState from "../../components/common/EmptyState";
import {
    formatDate,
    formatTime,
    getStatusColor,
} from "../../utils/helpers";

const AdminAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0,
    });
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        fetchAppointments();
    }, [pagination.page, statusFilter]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            params.append("page", pagination.page);
            params.append("limit", 15);

            if (statusFilter) params.append("status", statusFilter);

            const res = await api.get(`/admin/appointments?${params}`);
            setAppointments(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-white">
                        All Appointments
                    </h1>
                    <p className="text-sm text-gray-400">
                        {pagination.total} total appointments
                    </p>
                </div>

                {/* Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input w-full sm:w-auto"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Empty */}
            {appointments.length === 0 ? (
                <EmptyState
                    icon={Calendar}
                    title="No appointments found"
                    description="There are no appointments matching your current filter."
                />
            ) : (
                <div className="card p-0 overflow-hidden">

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">

                            <thead className="bg-white/5 text-gray-400">
                                <tr>
                                    <th className="text-left p-4">Patient</th>
                                    <th className="text-left p-4">Doctor</th>
                                    <th className="text-left p-4">Date & Time</th>
                                    <th className="text-left p-4">Type</th>
                                    <th className="text-left p-4">Fee</th>
                                    <th className="text-left p-4">Status</th>
                                    <th className="text-left p-4">Payment</th>
                                </tr>
                            </thead>

                            <tbody>
                                {appointments.map((apt) => (
                                    <tr
                                        key={apt._id}
                                        className="border-t border-white/5 hover:bg-white/5 transition"
                                    >
                                        {/* Patient */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {apt.patient?.name || "N/A"}
                                                    </p>
                                                    <p className="text-gray-400 text-xs">
                                                        {apt.patient?.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Doctor */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-500/15 flex items-center justify-center">
                                                    <UserCheck className="w-4 h-4 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {apt.doctor?.name || "N/A"}
                                                    </p>
                                                    <p className="text-gray-400 text-xs">
                                                        {apt.doctor?.specialization}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="p-4 text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(apt.date)}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                <Clock className="w-3 h-3" />
                                                {formatTime(apt.timeSlot)}
                                            </div>
                                        </td>

                                        {/* Type */}
                                        <td className="p-4 text-gray-300 capitalize">
                                            {apt.type || "consultation"}
                                        </td>

                                        {/* Fee */}
                                        <td className="p-4 text-white font-medium">
                                            ${apt.fee}
                                        </td>

                                        {/* Status */}
                                        <td className="p-4">
                                            <Badge variant={getStatusColor(apt.status)}>
                                                {apt.status}
                                            </Badge>
                                        </td>

                                        {/* Payment */}
                                        <td className="p-4">
                                            <Badge
                                                variant={
                                                    apt.paymentStatus === "paid"
                                                        ? "success"
                                                        : "warning"
                                                }
                                            >
                                                {apt.paymentStatus}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={(p) =>
                    setPagination({ ...pagination, page: p })
                }
            />
        </div>
    );
};

export default AdminAppointments;