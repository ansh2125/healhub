import React from 'react';
import { Link } from 'react-router-dom';
import {
    Search, Calendar, Shield, Clock,
    ArrowRight, Heart, Brain, Bone, Eye, Baby, Stethoscope
} from 'lucide-react';

const Home = () => {
    const features = [
        { icon: Search, title: 'Find Doctors', desc: 'Search qualified doctors across specializations.' },
        { icon: Calendar, title: 'Easy Booking', desc: 'Book appointments instantly with real-time availability.' },
        { icon: Shield, title: 'Verified Doctors', desc: 'All doctors verified with credentials.' },
        { icon: Clock, title: '24/7 Support', desc: 'Round the clock support for your needs.' },
    ];

    const specializations = [
        { icon: Heart, name: 'Cardiologist', color: 'from-red-500 to-pink-500' },
        { icon: Brain, name: 'Neurologist', color: 'from-purple-500 to-indigo-500' },
        { icon: Bone, name: 'Orthopedic', color: 'from-blue-500 to-cyan-500' },
        { icon: Eye, name: 'Ophthalmologist', color: 'from-green-500 to-emerald-500' },
        { icon: Baby, name: 'Pediatrician', color: 'from-orange-500 to-amber-500' },
        { icon: Stethoscope, name: 'General Physician', color: 'from-teal-500 to-cyan-500' },
    ];

    return (
        <div className="min-h-screen overflow-x-hidden">

            {/* HERO */}
            <section className="relative py-20 lg:py-32 overflow-hidden">

                {/* 🔥 background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-purple-500/10 to-transparent blur-3xl"></div>

                <div className="relative max-w-7xl mx-auto px-4 text-center">

                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Your Health, Our <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">Priority</span>
                    </h1>

                    <p className="text-lg md:text-xl text-dark-300 mb-8 max-w-2xl mx-auto">
                        Book appointments with the best doctors in your city.
                        Quality healthcare is just a click away.
                    </p>

                    {/* BUTTONS */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">

                        <Link
                            to="/doctors"
                            className="btn-primary flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition"
                        >
                            Find a Doctor <ArrowRight className="w-5 h-5" />
                        </Link>

                        <Link
                            to="/doctor/register"
                            className="btn-outline hover:scale-105 transition"
                        >
                            Join as Doctor
                        </Link>

                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
                        {[{ v: '500+', l: 'Doctors' }, { v: '50k+', l: 'Patients' }, { v: '100k+', l: 'Appointments' }, { v: '4.9', l: 'Rating' }].map((s, i) => (
                            <div key={i} className="text-center hover:scale-105 transition">
                                <p className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                                    {s.v}
                                </p>
                                <p className="text-dark-400">{s.l}</p>
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* FEATURES */}
            <section className="py-20 bg-dark-900/40 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4">

                    <h2 className="text-3xl font-bold text-white text-center mb-12">
                        Why Choose <span className="text-primary-400">HealHub</span>
                    </h2>

                    <div className="grid md:grid-cols-4 gap-6">

                        {features.map((f, i) => (
                            <div
                                key={i}
                                className="card text-center hover:scale-105 hover:shadow-xl transition duration-300"
                            >
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                                    <f.icon className="w-7 h-7 text-white" />
                                </div>

                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {f.title}
                                </h3>

                                <p className="text-dark-400 text-sm">
                                    {f.desc}
                                </p>
                            </div>
                        ))}

                    </div>
                </div>
            </section>

            {/* SPECIALIZATION */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4">

                    <h2 className="text-3xl font-bold text-white text-center mb-12">
                        Browse by <span className="text-primary-400">Specialization</span>
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

                        {specializations.map((s, i) => (
                            <Link
                                key={i}
                                to={`/doctors?specialization=${s.name}`}
                                className="card text-center group hover:scale-105 transition duration-300"
                            >
                                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-3 group-hover:rotate-6 transition`}>
                                    <s.icon className="w-8 h-8 text-white" />
                                </div>

                                <h3 className="text-sm font-medium text-white">
                                    {s.name}
                                </h3>
                            </Link>
                        ))}

                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4">

                    <div className="card bg-gradient-to-br from-primary-500/20 to-purple-500/20 border-primary-500/30 text-center backdrop-blur">

                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                            Ready to Book Your Appointment?
                        </h2>

                        <p className="text-dark-300 mb-6 text-sm sm:text-base">
                            Join thousands of patients who trust HealHub.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">

                            <Link to="/register" className="btn-primary hover:scale-105 transition">
                                Get Started Free
                            </Link>

                            <Link to="/doctors" className="btn-secondary hover:scale-105 transition">
                                Browse Doctors
                            </Link>

                        </div>

                    </div>

                </div>
            </section>

        </div>
    );
};

export default Home;