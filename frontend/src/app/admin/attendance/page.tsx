"use client";

import React, { useState } from 'react';
import { StatCard } from '@/shared/components/ui/StatCard';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { TabSelector } from '@/shared/components/ui/TabSelector';
import { Eye, Search, Filter, Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';
import clsx from 'clsx';

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<'gate' | 'classroom'>('gate');

  const renderGateTable = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-[320px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input 
            type="text" 
            placeholder="Search Student by ID" 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              All Statuses
              <Filter className="h-4 w-4 text-gray-400" />
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              Class 11A
              <Filter className="h-4 w-4 text-gray-400" />
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              Today
              <Filter className="h-4 w-4 text-gray-400" />
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white border-b border-gray-200 text-gray-500 font-medium">
            <tr>
              <th className="py-4 px-6 text-center">Student ID</th>
              <th className="py-4 px-6 text-center">Date</th>
              <th className="py-4 px-6 text-center">Check In</th>
              <th className="py-4 px-6 text-center">Check Out</th>
              <th className="py-4 px-6 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-900 font-medium bg-white">
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="hover:bg-gray-50/50">
                <td className="py-4 px-6 text-center">29854</td>
                <td className="py-4 px-6 text-center">
                  <span className="block font-bold">Today</span>
                  <span className="block text-xs font-normal text-gray-400 mt-1">Oct 25, 2024</span>
                </td>
                <td className="py-4 px-6 text-center">09:12 AM</td>
                <td className="py-4 px-6 text-center text-gray-400">-- : --</td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#dcfce7] text-[#16a34a] text-xs font-bold min-w-[70px]">
                    QR
                  </span>
                </td>
              </tr>
            ))}
             <tr className="hover:bg-gray-50/50">
                <td className="py-4 px-6 text-center">29854</td>
                <td className="py-4 px-6 text-center">
                  <span className="block font-bold">Today</span>
                  <span className="block text-xs font-normal text-gray-400 mt-1">Oct 25, 2024</span>
                </td>
                <td className="py-4 px-6 text-center">09:12 AM</td>
                <td className="py-4 px-6 text-center text-gray-400">-- : --</td>
                <td className="py-4 px-6 text-center">
                   <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#bbf7d0] text-[#16a34a] text-xs font-bold min-w-[70px] bg-opacity-40">
                      Manual
                    </span>
                </td>
              </tr>
          </tbody>
        </table>
      </div>
    </>
  );

  const renderClassroomTable = () => {
    const days = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
    
    // Helper to generate some random checkmarks/crosses for the mockup
    const generateStatus = (day: number, rowIndex: number) => {
      // Just creating a stable pattern for the visual
      const isAbsent = (day + rowIndex) % 5 === 0 || (day === 10 && rowIndex % 2 !== 0);
      return isAbsent ? (
        <XCircle className="w-5 h-5 text-red-500 fill-red-100" />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-100" />
      );
    };

    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-[320px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search Student by ID" 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                April 2024
                <Filter className="h-4 w-4 text-gray-400" />
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                Week 2-3
                <Filter className="h-4 w-4 text-gray-400" />
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                Class 11A
                <Filter className="h-4 w-4 text-gray-400" />
             </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[1000px]">
            <thead className="bg-[#fafafa] border-b border-gray-200 text-gray-400 font-semibold text-xs tracking-wider">
              <tr>
                <th className="py-4 px-6">Student ID</th>
                {days.map(day => (
                  <th key={day} className="py-4 px-2 text-center text-[13px]">
                    {String(day).padStart(2, '0')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 font-medium bg-white">
              {[...Array(6)].map((_, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50/50">
                  <td className="py-4 px-6 text-[13px] text-[#475569]">
                    Pathirana 29854
                  </td>
                  {days.map((day) => (
                    <td key={day} className="py-4 px-2">
                       <div className="flex justify-center">
                          {generateStatus(day, rowIndex)}
                       </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col gap-[20px] pb-12 w-full pr-2">
      {/* Top Header Row / Actions */}
      <PageHeader 
        title="Attendance"
        subtitle="Welcome back Methum Pathirana!"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Today's Attendance" 
          value="13245" 
          icon={Eye} 
          trendValue="+12.5%" 
          variant="default" 
        />
        <StatCard 
          title="Manual Gate Logs" 
          value="48" 
          icon={Eye} 
          variant="default" 
          action={
            <button className="px-4 py-1.5 bg-[#3b82f6] text-white text-xs font-bold rounded-full hover:bg-blue-600 transition-colors">
              View
            </button>
          }
        />
        <StatCard 
          title="AI Absence Patterns Detections" 
          value="10" 
          icon={Eye} 
          variant="danger" 
          action={
            <button className="px-4 py-1.5 bg-[#475569] text-white text-xs font-bold rounded-full hover:bg-slate-700 transition-colors">
              View
            </button>
          }
        />
        <StatCard 
          title="Late Attendance" 
          value="10" 
          icon={Eye} 
          variant="danger" 
          action={
            <button className="px-4 py-1.5 bg-[#475569] text-white text-xs font-bold rounded-full hover:bg-slate-700 transition-colors">
              View
            </button>
          }
        />
      </div>

      {/* Main Content Area */}
      <div className="mt-8 flex flex-col min-h-[500px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-[#0f172a]">Attendance History</h2>
            <TabSelector 
              options={[
                { id: 'gate', label: 'Gate' },
                { id: 'classroom', label: 'Class Room' }
              ]}
              activeTab={activeTab}
              onTabChange={(id) => setActiveTab(id as 'gate' | 'classroom')}
            />
          </div>
        </div>

        {activeTab === 'gate' ? renderGateTable() : renderClassroomTable()}
      </div>
    </div>
  );
}
