"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { TabSelector } from '@/shared/components/ui/TabSelector';
import { FilterBar } from '@/shared/components/ui/FilterBar';
import { MoreVertical, X, Check } from 'lucide-react';
import clsx from 'clsx';

type TabType = 'Gate' | 'Pending requests' | 'All users';

const GATE_LOGS = [
  { id: '1', studentId: '29854', date: 'Oct 25, 2024', timeLabel: 'Today', checkIn: '09:12 AM', checkOut: '-- : --', status: 'QR' },
  { id: '2', studentId: '38491', date: 'Oct 25, 2024', timeLabel: 'Today', checkIn: '08:45 AM', checkOut: '02:30 PM', status: 'QR' },
  { id: '3', studentId: '83920', date: 'Oct 25, 2024', timeLabel: 'Today', checkIn: '07:30 AM', checkOut: '-- : --', status: 'QR' },
  { id: '4', studentId: '29854', date: 'Oct 25, 2024', timeLabel: 'Today', checkIn: '09:12 AM', checkOut: '-- : --', status: 'Manual' },
  { id: '5', studentId: '10293', date: 'Oct 25, 2024', timeLabel: 'Today', checkIn: '10:05 AM', checkOut: '-- : --', status: 'Manual' },
  { id: '6', studentId: '48573', date: 'Oct 24, 2024', timeLabel: 'Yesterday', checkIn: '07:15 AM', checkOut: '03:00 PM', status: 'Manual' },
];

const PENDING_REQUESTS = [
  { id: '1', name: 'Dizzpy Sanchez', requestTo: 'Admin Access', date: 'Oct 24, 2024', assignedClass: '' },
  { id: '2', name: 'Maria Sharapova', requestTo: 'Teacher Access', date: 'Oct 24, 2024', assignedClass: 'Default' },
  { id: '3', name: 'James Clear', requestTo: 'Security Access', date: 'Oct 23, 2024', assignedClass: '' },
  { id: '4', name: 'Sarah Connor', requestTo: 'Admin Access', date: 'Oct 23, 2024', assignedClass: '' },
  { id: '5', name: 'Michael Jordan', requestTo: 'Security Access', date: 'Oct 22, 2024', assignedClass: '' },
];

