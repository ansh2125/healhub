import React from "react";
import { Link } from "react-router-dom";
import { Stethoscope, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-[#0b1120] border-t border-white/10 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* Logo + About */}
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center">
                                <Stethoscope className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-semibold text-white">
                                HealHub
                            </span>
                        </Link>

                        <p className="text-sm text-gray-400 leading-relaxed">
                            Your trusted platform for booking doctor appointments easily and securely.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">
                            Quick Links
                        </h3>

                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    to="/doctors"
                                    className="text-gray-400 hover:text-white transition"
                                >
                                    Find Doctors
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/register"
                                    className="text-gray-400 hover:text-white transition"
                                >
                                    Book Appointment
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/doctor/register"
                                    className="text-gray-400 hover:text-white transition"
                                >
                                    Join as Doctor
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Specializations */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">
                            Specializations
                        </h3>

                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>Cardiologist</li>
                            <li>Dermatologist</li>
                            <li>Pediatrician</li>
                            <li>Neurologist</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">
                            Contact
                        </h3>

                        <ul className="space-y-3 text-sm text-gray-400">
                            <li className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-indigo-400" />
                                123 Healthcare Ave
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-indigo-400" />
                                +1 (555) 123-4567
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-indigo-400" />
                                support@healhub.com
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-white/10 mt-8 pt-6 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} HealHub. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;