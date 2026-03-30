import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, Clock, DollarSign, Calendar, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';

const DoctorProfile = () => {
    const { id } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const response = await api.get(`/doctors/${id}`);
                setDoctor(response.data.data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
    if (!doctor) return <div className="min-h-screen flex items-center justify-center"><h2 className="text-2xl text-white">Doctor not found</h2></div>;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-5xl mx-auto px-4">
                <Link to="/doctors" className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-6">
                    <ArrowLeft className="w-5 h-5" /> Back to Doctors
                </Link>

                <div className="card mb-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                            <span className="text-5xl font-bold text-white">{doctor.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-white">{doctor.name}</h1>
                                {doctor.isVerified && <Badge variant="success"><CheckCircle className="w-4 h-4 mr-1" />Verified</Badge>}
                            </div>
                            <p className="text-primary-400 text-lg mb-2">{doctor.specialization}</p>
                            <p className="text-dark-400 mb-4">{doctor.qualification}</p>
                            <div className="flex flex-wrap gap-4 text-dark-300">
                                <div className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />{doctor.rating?.average?.toFixed(1) || '0.0'}</div>
                                <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary-400" />{doctor.experience} years</div>
                                <div className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-400" />${doctor.consultationFee}</div>
                            </div>
                        </div>
                        <Link to={`/patient/book/${doctor._id}`} className="btn-primary self-start"><Calendar className="w-5 h-5 mr-2 inline" />Book Appointment</Link>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card">
                            <h2 className="text-xl font-semibold text-white mb-4">About</h2>
                            <p className="text-dark-300">{doctor.bio || 'No bio available.'}</p>
                        </div>
                        <div className="card">
                            <h2 className="text-xl font-semibold text-white mb-4">Availability</h2>
                            <div className="space-y-3">
                                {days.map(day => {
                                    const schedule = doctor.availability?.find(a => a.day === day);
                                    return (
                                        <div key={day} className="flex justify-between py-2 border-b border-dark-700 last:border-0">
                                            <span className="text-white capitalize">{day}</span>
                                            {schedule?.isAvailable ? <span className="text-green-400">{schedule.startTime} - {schedule.endTime}</span> : <span className="text-dark-500">Closed</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="card h-fit">
                        <h2 className="text-xl font-semibold text-white mb-4">Contact</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3"><MapPin className="w-5 h-5 text-primary-400 mt-1" /><div><p className="text-white">{doctor.address?.clinic || 'Clinic'}</p><p className="text-dark-400">{doctor.address?.city}, {doctor.address?.state}</p></div></div>
                            <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-primary-400" /><span className="text-dark-300">{doctor.phone}</span></div>
                            <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-primary-400" /><span className="text-dark-300">{doctor.email}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;