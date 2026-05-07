"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface AttendanceDonutChartProps {
  todayAttendance: number;
  activeStudents: number;
  suspendedAccounts: number;
}

export function AttendanceDonutChart({
  todayAttendance,
  activeStudents,
  suspendedAccounts,
}: AttendanceDonutChartProps) {
  const total = todayAttendance + activeStudents + suspendedAccounts;

  // When all values are 0 show a neutral placeholder so the chart renders
  const pieData =
    total === 0
      ? [{ name: "No data", value: 1, color: "#e2e8f0" }]
      : [
          { name: "Suspended Accounts", value: suspendedAccounts, color: "#f97316" },
          { name: "Today's Attendance", value: todayAttendance, color: "#1e293b" },
          { name: "Active Students", value: activeStudents, color: "#cbd5e1" },
        ];

  return (
    <div className="col-span-1 flex flex-col items-center justify-center relative h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            innerRadius={65}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
            startAngle={90}
            endAngle={450}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[14px] font-bold text-[#1e293b]">Attendance</span>
      </div>
    </div>
  );
}
