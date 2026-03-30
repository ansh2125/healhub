import React, { useState, useEffect } from "react";
import {
    UserCheck,
    Search,
    Star,
    Eye,
    Shield,
    ShieldOff,
    CheckCircle,
    XCircle,
} from "lucide-react";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Badge from "../../components/common/Badge";
import Pagination from "../../components/common/Pagination";
import EmptyState from "../../components/common/EmptyState";
import { useDebounce } from "../../hooks/useDebounce";
import toast from "react-hot-toast";

const AdminDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0,
    });

    const [search, setSearch] = useState("");
    const [verifiedFilter, setVerifiedFilter] = useState("");
    const [specializationFilter, setSpecializationFilter] = useState("");

    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        fetchDoctors();
    }, [pagination.page, debouncedSearch, verifiedFilter, specializationFilter]);

    const fetchDoctors = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            params.append("page", pagination.page);
            params.append("limit", 10);

            if (debouncedSearch) params.append("search", debouncedSearch);
            if (verifiedFilter) params.append("verified", verifiedFilter);
            if (specializationFilter)
                params.append("specialization", specializationFilter);

            const res = await api.get(`/admin/doctors?${params}`);
            setDoctors(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (doctor, type) => {
        try {
            let updateData = {};

            if (type === "verify") updateData.isVerified = true;
            if (type === "unverify") updateData.isVerified = false;
            if (type === "activate") updateData.isActive = true;
            if (type === "deactivate") updateData.isActive = false;

            await api.put(`/admin/doctors/${doctor._id}`, updateData);

            toast.success(`Doctor ${type}d successfully`);
            fetchDoctors();
        } catch {
            toast.error("Action failed");
        }
    };

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
                    Manage Doctors
                </h1>
                <p className="text-sm text-gray-400">
                    {pagination.total} total doctors
                </p>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search doctors..."
                            className="input pl-12"
                        />
                    </div>

                    <select
                        value={specializationFilter}
                        onChange={(e) => setSpecializationFilter(e.target.value)}
                        className="input"
                    >
                        <option value="">All Specializations</option>
                        <option value="Cardiologist">Cardiologist</option>
                        <option value="Dermatologist">Dermatologist</option>
                        <option value="Pediatrician">Pediatrician</option>
                    </select>

                    <select
                        value={verifiedFilter}
                        onChange={(e) => setVerifiedFilter(e.target.value)}
                        className="input"
                    >
                        <option value="">All Status</option>
                        <option value="true">Verified</option>
                        <option value="false">Pending</option>
                    </select>

                </div>
            </div>

            {/* Table */}
            {doctors.length === 0 ? (
                <EmptyState
                    icon={UserCheck}
                    title="No doctors found"
                    description="Try adjusting your filters."
                />
            ) : (
                <div className="card p-0 overflow-hidden">

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">

                            <thead className="bg-white/5 text-gray-400">
                                <tr>
                                    <th className="p-4 text-left">Doctor</th>
                                    <th className="p-4 text-left">Specialization</th>
                                    <th className="p-4 text-left">Experience</th>
                                    <th className="p-4 text-left">Fee</th>
                                    <th className="p-4 text-left">Rating</th>
                                    <th className="p-4 text-left">Status</th>
                                    <th className="p-4 text-left">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {doctors.map((doctor) => (
                                    <tr
                                        key={doctor._id}
                                        className="border-t border-white/5 hover:bg-white/5"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-medium">
                                                    {doctor.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {doctor.name}
                                                    </p>
                                                    <p className="text-gray-400 text-xs">
                                                        {doctor.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4 text-gray-300">
                                            {doctor.specialization}
                                        </td>

                                        <td className="p-4 text-gray-300">
                                            {doctor.experience} yrs
                                        </td>

                                        <td className="p-4 text-white">
                                            ${doctor.consultationFee}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                <span className="text-white">
                                                    {doctor.rating?.average?.toFixed(1) || "0.0"}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="p-4 flex gap-2 flex-wrap">
                                            <Badge variant={doctor.isVerified ? "success" : "warning"}>
                                                {doctor.isVerified ? "Verified" : "Pending"}
                                            </Badge>
                                            <Badge variant={doctor.isActive ? "info" : "danger"}>
                                                {doctor.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </td>

                                        {/* 🔥 ICON ACTIONS WITH TOOLTIP */}
                                        <td className="p-4 flex gap-3">

                                            {/* VERIFY */}
                                            <div className="relative group">
                                                <button
                                                    onClick={() =>
                                                        handleAction(
                                                            doctor,
                                                            doctor.isVerified ? "unverify" : "verify"
                                                        )
                                                    }
                                                    className="p-2 rounded-lg hover:bg-white/10"
                                                >
                                                    {doctor.isVerified ? (
                                                        <ShieldOff className="w-5 h-5 text-yellow-400" />
                                                    ) : (
                                                        <Shield className="w-5 h-5 text-green-400" />
                                                    )}
                                                </button>

                                                <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block text-xs bg-black px-2 py-1 rounded whitespace-nowrap">
                                                    {doctor.isVerified ? "Unverify" : "Verify"}
                                                </span>
                                            </div>

                                            {/* ACTIVE */}
                                            <div className="relative group">
                                                <button
                                                    onClick={() =>
                                                        handleAction(
                                                            doctor,
                                                            doctor.isActive ? "deactivate" : "activate"
                                                        )
                                                    }
                                                    className="p-2 rounded-lg hover:bg-white/10"
                                                >
                                                    {doctor.isActive ? (
                                                        <XCircle className="w-5 h-5 text-red-400" />
                                                    ) : (
                                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                                    )}
                                                </button>

                                                <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block text-xs bg-black px-2 py-1 rounded whitespace-nowrap">
                                                    {doctor.isActive ? "Deactivate" : "Activate"}
                                                </span>
                                            </div>

                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                </div>
            )}

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

export default AdminDoctors;