const ALL_USERS = [
  { id: '1', name: 'Amara Nkwonta', email: 'amara.nkwonta@example.com', teacherId: '204857', class: '11-B', gender: 'Female', avatar: '' },
  { id: '2', name: 'Ikenna Okoro', email: 'ikenna.okoro@example.com', teacherId: '985730', class: '12B', gender: 'Male', avatar: '' },
  { id: '3', name: 'Ngozi Eze', email: 'ngozi.eze@example.com', teacherId: '685937', class: '7A', gender: 'Female', avatar: '' },
  { id: '4', name: 'Obinna Okafor', email: 'obinna.okafor@example.com', teacherId: '793586', class: 'SS 2', gender: 'Male', avatar: '' },
  { id: '5', name: 'Adaobi Musa', email: 'adaobi.musa@example.com', teacherId: '475869', class: '10-F', gender: 'Female', avatar: '' },
  { id: '6', name: 'Chinedu Obi', email: 'chinedu.obi@example.com', teacherId: '109576', class: 'JSS 2', gender: 'Male', avatar: '' },
];

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('Gate');
  const [pendingRequests, setPendingRequests] = useState(PENDING_REQUESTS);
  
  const [searchGate, setSearchGate] = useState('');
  const [filterStatusGate, setFilterStatusGate] = useState('');
  const [filterClassGate, setFilterClassGate] = useState('');
  const [filterDateGate, setFilterDateGate] = useState('');
  
  const [searchUsers, setSearchUsers] = useState('');
  const [filterRoleUsers, setFilterRoleUsers] = useState('');
  const [filterClassUsers, setFilterClassUsers] = useState('');
  const [filterDateUsers, setFilterDateUsers] = useState('');

  const handleAcceptRequest = (id: string) => {
    setPendingRequests(prev => prev.filter(req => req.id !== id));
  };

  const renderGateTab = () => (
    <div className="bg-white border border-[var(--line)] rounded-[20px] p-6 w-full shadow-sm mt-6">
      <div className="mb-6">
        <FilterBar 
          searchPlaceholder="Search Student by ID"
          searchValue={searchGate}
          onSearchChange={setSearchGate}
          filters={[
            {
              id: 'status',
              label: 'All Statuses',
              value: filterStatusGate,
              onChange: setFilterStatusGate,
              options: [
                { label: 'QR', value: 'QR' },
                { label: 'Manual', value: 'Manual' },
              ]
            },
            {
              id: 'class',
              label: 'Class 11A',
              value: filterClassGate,
              onChange: setFilterClassGate,
              options: [
                { label: 'Class 11A', value: '11A' },
                { label: 'Class 11B', value: '11B' }
              ]
            },
            {
              id: 'date',
              label: 'Today',
              value: filterDateGate,
              onChange: setFilterDateGate,
              options: [
                { label: 'Today', value: 'today' },
                { label: 'Yesterday', value: 'yesterday' }
              ]
            }
          ]}
        />
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
          <thead className="border-b border-gray-100 text-gray-400 font-semibold text-[13px]">
            <tr>
              <th className="py-4 px-6">Student ID</th>
              <th className="py-4 px-6">Date</th>
              <th className="py-4 px-6">Check In</th>
              <th className="py-4 px-6">Check Out</th>
              <th className="py-4 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
            {GATE_LOGS.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[#334155]">{log.studentId}</td>
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <span className="text-[#0f172a] font-semibold">{log.timeLabel}</span>
                    <span className="text-gray-400 text-xs mt-0.5">{log.date}</span>
                  </div>
                </td>
                <td className="py-4 px-6">{log.checkIn}</td>
                <td className="py-4 px-6">{log.checkOut}</td>
                <td className="py-4 px-6">
                  <span className={clsx(
                    "px-4 py-1.5 rounded-full text-[11px] font-bold",
                    log.status === 'QR' ? "bg-[#dcfce7] text-[#16a34a]" : "bg-gray-100 border border-gray-200 text-gray-600"
                  )}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const getRequestBadgeColor = (type: string) => {
    if (type.includes('Admin')) return 'bg-red-50 text-red-500 border border-red-100';
    if (type.includes('Teacher')) return 'bg-emerald-50 text-emerald-500 border border-emerald-100';
    if (type.includes('Security')) return 'bg-amber-50 text-amber-500 border border-amber-100';
    return 'bg-gray-50 text-gray-500';
  };

  const renderPendingRequestsTab = () => (
    <div className="mt-6 flex flex-col gap-4">
      <h2 className="text-[20px] font-bold text-[#0f172a]">Pending Member Requests</h2>
      
      <div className="bg-white border border-gray-200 rounded-[20px] overflow-hidden w-full shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
            <thead className="bg-[#fafafa] border-b border-gray-100 text-gray-500 font-semibold text-[13px]">
              <tr>
                <th className="py-4 px-6">Member Name</th>
                <th className="py-4 px-6 text-center">Request To</th>
                <th className="py-4 px-6">Requested Date</th>
                <th className="py-4 px-6">Assigned Class<br/><span className="text-xs font-normal">(Teacher)</span></th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[#334155] font-medium">
              {pendingRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-6 font-semibold">{req.name}</td>
                  <td className="py-5 px-6 text-center">
                    <span className={clsx("px-4 py-1.5 rounded-full text-[11px] font-bold", getRequestBadgeColor(req.requestTo))}>
                      {req.requestTo}
                    </span>
                  </td>
                  <td className="py-5 px-6">{req.date}</td>
                  <td className="py-5 px-6">
                    {req.assignedClass ? (
                      <select className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 bg-white min-w-[100px] focus:outline-none">
                        <option>Default</option>
                      </select>
                    ) : null}
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleAcceptRequest(req.id)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleAcceptRequest(req.id)}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#0f172a] text-[13px] font-bold rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="py-4 px-6 text-center text-sm font-medium text-gray-400">
          Showing 1 to {pendingRequests.length} of {pendingRequests.length} requests
        </div>
      </div>
    </div>
  );

  const renderAllUsersTab = () => (
    <div className="bg-white border border-[var(--line)] rounded-[20px] overflow-hidden w-full shadow-sm mt-6">
      <div className="p-6 pb-0 mb-6">
        <FilterBar 
          searchPlaceholder="Search User by ID"
          searchValue={searchUsers}
          onSearchChange={setSearchUsers}
          filters={[
            {
              id: 'role',
              label: 'Students',
              value: filterRoleUsers,
              onChange: setFilterRoleUsers,
              options: [
                { label: 'Students', value: 'Students' },
                { label: 'Teachers', value: 'Teachers' }
              ]
            },
            {
              id: 'class',
              label: 'All',
              value: filterClassUsers,
              onChange: setFilterClassUsers,
              options: [
                { label: 'All', value: 'All' },
                { label: '11B', value: '11B' },
                { label: '12B', value: '12B' }
              ]
            },
            {
              id: 'date',
              label: 'Today',
              value: filterDateUsers,
              onChange: setFilterDateUsers,
              options: [
                { label: 'Today', value: 'Today' },
                { label: 'Yesterday', value: 'Yesterday' }
              ]
            }
          ]}
        />
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
          <thead className="bg-[#fafafa] border-y border-gray-100 text-[#0f172a] font-bold text-[13px]">
            <tr>
              <th className="py-4 px-6">Name</th>
              <th className="py-4 px-6">Teacher ID</th>
              <th className="py-4 px-6">Email address</th>
              <th className="py-4 px-6">Class</th>
              <th className="py-4 px-6">Gender</th>
              <th className="py-4 px-6 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
            {ALL_USERS.map((user, idx) => (
              <tr key={user.id} className={clsx(
                "transition-colors",
                idx === 4 ? "bg-[#3b82f6] text-white" : "hover:bg-gray-50/50 text-[#334155]"
              )}>
                <td className="py-3.5 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {/* Avatar placeholder */}
                      <div className="w-full h-full bg-orange-100" />
                    </div>
                    <span className={clsx("font-bold", idx === 4 ? "text-white" : "text-[#0f172a]")}>{user.name}</span>
                  </div>
                </td>
                <td className="py-3.5 px-6">{user.teacherId}</td>
                <td className="py-3.5 px-6 text-sm">{user.email}</td>
                <td className="py-3.5 px-6">{user.class}</td>
                <td className="py-3.5 px-6">{user.gender}</td>
                <td className="py-3.5 px-6 text-right">
                  <button className={clsx(
                    "p-1.5 rounded-md transition-colors",
                    idx === 4 ? "text-white hover:bg-blue-600" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  )}>
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2 pb-12 w-full pr-2">
      <PageHeader 
        title="Logs"
        subtitle=""
      />

      <div className="mt-4">
        <TabSelector
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as TabType)}
          options={[
            { id: 'Gate', label: 'Gate' },
            { id: 'Pending requests', label: 'Pending requests', badge: pendingRequests.length > 0 ? pendingRequests.length : undefined },
            { id: 'All users', label: 'All users' }
          ]}
        />
      </div>

      {activeTab === 'Gate' && renderGateTab()}
      {activeTab === 'Pending requests' && renderPendingRequestsTab()}
      {activeTab === 'All users' && renderAllUsersTab()}

    </div>
  );
}