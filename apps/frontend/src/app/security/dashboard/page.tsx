"use client";

import { useState, useEffect, useCallback } from 'react';
import { LogIn, ClipboardList, QrCode, Eye } from 'lucide-react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { StatCard } from '@/shared/components/ui/StatCard';
import { TabSelector } from '@/shared/components/ui/TabSelector';
import { FilterBar } from '@/shared/components/ui/FilterBar';
import { PrimaryButton } from '@/shared/components/ui/primary-button';
import { QrScanner } from './QrScanner';
import { ManualEntry } from './ManualEntry';
import { getGateStats, getGateEvents, GateStats, GateLogRow } from '@/features/gate/lib/gate-api';
import clsx from 'clsx';

type Tab = 'Attendance Log' | 'Manual Entry' | 'Scan QR';

export default function SecurityDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Attendance Log');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [stats, setStats] = useState<GateStats>({ checkIns: 0, manualEntries: 0, qrScans: 0, currentlyInside: 0 });
  const [logs, setLogs] = useState<GateLogRow[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLogsLoading(true);
    const [statsRes, logsRes] = await Promise.all([
      getGateStats(),
      getGateEvents({ method: statusFilter || undefined, date: timeFilter || undefined }),
    ]);
    if (statsRes.ok) setStats(statsRes.data);
    if (logsRes.ok) setLogs(logsRes.data);
    setLogsLoading(false);
  }, [statusFilter, timeFilter]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void fetchData(); }, [fetchData]);

  const filteredLogs = logs.filter(log =>
    search ? log.student_id_no.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="flex flex-col gap-6 w-full pr-2 pb-12">
      <PageHeader title="Gate Log" subtitle="Security Dashboard" onRefresh={fetchData} />

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Check-ins"
          value={String(stats.checkIns)}
          icon={LogIn}
          variant="default"
        />
        <StatCard
          title="Manual Entries"
          value={String(stats.manualEntries)}
          icon={ClipboardList}
          variant="default"
          action={
            <PrimaryButton
              variant="blue"
              onClick={() => setActiveTab('Manual Entry')}
              className="px-4 py-1.5 text-xs font-bold rounded-full flex items-center justify-center m-0"
            >
              View
            </PrimaryButton>
          }
        />
        <StatCard
          title="QR Scans"
          value={String(stats.qrScans)}
          icon={QrCode}
          variant="default"
          action={
            <PrimaryButton
              variant="blue"
              onClick={() => setActiveTab('Scan QR')}
              className="px-4 py-1.5 text-xs font-bold rounded-full flex items-center justify-center m-0"
            >
              Scan
            </PrimaryButton>
          }
        />
        <StatCard
          title="Currently Inside"
          value={String(stats.currentlyInside)}
          icon={Eye}
          variant="success"
        />
      </div>

      {/* Filter Bar + Tabs row */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mt-2">
        {activeTab === 'Attendance Log' ? (
          <FilterBar
            searchPlaceholder="Search Student by ID"
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              {
                id: 'status',
                label: 'All Statuses',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { label: 'QR',     value: 'qr'     },
                  { label: 'Manual', value: 'manual' },
                ],
              },
              {
                id: 'time',
                label: 'Any Time',
                value: timeFilter,
                onChange: setTimeFilter,
                options: [
                  { label: 'Today',     value: 'today'     },
                  { label: 'Yesterday', value: 'yesterday' },
                ],
              },
            ]}
          />
        ) : (
          <div />
        )}

        <div className="shrink-0">
          <TabSelector
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as Tab)}
            options={[
              { id: 'Attendance Log', label: 'Attendance Log' },
              { id: 'Manual Entry',   label: 'Manual Entry'   },
              { id: 'Scan QR',        label: 'Scan QR'        },
            ]}
          />
        </div>
      </div>

      {/* Tab: Attendance Log */}
      {activeTab === 'Attendance Log' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
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
                {logsLoading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-400 text-[13px]">
                      Loading…
                    </td>
                  </tr>
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
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
      )}

      {/* Tab: Manual Entry */}
      {activeTab === 'Manual Entry' && <ManualEntry />}

      {/* Tab: Scan QR */}
      {activeTab === 'Scan QR' && <QrScanner />}
    </div>
  );
}
