import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-[#0b1120] text-white">

            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-1 pt-16">
                <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6">
                    <Outlet />
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default MainLayout;