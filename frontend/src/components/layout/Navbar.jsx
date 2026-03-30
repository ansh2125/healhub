import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    Menu,
    X,
    User,
    LogOut,
    LayoutDashboard,
    ChevronDown,
    Stethoscope,
} from "lucide-react";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
        setShowDropdown(false);
    };

    const getDashboardPath = () => {
        if (user?.role === "doctor") return "/doctor";
        if (user?.role === "admin") return "/admin";
        return "/patient";
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Top Bar */}
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-white">
                            HealHub
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">

                        <Link
                            to="/"
                            className="text-gray-300 hover:text-white text-sm transition"
                        >
                            Home
                        </Link>

                        <Link
                            to="/doctors"
                            className="text-gray-300 hover:text-white text-sm transition"
                        >
                            Find Doctors
                        </Link>

                        {isAuthenticated ? (
                            <div className="relative">

                                {/* Profile Button */}
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
                                >
                                    <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-medium">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>

                                    <span className="text-sm text-white">
                                        {user?.name?.split(" ")[0]}
                                    </span>

                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </button>

                                {/* Dropdown */}
                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-56 bg-[#111827] border border-white/10 rounded-xl shadow-lg py-2">

                                        <div className="px-4 py-2 border-b border-white/10">
                                            <p className="text-xs text-gray-400">
                                                Signed in as
                                            </p>
                                            <p className="text-sm text-white truncate">
                                                {user?.email}
                                            </p>
                                        </div>

                                        <Link
                                            to={getDashboardPath()}
                                            onClick={() => setShowDropdown(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                                        >
                                            <LayoutDashboard className="w-4 h-4" />
                                            Dashboard
                                        </Link>

                                        <Link
                                            to={`${getDashboardPath()}/profile`}
                                            onClick={() => setShowDropdown(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                                        >
                                            <User className="w-4 h-4" />
                                            Profile
                                        </Link>

                                        <div className="border-t border-white/10 my-1"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-4 py-2 w-full text-sm text-red-400 hover:bg-red-500/10"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="text-gray-300 hover:text-white text-sm transition"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="btn-primary text-sm px-4 py-2"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? (
                            <X className="w-6 h-6 text-white" />
                        ) : (
                            <Menu className="w-6 h-6 text-white" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-[#111827] border-t border-white/10">
                    <div className="px-4 py-4 space-y-3">

                        <Link
                            to="/"
                            onClick={() => setIsOpen(false)}
                            className="block text-gray-300 hover:text-white text-sm"
                        >
                            Home
                        </Link>

                        <Link
                            to="/doctors"
                            onClick={() => setIsOpen(false)}
                            className="block text-gray-300 hover:text-white text-sm"
                        >
                            Find Doctors
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link
                                    to={getDashboardPath()}
                                    onClick={() => setIsOpen(false)}
                                    className="block text-gray-300 hover:text-white text-sm"
                                >
                                    Dashboard
                                </Link>

                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsOpen(false);
                                    }}
                                    className="block text-red-400 text-sm"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <div className="pt-3 border-t border-white/10 space-y-2">
                                <Link
                                    to="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="block text-center btn-secondary"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    onClick={() => setIsOpen(false)}
                                    className="block text-center btn-primary"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;