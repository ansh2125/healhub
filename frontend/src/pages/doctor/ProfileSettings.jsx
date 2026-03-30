import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Save } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DoctorProfileSettings = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.put('/auth/profile', formData);
            updateUser(response.data.data);
            toast.success('Profile updated!');
        } catch (error) {
            toast.error('Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>

            <div className="card">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-dark-700">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">{user?.name}</h2>
                        <p className="text-primary-400">{user?.specialization}</p>
                        <p className="text-dark-400">{user?.email}</p>
                        <div className="flex gap-2 mt-2">
                            <span className="badge badge-info">{user?.experience} years exp.</span>
                            <span className="badge badge-success">${user?.consultationFee}/session</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input pl-12"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                            <input
                                type="email"
                                value={user?.email}
                                disabled
                                className="input pl-12 opacity-50 cursor-not-allowed"
                            />
                        </div>
                        <p className="text-dark-500 text-sm mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="input pl-12"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Bio</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            className="input min-h-[120px]"
                            placeholder="Tell patients about yourself, your experience, and specialties..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Additional Info Card */}
            <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">Practice Information</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="p-4 bg-dark-800/50 rounded-lg">
                        <p className="text-dark-400">Specialization</p>
                        <p className="text-white font-medium">{user?.specialization}</p>
                    </div>
                    <div className="p-4 bg-dark-800/50 rounded-lg">
                        <p className="text-dark-400">Qualification</p>
                        <p className="text-white font-medium">{user?.qualification}</p>
                    </div>
                    <div className="p-4 bg-dark-800/50 rounded-lg">
                        <p className="text-dark-400">Experience</p>
                        <p className="text-white font-medium">{user?.experience} years</p>
                    </div>
                    <div className="p-4 bg-dark-800/50 rounded-lg">
                        <p className="text-dark-400">Consultation Fee</p>
                        <p className="text-white font-medium">${user?.consultationFee}</p>
                    </div>
                    <div className="p-4 bg-dark-800/50 rounded-lg">
                        <p className="text-dark-400">City</p>
                        <p className="text-white font-medium">{user?.address?.city || 'Not specified'}</p>
                    </div>
                    <div className="p-4 bg-dark-800/50 rounded-lg">
                        <p className="text-dark-400">Verification Status</p>
                        <p className={`font-medium ${user?.isVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                            {user?.isVerified ? '✓ Verified' : '⏳ Pending'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfileSettings;