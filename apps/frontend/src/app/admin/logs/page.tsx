"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { TabSelector } from '@/shared/components/ui/TabSelector';
import { FilterBar } from '@/shared/components/ui/FilterBar';
import { MoreVertical, X, Check, Loader2, FileText, UserCheck, Truck, AlertTriangle, Search, Clock, CheckCircle2 } from 'lucide-react';
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
import { getStudents } from '@/features/school/lib/school-api';
import { getGateEvents, GateLogRow } from '@/features/gate/lib/gate-api';

type TabType = 'Gate' | 'Pending requests' | 'All users' | 'Security';

type LogType = "visitor" | "delivery" | "incident" | "general";

interface SecurityLog {
  id: string;
  type: LogType;
  title: string;
  description: string;
  author: string;
  timestamp: string;
  status?: "pending" | "resolved" | "active";
  tags?: string[];
}

const SECURITY_LOGS: SecurityLog[] = [
  {
    id: "l1",
    type: "visitor",
    title: "Visitor Check-in: Amara Nkwonta (Parent)",
    description: "Verified ID. Visiting Principal's office regarding student Amara. Issued visitor badge #042.",
    author: "John Security",
    timestamp: "Today, 10:45 AM",
    status: "active",
    tags: ["Badge #042", "ID Verified"],
  },
  {
    id: "l2",
    type: "delivery",
    title: "Stationery Delivery (Office Max)",
    description: "Received 5 boxes of whiteboard markers and printer paper at Gate 2. Directed to Admin Block.",
    author: "Mike Guard",
    timestamp: "Today, 09:15 AM",
    status: "resolved",
    tags: ["Gate 2", "Admin Block"],
  },
  {
    id: "l3",
    type: "incident",
    title: "Unauthorized Vehicle at Drop-off",
    description: "Blue Toyota Camry (XYZ-123) parked in the bus only zone. Driver was asked to relocate to visitor parking. Driver complied.",
    author: "John Security",
    timestamp: "Yesterday, 02:30 PM",
    status: "resolved",
    tags: ["Parking", "Resolved"],
  },
  {
    id: "l4",
    type: "visitor",
    title: "Maintenance Crew (AC Repair)",
    description: "Two technicians arrived for scheduled library AC maintenance. Escorted by staff.",
    author: "Sarah Watch",
    timestamp: "Yesterday, 11:00 AM",
    status: "resolved",
    tags: ["Badge #031", "Badge #032"],
  }
];

function getLogIcon(type: LogType) {
  switch (type) {
    case "visitor": return <UserCheck className="h-5 w-5 text-blue-600" />;
    case "delivery": return <Truck className="h-5 w-5 text-emerald-600" />;
    case "incident": return <AlertTriangle className="h-5 w-5 text-rose-600" />;
    default: return <FileText className="h-5 w-5 text-gray-600" />;
  }
}

function getLogBg(type: LogType) {
  switch (type) {
    case "visitor": return "bg-blue-50 border-blue-100";
    case "delivery": return "bg-emerald-50 border-emerald-100";
    case "incident": return "bg-rose-50 border-rose-100";
    default: return "bg-gray-50 border-gray-100";
  }
}

type StudentEntry = {
  entryType: 'student';
  id: string;
  full_name: string | null;
  role: 'student';
  email: string;
  is_active: boolean;
  is_suspended: false;
  created_at: string;
  avatar_url: string | null;
};

