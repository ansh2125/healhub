import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    LayoutDashboard,
    Calendar,
    Users,
    User,
    Settings,
    LogOut,
    Menu,
    X,
    Stethoscope,
    Clock,
    BarChart3,
    UserCheck,
    ChevronRight,
} from "lucide-react";

const DashboardLayout = ({ role }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const menuItems = {
        patient: [
            { path: "/patient", icon: LayoutDashboard, label: "Dashboard" },
            { path: "/patient/appointments", icon: Calendar, label: "Appointments" },
            { path: "/patient/profile", icon: User, label: "Profile" },
        ],
        doctor: [
            { path: "/doctor", icon: LayoutDashboard, label: "Dashboard" },
            { path: "/doctor/appointments", icon: Calendar, label: "Appointments" },
            { path: "/doctor/patients", icon: Users, label: "Patients" },
            { path: "/doctor/availability", icon: Clock, label: "Availability" },
            { path: "/doctor/profile", icon: Settings, label: "Settings" },
        ],
        admin: [
            { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
            { path: "/admin/users", icon: Users, label: "Users" },
            { path: "/admin/doctors", icon: UserCheck, label: "Doctors" },
            { path: "/admin/appointments", icon: Calendar, label: "Appointments" },
            { path: "/admin/analytics", icon: BarChart3, label: "Analytics" },
        ],
    }[role] || [];

    const isActive = (path) =>
        path === `/${role}`
            ? location.pathname === path
            : location.pathname.startsWith(path);

    return (
        <div className="min-h-screen bg-[#0b1120] text-white">

            {/* 🔝 Mobile Navbar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
                <div className="flex items-center justify-between px-4 h-16">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-semibold">HealHub</span>
                    </Link>

                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-white/10 transition"
                    >
                        {sidebarOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* 📌 Sidebar */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-40 w-64
          bg-[#111827] border-r border-white/10
          transform transition-transform duration-300
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
            >
                {/* Logo */}
                <div className="hidden lg:flex items-center gap-2 px-6 h-16 border-b border-white/10">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
                            <Stethoscope className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-semibold">HealHub</span>
                    </Link>
                </div>

                {/* User */}
                <div className="p-4 border-b border-white/10 mt-16 lg:mt-0">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-indigo-500 flex items-center justify-center">
                            <span className="text-white font-semibold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>

                        <div className="min-w-0">
                            <p className="text-white font-medium truncate">
                                {user?.name}
                            </p>
                            <p className="text-gray-400 text-sm capitalize">
                                {role}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Menu */}
                <nav className="p-3 space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                transition
                ${isActive(item.path)
                                    ? "bg-indigo-500/15 text-indigo-400"
                                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                                }
              `}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>

                            {isActive(item.path) && (
                                <ChevronRight className="w-4 h-4 ml-auto" />
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* 🧾 Main Content */}
            <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
                <div className="px-4 sm:px-6 lg:px-8 py-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;