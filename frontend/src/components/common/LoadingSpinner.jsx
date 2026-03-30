import React from "react";

const LoadingSpinner = ({ size = "md", className = "" }) => {
    const sizeClasses = {
        sm: "w-10 h-10",
        md: "w-14 h-14",
        lg: "w-20 h-20",
        xl: "w-28 h-28",
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>

            {/* Outer subtle rotating ring */}
            <div className={`relative ${sizeClasses[size]}`}>

                <div className="absolute inset-0 rounded-full border border-white/10"></div>

                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin"></div>

                {/* Logo inside */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src="/favicon.svg"
                        alt="loading"
                        className="w-1/2 h-1/2 opacity-90"
                    />
                </div>

            </div>
        </div>
    );
};

export default LoadingSpinner;