import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';

const DoctorPatients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await api.get('/doctors/my/patients');
                setPatients(response.data.data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6 animate-fadeIn">
            <h1 className="text-2xl font-bold text-white">My Patients</h1>

            {patients.length === 0 ? (
                <div className="card text-center py-12">
                    <Users className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white">No patients yet</h3>
                    <p className="text-dark-400">Patients will appear here after appointments</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {patients.map((patient) => (
                        <div key={patient._id} className="card">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                                    <span className="text-xl font-bold text-white">{patient.name?.charAt(0)}</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{patient.name}</h3>
                                    <p className="text-dark-400 text-sm">{patient.totalVisits} visits</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-dark-300"><Mail className="w-4 h-4" />{patient.email}</div>
                                {patient.phone && <div className="flex items-center gap-2 text-dark-300"><Phone className="w-4 h-4" />{patient.phone}</div>}
                                <div className="flex items-center gap-2 text-dark-300"><Calendar className="w-4 h-4" />Last visit: {formatDate(patient.lastVisit)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorPatients;