import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Clock, DollarSign } from 'lucide-react';
import api from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [filters, setFilters] = useState({ search: '', specialization: '' });

    const debouncedSearch = useDebounce(filters.search, 400);

    const specializations = [
        'General Physician',
        'Cardiologist',
        'Dermatologist',
        'Pediatrician',
        'Orthopedic',
        'Neurologist',
        'Psychiatrist',
        'Gynecologist'
    ];

    useEffect(() => {
        fetchDoctors();
    }, [debouncedSearch, filters.specialization, pagination.page]);

    const fetchDoctors = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            if (debouncedSearch) params.append('search', debouncedSearch);
            if (filters.specialization) params.append('specialization', filters.specialization);

            params.append('page', pagination.page);
            params.append('limit', 9);

            const response = await api.get(`/doctors?${params.toString()}`);

            let data = response.data.data;

            // frontend fallback filter
            if (filters.search) {
                data = data.filter((doc) =>
                    doc.name.toLowerCase().includes(filters.search.toLowerCase())
                );
            }

            setDoctors(data);
            setPagination(response.data.pagination);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-6 px-3 sm:px-6 overflow-x-hidden">

            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                        Find Doctors
                    </h1>
                    <p className="text-dark-400 text-sm">
                        Book appointments with the best doctors
                    </p>
                </div>

                {/* FILTERS */}
                <div className="glass rounded-xl p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3">

                        {/* SEARCH */}
                        <div className="flex-1 relative">

                            {/* 🔥 ICON FIXED */}
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />

                            <input
                                type="text"
                                placeholder="Search doctor by name..."
                                value={filters.search}
                                onChange={(e) => {
                                    setFilters({ ...filters, search: e.target.value });
                                    setPagination({ ...pagination, page: 1 });
                                }}
                                className="input pl-12 w-full"
                            />
                        </div>

                        {/* SPECIALIZATION */}
                        <select
                            value={filters.specialization}
                            onChange={(e) => {
                                setFilters({ ...filters, specialization: e.target.value });
                                setPagination({ ...pagination, page: 1 });
                            }}
                            className="input w-full sm:w-[220px]"
                        >
                            <option value="">All Specializations</option>
                            {specializations.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>

                    </div>
                </div>

                {/* LOADING */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : doctors.length === 0 ? (
                    <div className="text-center py-20">
                        <h3 className="text-lg font-semibold text-white mb-2">
                            No doctors found
                        </h3>
                        <p className="text-dark-400 text-sm">
                            Try changing your search
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="text-dark-400 text-sm mb-4">
                            Found {pagination.total} doctors
                        </p>

                        {/* GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                            {doctors.map((doctor) => (
                                <div key={doctor._id} className="card hover:shadow-lg transition">

                                    <div className="flex items-start gap-3 mb-3">

                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                            <span className="text-lg font-bold text-white">
                                                {doctor.name.charAt(0)}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-semibold text-white truncate">
                                                {doctor.name}
                                            </h3>

                                            <p className="text-primary-400 text-sm">
                                                {doctor.specialization}
                                            </p>

                                            <div className="flex items-center gap-1 mt-1 text-sm">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                <span className="text-white">
                                                    {doctor.rating?.average?.toFixed(1) || '0.0'}
                                                </span>
                                                <span className="text-dark-400">
                                                    ({doctor.rating?.count || 0})
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1 mb-3 text-sm">
                                        <div className="flex items-center gap-2 text-dark-400">
                                            <Clock className="w-4 h-4" />
                                            {doctor.experience} yrs exp.
                                        </div>

                                        <div className="flex items-center gap-2 text-dark-400">
                                            <MapPin className="w-4 h-4" />
                                            {doctor.address?.city || 'N/A'}
                                        </div>

                                        <div className="flex items-center gap-2 text-dark-400">
                                            <DollarSign className="w-4 h-4" />
                                            ${doctor.consultationFee}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            to={`/doctors/${doctor._id}`}
                                            className="flex-1 btn-secondary text-center text-sm"
                                        >
                                            View
                                        </Link>

                                        <Link
                                            to={`/patient/book/${doctor._id}`}
                                            className="flex-1 btn-primary text-center text-sm"
                                        >
                                            Book
                                        </Link>
                                    </div>
                                </div>
                            ))}

                        </div>

                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.pages}
                            onPageChange={(p) =>
                                setPagination({ ...pagination, page: p })
                            }
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default Doctors;