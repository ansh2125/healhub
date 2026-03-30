import React from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

/* 🎨 Consistent Theme Colors */
const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#38bdf8"];

/* 🎯 Shared Tooltip Style */
const tooltipStyle = {
    backgroundColor: "#111827",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    color: "#f9fafb",
    fontSize: "13px",
};

/* =========================
   📈 Line Chart
========================= */
export const AppointmentLineChart = ({ data }) => (
    <div className="card w-full">
        <h3 className="text-sm sm:text-base font-semibold mb-4">
            Appointments Overview
        </h3>

        <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

                <XAxis
                    dataKey="month"
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                />

                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />

                <Tooltip contentStyle={tooltipStyle} />

                <Line
                    type="monotone"
                    dataKey="appointments"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

/* =========================
   📊 Bar Chart
========================= */
export const RevenueBarChart = ({ data }) => (
    <div className="card w-full">
        <h3 className="text-sm sm:text-base font-semibold mb-4">
            Revenue Overview
        </h3>

        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

                <XAxis
                    dataKey="month"
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                />

                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />

                <Tooltip contentStyle={tooltipStyle} />

                <Bar
                    dataKey="revenue"
                    fill="#22c55e"
                    radius={[6, 6, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

/* =========================
   🥧 Pie Chart
========================= */
export const StatusPieChart = ({ data }) => (
    <div className="card w-full">
        <h3 className="text-sm sm:text-base font-semibold mb-4">
            Appointment Status
        </h3>

        <ResponsiveContainer width="100%" height={260}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="count"
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                        />
                    ))}
                </Pie>

                <Tooltip contentStyle={tooltipStyle} />

                <Legend
                    wrapperStyle={{
                        fontSize: "12px",
                        color: "#9ca3af",
                    }}
                />
            </PieChart>
        </ResponsiveContainer>
    </div>
);