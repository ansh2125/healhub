import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔐 Attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ⚠️ Handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.message || "Something went wrong";

        if (error.response?.status === 401) {
            localStorage.removeItem("token");

            if (!window.location.pathname.includes("/login")) {
                window.location.replace("/login");
            }
        } else {
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

export default api;