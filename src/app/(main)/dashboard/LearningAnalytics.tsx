"use client";

import { TrendingUp } from "lucide-react";
import { useState } from "react";

export function LearningAnalytics() {
  const [timeframe, setTimeframe] = useState<"week" | "month">("week");

  const weeklyData = [
    { label: "Mon", value: 30, color: "bg-primary-100 dark:bg-primary-900/30", hover: "hover:bg-primary-200" },
    { label: "Tue", value: 60, color: "bg-secondary-300", hover: "hover:bg-secondary-400" },
    { label: "Wed", value: 20, color: "bg-primary-100 dark:bg-primary-900/30", hover: "hover:bg-primary-200" },
    { label: "Thu", value: 80, color: "bg-blue-300", hover: "hover:bg-blue-400" },
    { label: "Fri", value: 50, color: "bg-primary-100 dark:bg-primary-900/30", hover: "hover:bg-primary-200" },
    { label: "Sat", value: 40, color: "bg-primary-100 dark:bg-primary-900/30", hover: "hover:bg-primary-200" },
    { label: "Sun", value: 100, color: "bg-secondary-400 font-bold", hover: "hover:bg-secondary-500 shadow-[var(--shadow-glow-secondary)] text-secondary-600" },
  ];

  const monthlyData = [
    { label: "Week 1", value: 40, color: "bg-primary-100 dark:bg-primary-900/30", hover: "hover:bg-primary-200" },
    { label: "Week 2", value: 75, color: "bg-blue-300", hover: "hover:bg-blue-400" },
    { label: "Week 3", value: 55, color: "bg-primary-100 dark:bg-primary-900/30", hover: "hover:bg-primary-200" },
    { label: "Week 4", value: 90, color: "bg-secondary-400 font-bold", hover: "hover:bg-secondary-500 text-secondary-600" },
  ];

  const data = timeframe === "week" ? weeklyData : monthlyData;

  return (
    <section className="bg-bg-elevated rounded-2xl border border-border p-6 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-extrabold flex items-center gap-2">
          <TrendingUp size={20} className="text-primary-500" />
          Learning Analytics
        </h2>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as "week" | "month")}
          className="bg-bg-secondary text-sm border-border rounded-lg px-3 py-1.5 text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <div className="flex items-end gap-2 sm:gap-4 h-48 mt-4 pt-4 border-b border-border w-full relative">
        {/* Grid Lines */}
        <div className="absolute w-full top-0 border-t border-dashed border-border-strong opacity-40"></div>
        <div className="absolute w-full top-12 border-t border-dashed border-border-strong opacity-40"></div>
        <div className="absolute w-full top-24 border-t border-dashed border-border-strong opacity-40"></div>

        {/* Bars */}
        {data.map((item, i) => (
          <div
            key={i}
            style={{ height: `${item.value}%` }}
            className={`flex-1 rounded-t-md relative group duration-300 cursor-pointer ${item.color} ${item.hover}`}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-neutral-800 text-white text-xs py-1 px-2 rounded transition-opacity whitespace-nowrap z-10">
              {item.value} hrs
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center text-xs text-text-muted font-mono mt-3 px-2">
        {data.map((item, i) => (
          <span key={i} className={item.color.includes("font-bold") ? item.color.split(' ').pop() + " font-bold" : ""}>
            {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}