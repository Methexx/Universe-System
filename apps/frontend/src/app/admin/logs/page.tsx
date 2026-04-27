"use client";

import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { TabSelector } from '@/shared/components/ui/TabSelector';
import { FilterBar } from '@/shared/components/ui/FilterBar';
import { MoreVertical, X, Check, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import {
  getPendingUsers,
  approvePendingUser,
  rejectPendingUser,
  PendingUser,
  getAllUsers,
  UserProfile,
  suspendUser,
  unsuspendUser,
  deleteUser,
} from "@/features/auth/lib/auth-api";

type TabType = 'Gate' | 'Pending requests' | 'All users';

const GATE_LOGS = [
  { id: '1', studentId: '29854', date: 'Oct 25, 2024', timeLabel: 'Today', checkIn: '09:12 AM', checkOut: '-- : --', status: 'QR' },
  { id: '2', studentId: '38491', date: 'Oct 25, 2024', timeLabel: 'Today', checkIn: '08:45 AM', checkOut: '02:30 PM', status: 'QR' },
  { id: '3', studentId: '83920', date: 'Oct 25, 2024', timeLabel: 'Today', checkIn: '07:30 AM', checkOut: '-- : --', status: 'QR' },
  { id: '4', studentId: '29854', date: 'Oct 25, 2024', timeLabel: 'Today', checkIn: '09:12 AM', checkOut: '-- : --', status: 'Manual' },
  { id: '5', studentId: '10293', date: 'Oct 25, 2024', timeLabel: 'Today', checkIn: '10:05 AM', checkOut: '-- : --', status: 'Manual' },
  { id: '6', studentId: '48573', date: 'Oct 24, 2024', timeLabel: 'Yesterday', checkIn: '07:15 AM', checkOut: '03:00 PM', status: 'Manual' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

/* ───── inline dropdown component ───── */
function UserActionsMenu({
  user,
  onSuspend,
  onUnsuspend,
  onDelete,
}: {
  user: UserProfile;
  onSuspend: () => void;
  onUnsuspend: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const openMenu = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const menuHeight = 150; // approx height of the menu
      const spaceBelow = window.innerHeight - r.bottom;
      
      // If there's not enough space below, open upwards
      const topPos = spaceBelow < menuHeight ? r.top - menuHeight : r.bottom + 4;
      
      // Since it's position: fixed, we only use viewport-relative coordinates
      setPos({ top: topPos, left: r.right - 192 });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const wrap = (fn: () => void) => () => { setOpen(false); fn(); };

  return (
    <>
      <button
        ref={btnRef}
        onClick={openMenu}
        className="p-1.5 rounded-md transition-colors text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, width: 192 }}
          className="bg-white border border-gray-200 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] py-1 text-left"
        >
          <button
            onClick={wrap(onUnsuspend)}
            disabled={!user.is_suspended}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Reactivate
          </button>
          <button
            onClick={wrap(onSuspend)}
            disabled={user.is_suspended}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Freeze Account
          </button>
          <hr className="my-1 border-gray-100" />
          <button
            onClick={wrap(onDelete)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete User
          </button>
        </div>
      )}
    </>
  );
}


export default function LogsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('Gate');

  const [searchGate, setSearchGate] = useState('');
  const [filterStatusGate, setFilterStatusGate] = useState('');
  const [filterClassGate, setFilterClassGate] = useState('');
  const [filterDateGate, setFilterDateGate] = useState('');

  const [searchUsers, setSearchUsers] = useState('');
  const [filterRoleUsers, setFilterRoleUsers] = useState('');

  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingAllUsers, setLoadingAllUsers] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<Record<string, "approving" | "rejecting" | null>>({});

  useEffect(() => {
    getPendingUsers().then((result) => {
      if (result.ok) {
        setPendingUsers(result.data);
        const defaults: Record<string, string> = {};
        result.data.forEach((u) => { defaults[u.id] = u.requested_role || "teacher"; });
        setSelectedRoles(defaults);
      }
      setLoadingPending(false);
    });

    getAllUsers().then((result) => {
      if (result.ok) {
        setAllUsers(result.data);
      }
      setLoadingAllUsers(false);
    });
  }, []);

  const handleApprove = async (id: string) => {
    const role = selectedRoles[id] ?? "teacher";
    setProcessing((p) => ({ ...p, [id]: "approving" }));
    const result = await approvePendingUser(id, role);
    setProcessing((p) => ({ ...p, [id]: null }));
    if (result.ok) {
      setPendingUsers(prev => prev.filter(req => req.id !== id));
      getAllUsers().then((res) => {
        if (res.ok) setAllUsers(res.data);
      });
    }
  };

  const handleReject = async (id: string) => {
    setProcessing((p) => ({ ...p, [id]: "rejecting" }));
    const result = await rejectPendingUser(id);
    setProcessing((p) => ({ ...p, [id]: null }));
    if (result.ok) {
      setPendingUsers(prev => prev.filter(req => req.id !== id));
    }
  };

  const handleSuspend = async (id: string) => {
    const res = await suspendUser(id);
    if (res.ok) setAllUsers(prev => prev.map(u => u.id === id ? { ...u, is_suspended: true, is_active: false } : u));
  };

  const handleUnsuspend = async (id: string) => {
    const res = await unsuspendUser(id);
    if (res.ok) setAllUsers(prev => prev.map(u => u.id === id ? { ...u, is_suspended: false, is_active: true } : u));
  };

  const handleDelete = async (id: string) => {
    const res = await deleteUser(id);
    if (res.ok) setAllUsers(prev => prev.filter(u => u.id !== id));
  };

  const filteredAllUsers = allUsers.filter(u => {
    if (searchUsers && !u.full_name?.toLowerCase().includes(searchUsers.toLowerCase())) return false;
    if (filterRoleUsers && filterRoleUsers !== 'All' && u.role !== filterRoleUsers.toLowerCase()) return false;
    return true;
  });

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
    if (type === 'admin') return 'bg-red-50 text-red-500 border border-red-100';
    if (type === 'teacher') return 'bg-emerald-50 text-emerald-500 border border-emerald-100';
    if (type === 'security') return 'bg-amber-50 text-amber-500 border border-amber-100';
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
                <th className="py-4 px-6 text-center">Assign Role</th>
                <th className="py-4 px-6">Requested Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[#334155] font-medium">
              {loadingPending ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : pendingUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <Check size={40} className="mx-auto mb-3 text-green-400" />
                    <p>All caught up — no pending requests.</p>
                  </td>
                </tr>
              ) : (
                pendingUsers.map((req) => {
                  const busy = processing[req.id];
                  return (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-5 px-6 font-semibold flex flex-col">
                        <span>{req.full_name ?? "—"}</span>
                        <span className="text-xs text-gray-400 font-normal mt-0.5">{req.email}</span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className={clsx("px-4 py-1.5 rounded-full text-[11px] font-bold", getRequestBadgeColor(req.requested_role || 'teacher'))}>
                          {(req.requested_role || 'teacher') === 'teacher' ? 'Teacher Access' :
                           (req.requested_role === 'admin' ? 'Admin Access' : 'Security Access')}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <select
                          value={selectedRoles[req.id] ?? "teacher"}
                          onChange={(e) => setSelectedRoles((r) => ({ ...r, [req.id]: e.target.value }))}
                          disabled={!!busy}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          <option value="teacher">Teacher Access</option>
                          <option value="security">Security Access</option>
                          <option value="admin">Admin Access</option>
                        </select>
                      </td>
                      <td className="py-5 px-6">{formatDate(req.created_at)}</td>
                      <td className="py-5 px-6">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleReject(req.id)}
                            disabled={!!busy}
                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors disabled:opacity-50"
                          >
                            {busy === "rejecting" ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => handleApprove(req.id)}
                            disabled={!!busy}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#0f172a] text-[13px] font-bold rounded-lg transition-colors disabled:opacity-50"
                          >
                            {busy === "approving" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Accept
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loadingPending && pendingUsers.length > 0 && (
          <div className="py-4 px-6 text-center text-sm font-medium text-gray-400">
            Showing 1 to {pendingUsers.length} of {pendingUsers.length} requests
          </div>
        )}
      </div>
    </div>
  );

  const renderAllUsersTab = () => (
    <div className="bg-white border border-[var(--line)] rounded-[20px] w-full shadow-sm mt-6">
      {/* Header row: title left, filter right */}
      <div className="p-6 flex items-center justify-between gap-4">
        <h2 className="text-[18px] font-bold text-[#0f172a] whitespace-nowrap">All Users</h2>
        <div className="flex items-center gap-3 flex-shrink-0">
          <input
            type="text"
            placeholder="Search by name…"
            value={searchUsers}
            onChange={e => setSearchUsers(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-52"
          />
          <select
            value={filterRoleUsers}
            onChange={e => setFilterRoleUsers(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="teacher">Teachers</option>
            <option value="security">Security</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
          <thead className="bg-[#fafafa] border-y border-gray-100 text-[#0f172a] font-bold text-[13px]">
            <tr>
              <th className="py-4 px-6">Name</th>
              <th className="py-4 px-6">Role</th>
              <th className="py-4 px-6">Email address</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Joined Date</th>
              <th className="py-4 px-6 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
            {loadingAllUsers ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                </td>
              </tr>
            ) : filteredAllUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  <p>No users found.</p>
                </td>
              </tr>
            ) : (
              filteredAllUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 text-[#334155] transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-[#0f172a]">{user.full_name ?? '—'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 capitalize">{user.role}</td>
                  <td className="py-3.5 px-6 text-sm">{user.email}</td>
                  <td className="py-3.5 px-6">
                    {user.is_suspended || !user.is_active ? (
                      <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100">Suspended</span>
                    ) : (
                      <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-100">Active</span>
                    )}
                  </td>
                  <td className="py-3.5 px-6">{formatDate(user.created_at)}</td>
                  <td className="py-3.5 px-6 text-right">
                    <UserActionsMenu
                      user={user}
                      onSuspend={() => handleSuspend(user.id)}
                      onUnsuspend={() => handleUnsuspend(user.id)}
                      onDelete={() => handleDelete(user.id)}
                    />
                  </td>
                </tr>
              ))
            )}
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
            { id: 'Pending requests', label: 'Pending requests', badge: pendingUsers.length > 0 && !loadingPending ? pendingUsers.length : undefined },
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