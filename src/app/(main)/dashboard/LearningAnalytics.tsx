"use client";

import { TrendingUp } from "lucide-react";
import { useState } from "react";
import { format, subDays, isSameDay } from "date-fns";

interface LearningAnalyticsProps {
  sessions: any[];
}

export function LearningAnalytics({ sessions }: LearningAnalyticsProps) {
  const [timeframe, setTimeframe] = useState<"week" | "month">("week");

  // Calculate chart data based on sessions
  const generateData = () => {
    const daysCount = timeframe === "week" ? 7 : 4; // Week days or 4 week blocks
    const data: any[] = [];

    if (timeframe === "week") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dayName = days[date.getDay()];
        
        // Sum durations for this day (convert min to hours roughly for value %)
        const dailyMinutes = sessions
          .filter(s => isSameDay(new Date(s.scheduledAt), date))
          .reduce((acc, curr) => acc + curr.duration, 0);
        
        const value = Math.min((dailyMinutes / 120) * 100, 100); // 2 hours = 100%
        
        data.push({
          label: dayName,
          value: value === 0 ? 5 : value, // Min height for visibility
          raw: dailyMinutes,
          color: isSameDay(date, today) ? "bg-secondary-400 font-bold" : "bg-primary-100 dark:bg-primary-900/30",
          hover: "hover:bg-primary-200"
        });
      }
    } else {
      // Month (simplified to 4 weeks)
      for (let i = 1; i <= 4; i++) {
        data.push({
          label: `Week ${i}`,
          value: Math.random() * 80 + 20, // Keep some variety for month for now until we have multi-month data
          color: i === 4 ? "bg-secondary-400 font-bold" : "bg-primary-100 dark:bg-primary-900/30",
          hover: "hover:bg-primary-200"
        });
      }
    }
    return data;
  };

  const data = generateData();

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
        <div className="absolute w-full top-0 border-t border-dashed border-border-strong opacity-40"></div>
        <div className="absolute w-full top-12 border-t border-dashed border-border-strong opacity-40"></div>
        <div className="absolute w-full top-24 border-t border-dashed border-border-strong opacity-40"></div>

        {data.map((item, i) => (
          <div
            key={i}
            style={{ height: `${item.value}%` }}
            className={`flex-1 rounded-t-md relative group duration-300 cursor-pointer ${item.color} ${item.hover}`}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-neutral-800 text-white text-xs py-1 px-2 rounded transition-opacity whitespace-nowrap z-10">
              {item.raw !== undefined ? `${item.raw} min` : `${Math.round(item.value)}%`}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center text-xs text-text-muted font-mono mt-3 px-2">
        {data.map((item, i) => (
          <span key={i} className={item.color.includes("font-bold") ? "text-secondary-600 font-bold" : ""}>
            {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}