type DisplayEntry = (UserProfile & { entryType: 'user' }) | StudentEntry;

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

  const [gateLogs, setGateLogs] = useState<GateLogRow[]>([]);
  const [gateLoading, setGateLoading] = useState(true);

  const [searchUsers, setSearchUsers] = useState('');
  const [filterRoleUsers, setFilterRoleUsers] = useState('');

  const [searchSecurity, setSearchSecurity] = useState('');
  const [filterTypeSecurity, setFilterTypeSecurity] = useState<LogType | 'all'>('all');

  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allStudentEntries, setAllStudentEntries] = useState<StudentEntry[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingAllUsers, setLoadingAllUsers] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<Record<string, "approving" | "rejecting" | null>>({});

  useEffect(() => {
    let cancelled = false;
    const fetchLogs = async () => {
      setGateLoading(true);
      const dateParam =
        filterDateGate === 'today' ? 'today'
        : filterDateGate === 'yesterday' ? 'yesterday'
        : undefined;

      const res = await getGateEvents({
        method: filterStatusGate.toLowerCase() || undefined,
        date: dateParam,
      });

      if (!cancelled) {
        if (res.ok) setGateLogs(res.data);
        setGateLoading(false);
      }
    };
    fetchLogs();
    
    return () => { cancelled = true; };
  }, [filterStatusGate, filterDateGate]);

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

    Promise.all([getAllUsers(), getStudents()]).then(([usersRes, studentsRes]) => {
      if (usersRes.ok) setAllUsers(usersRes.data);
      if (studentsRes.ok) {
        setAllStudentEntries(studentsRes.data.map(s => ({
          entryType: 'student' as const,
          id: s.student_id_no,
          full_name: s.full_name,
          role: 'student' as const,
          email: s.parent_email ?? '',
          is_active: s.is_active,
          is_suspended: false as const,
          created_at: s.created_at,
          avatar_url: s.photo_url ?? null,
        })));
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

  const allEntries = useMemo<DisplayEntry[]>(() => {
    const userEntries: DisplayEntry[] = allUsers.map(u => ({ ...u, entryType: 'user' as const }));
    return [...userEntries, ...allStudentEntries].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [allUsers, allStudentEntries]);

  const filteredEntries = allEntries.filter(entry => {
    if (searchUsers && !entry.full_name?.toLowerCase().includes(searchUsers.toLowerCase())) return false;
    if (filterRoleUsers && filterRoleUsers !== 'All') {
      if (entry.role !== filterRoleUsers.toLowerCase()) return false;
    }
    return true;
  });

  const filteredGateLogs = gateLogs.filter(log =>
    searchGate ? log.student_id_no.toLowerCase().includes(searchGate.toLowerCase()) : true
  );

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
            {gateLoading ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400 text-[13px]">
                  Loading...
                </td>
              </tr>
            ) : filteredGateLogs.length > 0 ? (
              filteredGateLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[#334155]">{log.student_id_no}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-[#0f172a] font-semibold">{log.timeLabel}</span>
                      <span className="text-gray-400 text-xs mt-0.5">{log.date}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">{log.checkIn ?? '-- : --'}</td>
                  <td className="py-4 px-6">{log.checkOut ?? '-- : --'}</td>
                  <td className="py-4 px-6">
                    <span className={clsx(
                      "px-4 py-1.5 rounded-full text-[11px] font-bold",
                      log.method === 'qr' ? "bg-[#dcfce7] text-[#16a34a]" : log.method === 'auto' ? "bg-[#f3e8ff] text-[#7c3aed]" : "bg-gray-100 border border-gray-200 text-gray-600"
                    )}>
                      {log.method === 'qr' ? 'QR' : log.method === 'auto' ? 'Auto' : 'Manual'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400 text-[13px]">
                  No logs found.
                </td>
              </tr>
            )}
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
            <option value="student">Students</option>
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
            ) : filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  <p>No users found.</p>
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => {
                const rowKey = entry.entryType === 'student' ? `student-${entry.id}` : entry.id;
                return (
                  <tr key={rowKey} className="hover:bg-gray-50/50 text-[#334155] transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {entry.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={entry.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                              {entry.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-[#0f172a]">{entry.full_name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 capitalize">{entry.role}</td>
                    <td className="py-3.5 px-6 text-sm">{entry.email || '—'}</td>
                    <td className="py-3.5 px-6">
                      {entry.is_suspended || !entry.is_active ? (
                        <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100">Suspended</span>
                      ) : (
                        <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-100">Active</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6">{formatDate(entry.created_at)}</td>
                    <td className="py-3.5 px-6 text-right">
                      {entry.entryType === 'user' ? (
                        <UserActionsMenu
                          user={entry}
                          onSuspend={() => handleSuspend(entry.id)}
                          onUnsuspend={() => handleUnsuspend(entry.id)}
                          onDelete={() => handleDelete(entry.id)}
                        />
                      ) : (
                        <span />
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const filteredSecurityLogs = SECURITY_LOGS.filter((log) => {
    const matchesFilter = filterTypeSecurity === 'all' || log.type === filterTypeSecurity;
    const q = searchSecurity.toLowerCase();
    const matchesSearch = !q || log.title.toLowerCase().includes(q) || log.description.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const renderSecurityTab = () => (
    <div className="bg-white border border-[var(--line)] rounded-[20px] w-full shadow-sm mt-6 flex flex-col md:flex-row min-h-[500px]">
      {/* Sidebar for filtering Security events */}
      <div className="w-full md:w-[280px] md:border-r border-[var(--line)] p-5 flex flex-col gap-4">
        <div>
          <h3 className="mb-2 text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider">Search</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchSecurity}
              onChange={(e) => setSearchSecurity(e.target.value)}
              className="w-full rounded-lg bg-[#f8fafc] py-2 pl-9 pr-3 text-[13px] border border-gray-200 focus:border-[#1e293b] outline-none"
            />
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider">Filter by Type</h3>
          <div className="flex flex-col gap-1.5">
            {(["all", "visitor", "delivery", "incident", "general"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterTypeSecurity(t)}
                className={clsx(
                  "flex justify-between items-center px-3 py-2 text-[13px] rounded-lg capitalize transition-colors text-left",
                  filterTypeSecurity === t ? "bg-[#1e293b] font-bold text-white" : "text-[#64748b] hover:bg-[#f1f5f9]"
                )}
              >
                {t === "all" ? "All Entries" : t}
                {filterTypeSecurity === t && <CheckCircle2 className="h-4 w-4 opacity-70" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Feed */}
      <div className="flex-1 p-5 md:p-8 bg-[#fafafa] rounded-b-[20px] md:rounded-r-[20px] md:rounded-bl-none overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {filteredSecurityLogs.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16 text-center text-[#94a3b8]">
               <FileText className="h-10 w-10 mb-3 opacity-20" />
               <p className="text-[14px]">No security logs matched your criteria.</p>
             </div>
          ) : (
            <div className="relative border-l-2 border-[#e2e8f0] ml-3 sm:ml-4 space-y-8 pb-4">
              {filteredSecurityLogs.map((log) => (
                <div key={log.id} className="relative pl-6 sm:pl-8">
                  {/* Timeline Badge */}
                  <div className={clsx(
                    "absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full border-4 border-[#fafafa]",
                    getLogBg(log.type)
                  )}>
                    {getLogIcon(log.type)}
                  </div>
                  
                  {/* Content Card */}
                  <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-2 flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4">
                      <h3 className="text-[14px] font-bold text-[#0f172a] leading-snug">
                        {log.title}
                      </h3>
                      <div className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold text-[#94a3b8]">
                        <Clock className="h-3 w-3" />
                        {log.timestamp}
                      </div>
                    </div>

                    <p className="mb-3 text-[13px] leading-relaxed text-[#475569]">{log.description}</p>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                       <div className="flex gap-2">
                         {log.tags?.map(tag => (
                           <span key={tag} className="rounded-md bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-bold text-[#475569]">{tag}</span>
                         ))}
                       </div>
                       
                       <div className="flex items-center gap-2 text-[11px] font-medium text-[#64748b]">
                         <span>Logged by: <span className="font-bold text-[#0f172a]">{log.author}</span></span>
                         {log.status === "active" && (
                           <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                              Active
                           </span>
                         )}
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
            { id: 'All users', label: 'All users' },
            { id: 'Security', label: 'Security' }
          ]}
        />
      </div>

      {activeTab === 'Gate' && renderGateTab()}
      {activeTab === 'Pending requests' && renderPendingRequestsTab()}
      {activeTab === 'All users' && renderAllUsersTab()}
      {activeTab === 'Security' && renderSecurityTab()}

    </div>
  );
}