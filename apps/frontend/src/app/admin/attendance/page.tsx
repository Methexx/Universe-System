"use client";

import { useState, useEffect, useCallback } from 'react';
import { StatCard } from '@/shared/components/ui/StatCard';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { TabSelector } from '@/shared/components/ui/TabSelector';
import { FilterBar } from '@/shared/components/ui/FilterBar';
import { PrimaryButton } from '@/shared/components/ui/primary-button';
import { Eye, LogIn, ClipboardList, QrCode, CheckCircle2, XCircle, Calendar as CalendarIcon, X } from 'lucide-react';
import clsx from 'clsx';
import { getGateEvents, getGateStats, GateLogRow, GateStats } from '@/features/gate/lib/gate-api';

const MOCK_CLASSROOM_LOGS = [
  { id: '29854', name: 'Pathirana', class: '11-A' },
  { id: '18392', name: 'Silva', class: '10-B' },
  { id: '29855', name: 'Perera', class: '11-A' },
  { id: '40122', name: 'Fernando', class: '12-C' },
  { id: '10293', name: 'Jayasinghe', class: '10-A' },
];

// Today and 7 days ago as ISO strings for the date picker bounds
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function weekAgoISO() {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return d.toISOString().slice(0, 10);
}

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<'gate' | 'classroom'>('gate');

  // Stats
  const [stats, setStats] = useState<GateStats>({ checkIns: 0, manualEntries: 0, qrScans: 0, currentlyInside: 0 });

  // Gate tab state
  const [gateSearch, setGateSearch] = useState('');
  const [gateStatus, setGateStatus] = useState('');
  const [gateTime, setGateTime] = useState('');       // 'today' | 'yesterday' | 'pick' | ''
  const [gatePickedDate, setGatePickedDate] = useState(''); // YYYY-MM-DD
  const [gateLogs, setGateLogs] = useState<GateLogRow[]>([]);
  const [gateLoading, setGateLoading] = useState(true);

  // Classroom Filters
  const [classSearch, setClassSearch] = useState('');
  const [classMonth, setClassMonth] = useState('');
  const [classWeek, setClassWeek] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const fetchData = useCallback(async () => {
    const dateParam =
      gateTime === 'today'      ? 'today'
      : gateTime === 'yesterday' ? 'yesterday'
      : gateTime === 'pick'      ? (gatePickedDate || undefined)
      : undefined;

    setGateLoading(true);
    const [statsRes, logsRes] = await Promise.all([
      getGateStats(),
      getGateEvents({ method: gateStatus || undefined, date: dateParam }),
    ]);
    if (statsRes.ok) setStats(statsRes.data);
    if (logsRes.ok) setGateLogs(logsRes.data);
    setGateLoading(false);
  }, [gateStatus, gateTime, gatePickedDate]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void fetchData(); }, [fetchData]);

  const filteredGateLogs = gateLogs.filter(log =>
    gateSearch ? log.student_id_no.toLowerCase().includes(gateSearch.toLowerCase()) : true
  );

  const filteredClassroomLogs = MOCK_CLASSROOM_LOGS.filter(log => {
    const matchesSearch = log.id.includes(classSearch) || log.name.toLowerCase().includes(classSearch.toLowerCase());
    const matchesClass = classFilter ? log.class === classFilter : true;
    return matchesSearch && matchesClass;
  });

  const handleTimeFilterChange = (val: string) => {
    setGateTime(val);
    if (val !== 'pick') setGatePickedDate('');
  };

  const renderGateTable = () => (
    <>
      <div className="flex flex-wrap items-center gap-3 w-full">
        <FilterBar
          searchPlaceholder="Search Student by ID"
          searchValue={gateSearch}
          onSearchChange={setGateSearch}
          filters={[
            {
              id: 'status',
              label: 'All Statuses',
              value: gateStatus,
              onChange: setGateStatus,
              options: [
                { label: 'QR',     value: 'qr'     },
                { label: 'Manual', value: 'manual' },
              ],
            },
            {
              id: 'time',
              label: 'Any Time',
              value: gateTime,
              onChange: handleTimeFilterChange,
              options: [
                { label: 'Today',     value: 'today'     },
                { label: 'Yesterday', value: 'yesterday' },
                { label: 'Pick a day', value: 'pick'    },
              ],
            },
          ]}
        />

        {gateTime === 'pick' && (
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm text-sm text-gray-700">
            <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="date"
              value={gatePickedDate}
              min={weekAgoISO()}
              max={todayISO()}
              onChange={e => setGatePickedDate(e.target.value)}
              className="outline-none bg-transparent text-sm text-gray-700 cursor-pointer"
            />
            {gatePickedDate && (
              <button
                onClick={() => setGatePickedDate('')}
                className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mt-6">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b border-gray-100 text-gray-400 font-semibold text-[13px]">
              <tr>
                <th className="py-4 px-6 text-center">Student ID</th>
                <th className="py-4 px-6 text-center">Date</th>
                <th className="py-4 px-6 text-center">Check In</th>
                <th className="py-4 px-6 text-center">Check Out</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[#334155] font-medium text-[13px]">
              {gateLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400 text-[13px]">
                    Loading…
                  </td>
                </tr>
              ) : filteredGateLogs.length > 0 ? (
                filteredGateLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-center">{log.student_id_no}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="block font-bold text-[#0f172a]">{log.timeLabel}</span>
                      <span className="block text-[12px] text-[#64748b] mt-0.5">{log.date}</span>
                    </td>
                    <td className="py-4 px-6 text-center">{log.checkIn ?? '— : —'}</td>
                    <td className="py-4 px-6 text-center text-gray-400">{log.checkOut ?? '— : —'}</td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={clsx(
                          'inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[11px] font-bold min-w-[70px]',
                          log.method === 'qr'
                            ? 'bg-[#dcfce7] text-[#16a34a] border border-green-200'
                            : log.method === 'auto'
                            ? 'bg-[#f3e8ff] text-[#7c3aed] border border-purple-200'
                            : 'bg-[#dbeafe] text-[#1d4ed8] border border-blue-200'
                        )}
                      >
                        {log.method === 'qr' ? 'QR' : log.method === 'auto' ? 'Auto' : 'Manual'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400 text-[13px]">
                    No logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderClassroomTable = () => {
    const days = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

    const generateStatus = (day: number, rowIndex: number) => {
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
                { label: 'May 2024',   value: 'May 2024'   },
                { label: 'June 2024',  value: 'June 2024'  },
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
                { label: 'Week 4', value: 'Week 4' },
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
                { label: '12-C', value: '12-C' },
              ],
              value: classFilter,
              onChange: setClassFilter,
            },
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
                  {days.map(day => (
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
      <PageHeader
        title="Attendance"
        subtitle="Welcome back Methum Pathirana!"
        onRefresh={fetchData}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Check-ins"
          value={String(stats.checkIns)}
          icon={LogIn}
          variant="default"
        />
        <StatCard
          title="Manual Gate Logs"
          value={String(stats.manualEntries)}
          icon={ClipboardList}
          variant="default"
          action={
            <PrimaryButton variant="blue" className="px-4 py-1.5 text-xs font-bold rounded-full">
              View
            </PrimaryButton>
          }
        />
        <StatCard
          title="QR Scans"
          value={String(stats.qrScans)}
          icon={QrCode}
          variant="default"
        />
        <StatCard
          title="Currently Inside"
          value={String(stats.currentlyInside)}
          icon={Eye}
          variant="default"
        />
      </div>

      {/* Main Content Area */}
      <div className="mt-8 flex flex-col min-h-[500px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-[#0f172a]">Attendance History</h2>
            <TabSelector
              options={[
                { id: 'gate',      label: 'Gate'       },
                { id: 'classroom', label: 'Class Room' },
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
