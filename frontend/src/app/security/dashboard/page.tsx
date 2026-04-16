"use client";

import React, { useState, useEffect } from 'react';
import { Search, RefreshCcw, History, QrCode } from 'lucide-react';
import clsx from 'clsx';

type Tab = 'Attendance Log' | 'General' | 'Grades';

const GATE_LOGS = [
  { id: '1', studentId: '29854', date: 'Oct 25, 2024', timeLabel: 'Today', checkIn: '09:12 AM', checkOut: '-- : --', status: 'QR' },
  { id: '2', studentId: '29854', date: 'Oct 25, 2024', timeLabel: 'Today', checkIn: '09:12 AM', checkOut: '-- : --', status: 'QR' },
  { id: '3', studentId: '29854', date: 'Oct 25, 2024', timeLabel: 'Today', checkIn: '09:12 AM', checkOut: '-- : --', status: 'QR' },
  { id: '4', studentId: '29854', date: 'Oct 25, 2024', timeLabel: 'Today', checkIn: '09:12 AM', checkOut: '-- : --', status: 'Manual' },
  { id: '5', studentId: '29854', date: 'Oct 25, 2024', timeLabel: 'Today', checkIn: '09:12 AM', checkOut: '-- : --', status: 'Manual' },
  { id: '6', studentId: '29854', date: 'Oct 26, 2024', timeLabel: 'Today', checkIn: '09:12 AM', checkOut: '-- : --', status: 'Manual' },
];

export default function SecurityDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Attendance Log');
  const [search, setSearch] = useState('');
  
  // Local Clock implementation to avoid PageHeader component as requested
  const [time, setTime] = useState<Date | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showColon, setShowColon] = useState(true);

  useEffect(() => {
    const initialSync = setTimeout(() => {
      setTime(new Date());
      setLastUpdated(new Date());
    }, 0);
    const timer = setInterval(() => {
      setTime(new Date());
      setShowColon((prev) => !prev);
    }, 1000);
    return () => {
      clearTimeout(initialSync);
      clearInterval(timer);
    };
  }, []);

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    window.location.reload();
  };

  const formattedTimeParts = time ? {
    hours: String(time.getHours() % 12 || 12).padStart(2, "0"),
    minutes: String(time.getMinutes()).padStart(2, "0"),
    ampm: time.getHours() >= 12 ? "PM" : "AM",
  } : null;

  const formattedDate = time
    ? {
        day: time.toLocaleDateString("en-US", { day: "numeric" }),
        monthYear: time.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      }
    : null;

  const formattedLastUpdated = lastUpdated
    ? lastUpdated.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true })
    : "";

  return (
    <div className="flex flex-col gap-6 w-full pr-2 pb-12">
      {/* Explicitly Custom Top Header per user's "I dont need page header" requirement */}
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:items-center mb-8">
        <h1 className="text-[26px] font-bold text-[#1f2937] leading-tight">     
          Gate Log
        </h1>
        
        {/* Centered Clock */}
        <div className="flex items-center justify-start md:justify-center gap-[10px]">
          <div className="flex items-center text-[38px] font-bold text-[#1e293b] leading-none tracking-tight">
            {formattedTimeParts ? (
              <>
                <span>{formattedTimeParts.hours}</span>
                <span className={clsx("mx-0.5 relative transition-opacity", showColon ? "opacity-100" : "opacity-0")}>:</span>
                <span>{formattedTimeParts.minutes}</span>
                <span className="ml-[6px] text-[36px] font-bold mt-[2px]">        
                  {formattedTimeParts.ampm}
                </span>
              </>
            ) : <span>--:-- --</span>}
          </div>
          {formattedDate && (
            <div className="flex flex-col justify-center">
              <span className="text-[13px] font-bold text-[#475569] leading-tight">{formattedDate.day}</span>
              <span className="text-[12px] font-bold text-[#475569] leading-tight mt-[1px]">{formattedDate.monthYear}</span>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center justify-start md:justify-end gap-3">    
          <div className="flex h-[38px] items-center justify-center gap-2 rounded-full border border-[#d6dffe] bg-[#f4f7fe] px-[18px] text-[13px] font-semibold text-[#4f46e5]">
            <History className="h-[14px] w-[14px]" strokeWidth={2.5} />
            <span className="whitespace-nowrap">Last updated: {formattedLastUpdated}</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#f1f5f9] text-[#475569] transition-all hover:bg-[#e2e8f0]"
          >
            <RefreshCcw className={clsx("h-[16px] w-[16px]", isRefreshing && "animate-spin")} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2 mb-2">
        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Student by ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          {(['Attendance Log', 'General', 'Grades'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "px-6 py-2 rounded-lg text-[13px] font-bold transition-all shadow-sm",
                activeTab === tab 
                  ? "bg-indigo-50 border border-indigo-200 text-indigo-600" 
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="w-full bg-white border border-gray-200 rounded-[20px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b border-gray-100 text-gray-400 font-semibold text-[13px]">
              <tr>
                <th className="py-4 px-8 font-semibold w-[15%]">Student ID</th>
                <th className="py-4 px-8 font-semibold w-[25%] flex justify-center">Date</th>
                <th className="py-4 px-8 font-semibold w-[20%] text-center">Check In</th>
                <th className="py-4 px-8 font-semibold w-[20%] text-center">Check Out</th>
                <th className="py-4 px-8 font-semibold w-[20%] text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[#334155] font-medium text-[13px]">
              {GATE_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-8 text-center">{log.studentId}</td>
                  <td className="py-4 px-8 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-[#0f172a]">{log.timeLabel}</span>
                      <span className="text-[12px] text-[#64748b]">{log.date}</span>
                    </div>
                  </td>
                  <td className="py-4 px-8 text-center">{log.checkIn}</td>
                  <td className="py-4 px-8 text-center">{log.checkOut}</td>
                  <td className="py-4 px-8 text-center">
                    <span className="bg-[#dcfce7] text-[#16a34a] border border-green-200 px-4 py-1.5 rounded-full text-[11px] font-bold">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Scanner Mock UI */}
      <div className="w-full max-w-[800px] h-[340px] mx-auto bg-[#0f172a] rounded-[36px] mt-8 flex flex-col items-center justify-center relative overflow-hidden shadow-xl border border-gray-800">
        <h2 className="text-white text-[24px] font-bold mb-8 z-10 pt-4 tracking-wide">
          Scan your QR Code
        </h2>
        
        {/* Scanner Rectangles */}
        <div className="relative w-[180px] h-[180px] z-10 flex items-center justify-center mb-6">
          {/* Scanner corners (Top left, Top right, Bottom left, Bottom right) */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
          
          {/* Inner pulsating QR icon */}
          <div className="relative bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10 shadow-2xl">
            <QrCode className="w-20 h-20 text-white animate-pulse" strokeWidth={1.5} />
            <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/80 blur-[2px] shadow-[0_0_10px_2px_#3b82f6] animate-[scan_2s_ease-in-out_infinite]" />
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}