import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatsCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = "primary",
}) => {
    const isPositive = trend === "up";

    const colorClasses = {
        primary: "bg-indigo-500/15 text-indigo-400",
        green: "bg-green-500/15 text-green-400",
        purple: "bg-purple-500/15 text-purple-400",
        orange: "bg-orange-500/15 text-orange-400",
    };

    return (
        <div className="card flex items-center justify-between gap-4">

            {/* Left Content */}
            <div>
                <p className="text-sm text-gray-400 mb-1">{title}</p>

                <h3 className="text-2xl sm:text-3xl font-semibold text-white">
                    {value}
                </h3>

                {trendValue !== undefined && (
                    <div
                        className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? "text-green-400" : "text-red-400"
                            }`}
                    >
                        {isPositive ? (
                            <TrendingUp className="w-4 h-4" />
                        ) : (
                            <TrendingDown className="w-4 h-4" />
                        )}

                        <span className="font-medium">
                            {Math.abs(trendValue)}%
                        </span>

                        <span className="text-gray-500">
                            vs last month
                        </span>
                    </div>
                )}
            </div>

            {/* Icon */}
            <div
                className={`
          p-3 sm:p-4 rounded-xl
          ${colorClasses[color]}
          flex items-center justify-center
        `}
            >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
        </div>
    );
};

export default StatsCard;