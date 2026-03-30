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
    MapPin,
    DollarSign,
    GraduationCap,
    Clock,
} from "lucide-react";
import toast from "react-hot-toast";

const DoctorRegister = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        specialization: "",
        qualification: "",
        experience: "",
        consultationFee: "",
        address: { clinic: "", city: "", state: "" },
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { registerDoctor } = useAuth();
    const navigate = useNavigate();

    const specializations = [
        "General Physician",
        "Cardiologist",
        "Dermatologist",
        "Pediatrician",
        "Orthopedic",
        "Neurologist",
        "Psychiatrist",
        "Gynecologist",
        "ENT Specialist",
        "Ophthalmologist",
        "Dentist",
        "Urologist",
    ];

    // Validate Step 1 before proceeding
    const validateStep1 = () => {
        if (!formData.name.trim()) {
            toast.error("Please enter your name");
            return false;
        }
        if (!formData.email.trim()) {
            toast.error("Please enter your email");
            return false;
        }
        if (!formData.phone.trim()) {
            toast.error("Please enter your phone number");
            return false;
        }
        if (!formData.password || formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return false;
        }
        return true;
    };

    const handleNextStep = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate Step 2 fields
        if (!formData.specialization) {
            toast.error("Please select a specialization");
            return;
        }
        if (!formData.qualification.trim()) {
            toast.error("Please enter your qualification");
            return;
        }
        if (!formData.experience || parseInt(formData.experience) < 0) {
            toast.error("Please enter valid experience");
            return;
        }
        if (!formData.consultationFee || parseInt(formData.consultationFee) <= 0) {
            toast.error("Please enter consultation fee");
            return;
        }
        if (!formData.address.city.trim()) {
            toast.error("Please enter your city");
            return;
        }

        setLoading(true);

        try {
            await registerDoctor({
                ...formData,
                experience: parseInt(formData.experience),
                consultationFee: parseInt(formData.consultationFee),
            });

            toast.success("Registration successful!");
            navigate("/doctor");
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[#0b1120]">
            <div className="w-full max-w-lg">

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
                        Join as a Doctor
                    </h1>

                    <p className="text-sm text-gray-400">
                        Step {step} of 2
                    </p>
                </div>

                {/* Progress */}
                <div className="flex gap-2 mb-6">
                    <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 1 ? "bg-indigo-500" : "bg-white/10"}`} />
                    <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 2 ? "bg-indigo-500" : "bg-white/10"}`} />
                </div>

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <form onSubmit={handleSubmit}>

                        {/* STEP 1 */}
                        {step === 1 && (
                            <div className="space-y-4 animate-fadeIn">

                                {/* Name */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            placeholder="Dr. John Smith"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full h-11 rounded-lg bg-white/5 border border-white/10 text-white px-4 pl-12 placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        <input
                                            type="email"
                                            placeholder="doctor@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full h-11 rounded-lg bg-white/5 border border-white/10 text-white px-4 pl-12 placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        <input
                                            type="tel"
                                            placeholder="+1 (555) 000-0000"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full h-11 rounded-lg bg-white/5 border border-white/10 text-white px-4 pl-12 placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min 6 characters"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full h-11 rounded-lg bg-white/5 border border-white/10 text-white px-4 pl-12 pr-12 placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors"
                                            minLength={6}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="w-full h-11 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors"
                                >
                                    Continue
                                </button>
                            </div>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <div className="space-y-4 animate-fadeIn">

                                {/* Specialization */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Specialization</label>
                                    <select
                                        value={formData.specialization}
                                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                        className="w-full h-11 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="" className="bg-gray-800">Select Specialization</option>
                                        {specializations.map((s) => (
                                            <option key={s} value={s} className="bg-gray-800">{s}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Qualification */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Qualification</label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            placeholder="MD, MBBS, etc."
                                            value={formData.qualification}
                                            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                            className="w-full h-11 rounded-lg bg-white/5 border border-white/10 text-white px-4 pl-12 placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Experience & Fee - FIXED! */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Experience */}
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1.5">Experience (Years)</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                            <input
                                                type="number"
                                                placeholder="5"
                                                min="0"
                                                max="50"
                                                value={formData.experience}
                                                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                                className="w-full h-11 rounded-lg bg-white/5 border border-white/10 text-white px-4 pl-12 placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Consultation Fee */}
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1.5">Fee ($)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                            <input
                                                type="number"
                                                placeholder="100"
                                                min="1"
                                                value={formData.consultationFee}
                                                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                                                className="w-full h-11 rounded-lg bg-white/5 border border-white/10 text-white px-4 pl-12 placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">City</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            placeholder="New York"
                                            value={formData.address.city}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, city: e.target.value },
                                            })}
                                            className="w-full h-11 rounded-lg bg-white/5 border border-white/10 text-white px-4 pl-12 placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 h-11 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                                    >
                                        Back
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 h-11 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white font-medium transition-colors flex items-center justify-center"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            "Register"
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>

                    {/* Sign In Link */}
                    <p className="text-center text-sm text-gray-400 mt-6">
                        Already registered?{" "}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <p className="text-center text-sm text-gray-500 mt-4">
                    <Link to="/" className="hover:text-white transition-colors">
                        ← Back to Home
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default DoctorRegister;