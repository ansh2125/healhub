import React from "react";

const Badge = ({ children, variant = "default", className = "" }) => {
    const variants = {
        default: "bg-white/5 text-gray-300 border border-white/10",
        primary: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20",
        success: "bg-green-500/15 text-green-400 border border-green-500/20",
        warning: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
        danger: "bg-red-500/15 text-red-400 border border-red-500/20",
        info: "bg-sky-500/15 text-sky-400 border border-sky-500/20",
    };

    return (
        <span
            className={`
        inline-flex items-center
        px-2.5 py-1
        text-xs font-medium
        rounded-full
        whitespace-nowrap
        ${variants[variant]}
        ${className}
      `}
        >
            {children}
        </span>
    );
};

export default Badge;