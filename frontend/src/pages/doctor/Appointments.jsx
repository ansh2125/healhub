import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Check, X } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { formatDate, formatTime, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const DoctorAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1 });
    const [filter, setFilter] = useState('');
    const [actionModal, setActionModal] = useState({ open: false, id: null, action: '' });

    useEffect(() => {
        fetchAppointments();
    }, [pagination.page, filter]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('page', pagination.page);
            if (filter) params.append('status', filter);

            const response = await api.get(`/appointments/doctor?${params.toString()}`);
            setAppointments(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        try {
            if (actionModal.action === 'cancel') {
                await api.put(`/appointments/${actionModal.id}/cancel`, {
                    reason: 'Doctor cancelled',
                });
            } else {
                await api.put(`/appointments/${actionModal.id}/status`, {
                    status: actionModal.action,
                });
            }

            toast.success(`Appointment ${actionModal.action}ed`);
            setActionModal({ open: false, id: null, action: '' });
            fetchAppointments();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6 overflow-x-hidden">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                    Appointments
                </h1>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-dark-800 border border-dark-600 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* LIST */}
            <div className="space-y-4">
                {appointments.map((apt) => (
                    <div
                        key={apt._id}
                        className="card w-full overflow-hidden"
                    >
                        <div className="flex flex-col gap-4">

                            {/* PATIENT */}
                            <div className="flex gap-3">
                                <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center">
                                    <span className="text-white font-bold">
                                        {apt.patient?.name?.charAt(0)}
                                    </span>
                                </div>

                                <div className="w-full">
                                    <h3 className="text-white font-semibold truncate">
                                        {apt.patient?.name}
                                    </h3>

                                    <p className="text-dark-400 text-sm truncate">
                                        {apt.patient?.email}
                                    </p>

                                    {/* ✅ MOBILE TEXT STATUS */}
                                    <p className="text-xs text-green-400 sm:hidden">
                                        {apt.status}
                                    </p>

                                    <p className="text-dark-400 text-sm">
                                        {apt.patient?.phone}
                                    </p>
                                </div>
                            </div>

                            {/* DATE + TIME */}
                            <div className="flex justify-between items-start sm:items-center">

                                <div className="text-sm text-dark-300 space-y-1">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(apt.date)}
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {formatTime(apt.timeSlot)}
                                    </div>
                                </div>

                                {/* ✅ DESKTOP BADGE */}
                                <div className="hidden sm:block">
                                    <Badge variant={getStatusColor(apt.status)}>
                                        {apt.status}
                                    </Badge>
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex flex-wrap gap-2">
                                {apt.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() =>
                                                setActionModal({
                                                    open: true,
                                                    id: apt._id,
                                                    action: 'confirmed',
                                                })
                                            }
                                            className="btn-success flex-1"
                                        >
                                            Accept
                                        </button>

                                        <button
                                            onClick={() =>
                                                setActionModal({
                                                    open: true,
                                                    id: apt._id,
                                                    action: 'cancel',
                                                })
                                            }
                                            className="btn-danger flex-1"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}

                                {apt.status === 'confirmed' && (
                                    <button
                                        onClick={() =>
                                            setActionModal({
                                                open: true,
                                                id: apt._id,
                                                action: 'completed',
                                            })
                                        }
                                        className="btn-success w-full sm:w-auto"
                                    >
                                        Complete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* PAGINATION */}
            <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={(p) =>
                    setPagination({ ...pagination, page: p })
                }
            />

            {/* MODAL */}
            <Modal
                isOpen={actionModal.open}
                onClose={() =>
                    setActionModal({ open: false, id: null, action: '' })
                }
                title="Confirm Action"
            >
                <p className="text-dark-300 mb-6">
                    Are you sure you want to {actionModal.action} this appointment?
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={() =>
                            setActionModal({ open: false, id: null, action: '' })
                        }
                        className="btn-secondary flex-1"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleAction}
                        className="btn-primary flex-1"
                    >
                        Confirm
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default DoctorAppointments;