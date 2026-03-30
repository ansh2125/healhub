import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

import MainLayout from "./components/layout/MainLayout";
import DashboardLayout from "./components/layout/DashboardLayout";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DoctorRegister from "./pages/auth/DoctorRegister";
import Doctors from "./pages/Doctors";
import DoctorProfile from "./pages/DoctorProfile";

import PatientDashboard from "./pages/patient/Dashboard";
import PatientAppointments from "./pages/patient/Appointments";
import BookAppointment from "./pages/patient/BookAppointment";
import PatientProfile from "./pages/patient/Profile";

import DoctorDashboard from "./pages/doctor/Dashboard";
import DoctorAppointments from "./pages/doctor/Appointments";
import DoctorPatients from "./pages/doctor/Patients";
import DoctorAvailability from "./pages/doctor/Availability";
import DoctorProfileSettings from "./pages/doctor/ProfileSettings";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminDoctors from "./pages/admin/Doctors";
import AdminAppointments from "./pages/admin/Appointments";
import AdminAnalytics from "./pages/admin/Analytics";

import { motion, AnimatePresence } from "framer-motion";

/* =========================
   🔄 Scroll To Top
========================= */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

/* =========================
   🎬 Page Wrapper (Subtle Animation)
========================= */
const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
};

function AppRoutes() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* 🌐 Public Layout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="doctors" element={<PageWrapper><Doctors /></PageWrapper>} />
            <Route path="doctors/:id" element={<PageWrapper><DoctorProfile /></PageWrapper>} />
          </Route>

          {/* 🔐 Auth */}
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
          <Route path="/doctor/register" element={<PageWrapper><DoctorRegister /></PageWrapper>} />

          {/* 👤 Patient */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <DashboardLayout role="patient" />
              </ProtectedRoute>
            }
          >
            <Route index element={<PageWrapper><PatientDashboard /></PageWrapper>} />
            <Route path="appointments" element={<PageWrapper><PatientAppointments /></PageWrapper>} />
            <Route path="book/:doctorId" element={<PageWrapper><BookAppointment /></PageWrapper>} />
            <Route path="profile" element={<PageWrapper><PatientProfile /></PageWrapper>} />
          </Route>

          {/* 🩺 Doctor */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DashboardLayout role="doctor" />
              </ProtectedRoute>
            }
          >
            <Route index element={<PageWrapper><DoctorDashboard /></PageWrapper>} />
            <Route path="appointments" element={<PageWrapper><DoctorAppointments /></PageWrapper>} />
            <Route path="patients" element={<PageWrapper><DoctorPatients /></PageWrapper>} />
            <Route path="availability" element={<PageWrapper><DoctorAvailability /></PageWrapper>} />
            <Route path="profile" element={<PageWrapper><DoctorProfileSettings /></PageWrapper>} />
          </Route>

          {/* 🛠️ Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout role="admin" />
              </ProtectedRoute>
            }
          >
            <Route index element={<PageWrapper><AdminDashboard /></PageWrapper>} />
            <Route path="users" element={<PageWrapper><AdminUsers /></PageWrapper>} />
            <Route path="doctors" element={<PageWrapper><AdminDoctors /></PageWrapper>} />
            <Route path="appointments" element={<PageWrapper><AdminAppointments /></PageWrapper>} />
            <Route path="analytics" element={<PageWrapper><AdminAnalytics /></PageWrapper>} />
          </Route>

          {/* 🔁 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>

        {/* 🔔 Toast UI (Clean Dark) */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#111827",
              color: "#f9fafb",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
            },
            success: {
              iconTheme: {
                primary: "#22c55e",
                secondary: "#111827",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#111827",
              },
            },
          }}
        />

        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;