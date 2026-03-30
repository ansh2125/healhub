import React, { useState, useEffect } from "react";
import {
    Users,
    Search,
    Eye,
    UserX,
    UserCheck,
} from "lucide-react";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Pagination from "../../components/common/Pagination";
import EmptyState from "../../components/common/EmptyState";
import { useDebounce } from "../../hooks/useDebounce";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0,
    });

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");

    const [selectedUser, setSelectedUser] = useState(null);
    const [actionModal, setActionModal] = useState({
        open: false,
        user: null,
        action: "",
    });

    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, debouncedSearch, roleFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            params.append("page", pagination.page);
            params.append("limit", 10);

            if (debouncedSearch) params.append("search", debouncedSearch);
            if (roleFilter) params.append("role", roleFilter);

            const res = await api.get(`/admin/users?${params}`);
            setUsers(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        try {
            const { user, action } = actionModal;

            await api.put(`/admin/users/${user._id}`, {
                isActive: action === "activate",
            });

            toast.success(`User ${action}d successfully`);
            setActionModal({ open: false, user: null, action: "" });
            fetchUsers();
        } catch {
            toast.error("Action failed");
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
            <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-white">
                    Manage Users
                </h1>
                <p className="text-sm text-gray-400">
                    {pagination.total} total users
                </p>
            </div>

            {/* 🔍 Filters */}
            <div className="card">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search users..."
                            className="input pl-9"
                        />
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="input"
                    >
                        <option value="">All Roles</option>
                        <option value="patient">Patients</option>
                        <option value="admin">Admins</option>
                    </select>

                </div>
            </div>

            {/* Empty */}
            {users.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No users found"
                    description="Try adjusting your filters or search."
                />
            ) : (
                <div className="card p-0 overflow-hidden">

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">

                            <thead className="bg-white/5 text-gray-400">
                                <tr>
                                    <th className="p-4 text-left">User</th>
                                    <th className="p-4 text-left">Contact</th>
                                    <th className="p-4 text-left">Role</th>
                                    <th className="p-4 text-left">Status</th>
                                    <th className="p-4 text-left">Joined</th>
                                    <th className="p-4 text-left">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {users.map((user) => (
                                    <tr
                                        key={user._id}
                                        className="border-t border-white/5 hover:bg-white/5 transition"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-medium">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-gray-400 text-xs">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4 text-gray-300">
                                            {user.phone || "N/A"}
                                        </td>

                                        <td className="p-4">
                                            <Badge
                                                variant={
                                                    user.role === "admin" ? "primary" : "info"
                                                }
                                            >
                                                {user.role}
                                            </Badge>
                                        </td>

                                        <td className="p-4">
                                            <Badge
                                                variant={
                                                    user.isActive ? "success" : "danger"
                                                }
                                            >
                                                {user.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </td>

                                        <td className="p-4 text-gray-300">
                                            {formatDate(user.createdAt)}
                                        </td>

                                        <td className="p-4 flex gap-2">
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="p-2 rounded-lg hover:bg-white/10"
                                            >
                                                <Eye className="w-4 h-4 text-gray-400" />
                                            </button>

                                            {user.role !== "admin" && (
                                                <button
                                                    onClick={() =>
                                                        setActionModal({
                                                            open: true,
                                                            user,
                                                            action: user.isActive
                                                                ? "deactivate"
                                                                : "activate",
                                                        })
                                                    }
                                                    className="p-2 rounded-lg hover:bg-white/10"
                                                >
                                                    {user.isActive ? (
                                                        <UserX className="w-4 h-4 text-red-400" />
                                                    ) : (
                                                        <UserCheck className="w-4 h-4 text-green-400" />
                                                    )}
                                                </button>
                                            )}
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

            {/* Modals same rehne de */}
        </div>
    );
};

export default AdminUsers;