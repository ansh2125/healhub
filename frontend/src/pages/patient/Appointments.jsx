import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, X } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { formatDate, formatTime, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const PatientAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1 });
    const [filter, setFilter] = useState('');
    const [cancelModal, setCancelModal] = useState({ open: false, id: null });

    useEffect(() => {
        fetchAppointments();
    }, [pagination.page, filter]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('page', pagination.page);
            params.append('limit', 10);
            if (filter) params.append('status', filter);

            const response = await api.get(`/appointments/my?${params.toString()}`);
            setAppointments(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        try {
            await api.put(`/appointments/${cancelModal.id}/cancel`, { reason: 'Patient cancelled' });
            toast.success('Appointment cancelled');
            setCancelModal({ open: false, id: null });
            fetchAppointments();
        } catch (error) {
            toast.error('Failed to cancel');
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">My Appointments</h1>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {appointments.length === 0 ? (
                <div className="card text-center py-12">
                    <Calendar className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No appointments found</h3>
                    <p className="text-dark-400">Book your first appointment with a doctor</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {appointments.map((apt) => (
                        <div key={apt._id} className="card">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                                        <span className="text-xl font-bold text-white">{apt.doctor?.name?.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{apt.doctor?.name}</h3>
                                        <p className="text-primary-400">{apt.doctor?.specialization}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2 text-dark-300"><Calendar className="w-4 h-4" />{formatDate(apt.date)}</div>
                                    <div className="flex items-center gap-2 text-dark-300"><Clock className="w-4 h-4" />{formatTime(apt.timeSlot)}</div>
                                    <Badge variant={getStatusColor(apt.status)}>{apt.status}</Badge>
                                    {['pending', 'confirmed'].includes(apt.status) && (
                                        <button onClick={() => setCancelModal({ open: true, id: apt._id })} className="btn-danger text-sm">Cancel</button>
                                    )}
                                </div>
                            </div>
                            {apt.symptoms && <p className="mt-4 text-dark-400 text-sm"><strong>Symptoms:</strong> {apt.symptoms}</p>}
                        </div>
                    ))}
                </div>
            )}

            <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={(p) => setPagination({ ...pagination, page: p })} />

            <Modal isOpen={cancelModal.open} onClose={() => setCancelModal({ open: false, id: null })} title="Cancel Appointment">
                <p className="text-dark-300 mb-6">Are you sure you want to cancel this appointment?</p>
                <div className="flex gap-4">
                    <button onClick={() => setCancelModal({ open: false, id: null })} className="btn-secondary flex-1">No, Keep It</button>
                    <button onClick={handleCancel} className="btn-danger flex-1">Yes, Cancel</button>
                </div>
            </Modal>
        </div>
    );
};

export default PatientAppointments;