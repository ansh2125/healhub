import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, Mail, Lock, Stethoscope } from "lucide-react";
import toast from "react-hot-toast";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = await login(formData.email, formData.password);

            toast.success(`Welcome back, ${user.name}!`);

            navigate(
                user.role === "doctor"
                    ? "/doctor"
                    : user.role === "admin"
                        ? "/admin"
                        : "/patient"
            );
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[#0b1120]">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-6">
                    <Link to="/" className="inline-flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-semibold text-white">
                            HealHub
                        </span>
                    </Link>

                    <h1 className="text-xl font-semibold text-white">
                        Welcome Back
                    </h1>

                    <p className="text-sm text-gray-400">
                        Sign in to continue
                    </p>
                </div>

                {/* Card */}
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Email */}
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                className="w-full h-11 rounded-lg bg-white/5 border border-white/10 text-white px-4 pl-12 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                className="w-full h-11 rounded-lg bg-white/5 border border-white/10 text-white px-4 pl-12 pr-12 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                required
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex justify-center"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                "Sign In"
                            )}
                        </button>

                    </form>

                    {/* Links */}
                    <div className="mt-5 text-center space-y-2 text-sm">
                        <p className="text-gray-400">
                            Don’t have an account?{" "}
                            <Link to="/register" className="text-indigo-400">
                                Sign Up
                            </Link>
                        </p>

                        <Link
                            to="/doctor/register"
                            className="text-gray-500 hover:text-white"
                        >
                            Register as Doctor →
                        </Link>
                    </div>
                </div>

                {/* Demo Credentials */}
                <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5 text-sm">
                    <p className="text-gray-400 text-center mb-3">
                        Demo Credentials
                    </p>

                    <div className="space-y-2 text-gray-300">
                        <div className="flex justify-between">
                            <span>Patient</span>
                            <span className="text-white">patient@test.com</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Doctor</span>
                            <span className="text-white">sarah@healhub.com</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Admin</span>
                            <span className="text-white">admin@healhub.com</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;