"use client";

import React, { useState } from 'react';
import { StatCard } from '@/shared/components/ui/StatCard';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { TabSelector } from '@/shared/components/ui/TabSelector';
import { FilterBar } from '@/shared/components/ui/FilterBar';
import { Eye, CheckCircle2, XCircle, Calendar as CalendarIcon } from 'lucide-react';
import clsx from 'clsx';

const MOCK_GATE_LOGS = [
  { id: '29854', dateStr: 'Today', dateFull: 'Oct 25, 2024', checkIn: '09:12 AM', checkOut: '-- : --', status: 'QR', class: '11-A' },
  { id: '18392', dateStr: 'Today', dateFull: 'Oct 25, 2024', checkIn: '08:45 AM', checkOut: '-- : --', status: 'Manual', class: '10-B' },
  { id: '29855', dateStr: 'Yesterday', dateFull: 'Oct 24, 2024', checkIn: '08:30 AM', checkOut: '03:15 PM', status: 'QR', class: '11-A' },
  { id: '40122', dateStr: 'Today', dateFull: 'Oct 25, 2024', checkIn: '09:05 AM', checkOut: '-- : --', status: 'Manual', class: '12-C' },
  { id: '10293', dateStr: 'Yesterday', dateFull: 'Oct 24, 2024', checkIn: '08:25 AM', checkOut: '03:10 PM', status: 'QR', class: '10-A' },
];

const MOCK_CLASSROOM_LOGS = [
  { id: '29854', name: 'Pathirana', class: '11-A' },
  { id: '18392', name: 'Silva', class: '10-B' },
  { id: '29855', name: 'Perera', class: '11-A' },
  { id: '40122', name: 'Fernando', class: '12-C' },
  { id: '10293', name: 'Jayasinghe', class: '10-A' },
];

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<'gate' | 'classroom'>('gate');
  
  // Gate Filters
  const [gateSearch, setGateSearch] = useState('');
  const [gateStatus, setGateStatus] = useState('');
  const [gateClass, setGateClass] = useState('');
  const [gateTime, setGateTime] = useState('');

  // Classroom Filters
  const [classSearch, setClassSearch] = useState('');
  const [classMonth, setClassMonth] = useState('');
  const [classWeek, setClassWeek] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Filter Logic
  const filteredGateLogs = MOCK_GATE_LOGS.filter(log => {
    const matchesSearch = log.id.includes(gateSearch);
    const matchesStatus = gateStatus ? log.status.toLowerCase() === gateStatus : true;
    const matchesClass = gateClass ? log.class === gateClass : true;
    const matchesTime = gateTime ? log.dateStr.toLowerCase() === gateTime : true;
    return matchesSearch && matchesStatus && matchesClass && matchesTime;
  });

  const filteredClassroomLogs = MOCK_CLASSROOM_LOGS.filter(log => {
    const matchesSearch = log.id.includes(classSearch) || log.name.toLowerCase().includes(classSearch.toLowerCase());
    const matchesClass = classFilter ? log.class === classFilter : true;
    return matchesSearch && matchesClass;
  });

  const renderGateTable = () => (
    <>
      <div className="flex items-center justify-between w-full">
        <FilterBar 
          searchPlaceholder="Search Student by ID"
          searchValue={gateSearch}
          onSearchChange={setGateSearch}
          filters={[
            {
              id: "status",
              label: "All Statuses",
              value: gateStatus,
              onChange: setGateStatus,
              options: [
                { label: "QR", value: "qr" },
                { label: "Manual", value: "manual" }
              ]
            },
            {
              id: "class",
              label: "All Classes",
              value: gateClass,
              onChange: setGateClass,
              options: [
                { label: "10-A", value: "10-A" },
                { label: "10-B", value: "10-B" },
                { label: "11-A", value: "11-A" },
                { label: "12-C", value: "12-C" }
              ]
            },
            {
              id: "time",
              label: "Any Time",
              value: gateTime,
              onChange: setGateTime,
              options: [
                { label: "Today", value: "today" },
                { label: "Yesterday", value: "yesterday" }
              ]
            }
          ]}
        />
      </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-6">
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
            {filteredGateLogs.length > 0 ? filteredGateLogs.map((log, i) => (
              <tr key={i} className="hover:bg-gray-50/50">
                <td className="py-4 px-6 text-center">{log.id}</td>
                <td className="py-4 px-6 text-center">
                  <span className="block font-bold">{log.dateStr}</span>
                  <span className="block text-xs font-normal text-gray-400 mt-1">{log.dateFull}</span>
                </td>
                <td className="py-4 px-6 text-center">{log.checkIn}</td>
                <td className="py-4 px-6 text-center text-gray-400">{log.checkOut}</td>
                <td className="py-4 px-6 text-center">
                   <span className={clsx(
                     "inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold min-w-[70px]",
                     log.status === "QR" 
                      ? "bg-[#dcfce7] text-[#16a34a]"
                      : "bg-[#bbf7d0] text-[#16a34a] bg-opacity-40"
                   )}>
                      {log.status}
                    </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No logs found matching your criteria.
                </td>
              </tr>
            )}
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
        <FilterBar
          searchPlaceholder="Search Student by ID or Name"
          searchValue={classSearch}
          onSearchChange={setClassSearch}
          filters={[
            {
              id: 'month',
              label: classMonth || 'Month',
              icon: <CalendarIcon className="h-4 w-4" />,
              options: [
                { label: 'April 2024', value: 'April 2024' },
                { label: 'May 2024', value: 'May 2024' },
                { label: 'June 2024', value: 'June 2024' }
              ],
              value: classMonth,
              onChange: setClassMonth,
            },
            {
              id: 'week',
              label: classWeek || 'Week',
              options: [
                { label: 'Week 1', value: 'Week 1' },
                { label: 'Week 2', value: 'Week 2' },
                { label: 'Week 3', value: 'Week 3' },
                { label: 'Week 4', value: 'Week 4' }
              ],
              value: classWeek,
              onChange: setClassWeek,
            },
            {
              id: 'class',
              label: classFilter || 'Class',
              options: [
                { label: '10-A', value: '10-A' },
                { label: '10-B', value: '10-B' },
                { label: '11-A', value: '11-A' },
                { label: '12-C', value: '12-C' }
              ],
              value: classFilter,
              onChange: setClassFilter,
            }
          ]}
        />

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto mt-6">
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
              {filteredClassroomLogs.length > 0 ? filteredClassroomLogs.map((log, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50/50">
                  <td className="py-4 px-6 text-[13px] text-[#475569]">
                    {log.name} {log.id}
                  </td>
                  {days.map((day) => (
                    <td key={day} className="py-4 px-2">
                       <div className="flex justify-center">
                          {generateStatus(day, rowIndex)}
                       </div>
                    </td>
                  ))}
                </tr>
              )) : (
                <tr>
                  <td colSpan={days.length + 1} className="py-8 text-center text-gray-500">
                    No logs found matching your criteria.
                  </td>
                </tr>
              )}
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
