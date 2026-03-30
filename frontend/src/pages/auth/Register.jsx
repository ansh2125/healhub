import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    Phone,
    Stethoscope,
} from "lucide-react";
import toast from "react-hot-toast";

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        gender: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...userData } = formData;
            await register(userData);

            toast.success("Registration successful!");
            navigate("/patient");
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
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
                        Create Account
                    </h1>

                    <p className="text-sm text-gray-400">
                        Join HealHub as a patient
                    </p>
                </div>

                {/* Card */}
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Name */}
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="w-full h-11 rounded-lg bg-white/5 border border-white/10 text-white px-4 pl-12 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                required
                            />
                        </div>

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

                        {/* Phone */}
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                                className="w-full h-11 rounded-lg bg-white/5 border border-white/10 text-white px-4 pl-12 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Gender (FIXED) */}
                        <div className="relative">
                            <select
                                value={formData.gender}
                                onChange={(e) =>
                                    setFormData({ ...formData, gender: e.target.value })
                                }
                                className="w-full h-11 rounded-lg bg-[#0b1120] border border-white/10 text-white px-4 appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="" className="bg-[#0b1120] text-gray-400">
                                    Select Gender
                                </option>
                                <option value="male" className="bg-[#0b1120] text-white">
                                    Male
                                </option>
                                <option value="female" className="bg-[#0b1120] text-white">
                                    Female
                                </option>
                                <option value="other" className="bg-[#0b1120] text-white">
                                    Other
                                </option>
                            </select>

                            {/* custom arrow */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                ▼
                            </div>
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

                        {/* Confirm Password */}
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        confirmPassword: e.target.value,
                                    })
                                }
                                className="w-full h-11 rounded-lg bg-white/5 border border-white/10 text-white px-4 pl-12 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                required
                            />
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
                                "Create Account"
                            )}
                        </button>

                    </form>

                    {/* Footer */}
                    <div className="mt-5 text-center text-sm text-gray-400">
                        Already have an account?{" "}
                        <Link to="/login" className="text-indigo-400">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;