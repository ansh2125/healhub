import React from "react";

const EmptyState = ({ icon: Icon, title, description, action }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center px-4 py-12 sm:py-16">

            {/* Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                {title}
            </h3>

            {/* Description */}
            <p className="text-sm sm:text-base text-gray-400 max-w-md mb-6">
                {description}
            </p>

            {/* Action */}
            {action && (
                <div className="w-full sm:w-auto">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;