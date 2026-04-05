import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    // 🔍 Check auth on load
    const checkAuth = async () => {
        const token = localStorage.getItem("token");

        if (token) {
            try {
                const response = await api.get("/auth/me");
                setUser(response.data.data);
            } catch (error) {
                localStorage.removeItem("token");
                setUser(null);
            }
        }

        setLoading(false);
    };

    // 🔐 LOGIN
    const login = async (email, password) => {
        try {
            const response = await api.post("/auth/login", {
                email,
                password,
            });

            const { token, ...userData } = response.data.data;

            localStorage.setItem("token", token);
            setUser(userData);

            return userData;
        } catch (error) {
            throw error;
        }
    };

    // 📝 REGISTER PATIENT
    const register = async (userData) => {
        try {
            const response = await api.post("/auth/register", userData);

            const { token, ...user } = response.data.data;

            localStorage.setItem("token", token);
            setUser(user);

            return user;
        } catch (error) {
            throw error;
        }
    };

    // 🩺 REGISTER DOCTOR
    const registerDoctor = async (doctorData) => {
        try {
            const response = await api.post(
                "/auth/register/doctor",
                doctorData
            );

            const { token, ...doctor } = response.data.data;

            localStorage.setItem("token", token);
            setUser(doctor);

            return doctor;
        } catch (error) {
            throw error;
        }
    };

    // 🚪 LOGOUT
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        window.location.replace("/login");
    };

    // 🔄 Update user
    const updateUser = (userData) => {
        setUser((prev) => ({ ...prev, ...userData }));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                registerDoctor,
                logout,
                updateUser,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// 🔌 Hook
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
};