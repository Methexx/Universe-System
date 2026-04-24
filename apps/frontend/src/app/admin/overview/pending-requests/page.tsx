"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Check, X, ChevronDown } from "lucide-react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import {
  getPendingUsers,
  approvePendingUser,
  rejectPendingUser,
  PendingUser,
} from "@/features/auth/lib/auth-api";

const ROLE_OPTIONS = ["teacher", "security", "admin"] as const;
type ApprovableRole = (typeof ROLE_OPTIONS)[number];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PendingRequestsPage() {
  const router = useRouter();
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<Record<string, ApprovableRole>>({});
  const [processing, setProcessing] = useState<Record<string, "approving" | "rejecting" | null>>({});
  const [done, setDone] = useState<Record<string, "approved" | "rejected">>({});

  useEffect(() => {
    getPendingUsers().then((result) => {
      if (result.ok) {
        setUsers(result.data);
        const defaults: Record<string, ApprovableRole> = {};
        result.data.forEach((u) => { defaults[u.id] = (u.requested_role as ApprovableRole) || "teacher"; });
        setSelectedRoles(defaults);
      } else {
        setError("Failed to load pending users.");
      }
      setLoading(false);
    });
  }, []);

  async function handleApprove(id: string) {
    const role = selectedRoles[id] ?? "teacher";
    setProcessing((p) => ({ ...p, [id]: "approving" }));
    const result = await approvePendingUser(id, role);
    setProcessing((p) => ({ ...p, [id]: null }));
    if (result.ok) {
      setDone((d) => ({ ...d, [id]: "approved" }));
    }
  }

  async function handleReject(id: string) {
    setProcessing((p) => ({ ...p, [id]: "rejecting" }));
    const result = await rejectPendingUser(id);
    setProcessing((p) => ({ ...p, [id]: null }));
    if (result.ok) {
      setDone((d) => ({ ...d, [id]: "rejected" }));
    }
  }

  const pendingCount = users.filter((u) => !done[u.id]).length;

  return (
    <div className="flex flex-col gap-6 pb-12 w-full">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/overview")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      <PageHeader
        title="Pending Requests"
        subtitle={`${pendingCount} account${pendingCount !== 1 ? "s" : ""} awaiting approval`}
      />

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center text-gray-400">
          <Check size={40} className="mx-auto mb-3 text-green-400" />
          <p className="font-medium text-gray-600">All caught up — no pending requests.</p>
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-[14px] whitespace-nowrap min-w-[680px]">
              <thead className="bg-[#fafafa] border-b border-[#e2e8f0] text-[#64748b] text-[13px] tracking-wider">
                <tr>
                  <th className="py-4 px-6 font-bold">Name</th>
                  <th className="py-4 px-6 font-bold">Email</th>
                  <th className="py-4 px-6 font-bold">Registered</th>
                  <th className="py-4 px-6 font-bold">Request To</th>
                  <th className="py-4 px-6 font-bold">Assign Role</th>
                  <th className="py-4 px-6 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const status = done[u.id];
                  const busy = processing[u.id];

                  if (status) {
                    return (
                      <tr key={u.id} className="border-b border-gray-50">
                        <td className="py-3 px-6 text-gray-400 line-through">{u.full_name ?? "—"}</td>
                        <td className="py-3 px-6 text-gray-400 line-through">{u.email}</td>
                        <td className="py-3 px-6 text-gray-400">{formatDate(u.created_at)}</td>
                        <td className="py-3 px-6 text-gray-400">
                          {(u.requested_role || 'teacher') === 'teacher' ? 'Teacher Access' :
                           (u.requested_role === 'admin' ? 'Admin Access' : 'Security Access')}
                        </td>
                        <td className="py-3 px-6" />
                        <td className="py-3 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold ${status === "approved"
                              ? "bg-green-50 text-green-600"
                              : "bg-red-50 text-red-500"
                            }`}>
                            {status === "approved" ? <Check size={11} /> : <X size={11} />}
                            {status === "approved" ? "Approved" : "Rejected"}
                          </span>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={u.id} className="border-b border-gray-50/50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-6 font-medium text-[#0f172a]">{u.full_name ?? "—"}</td>
                      <td className="py-3 px-6 text-[#475569]">{u.email}</td>
                      <td className="py-3 px-6 text-[#64748b] text-[13px]">{formatDate(u.created_at)}</td>
                      <td className="py-3 px-6">
                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold ${
                          (u.requested_role === 'admin') ? 'bg-red-50 text-red-500 border border-red-100' :
                          (u.requested_role === 'security') ? 'bg-amber-50 text-amber-500 border border-amber-100' :
                          'bg-emerald-50 text-emerald-500 border border-emerald-100'
                        }`}>
                          {(u.requested_role || 'teacher') === 'teacher' ? 'Teacher Access' :
                           (u.requested_role === 'admin' ? 'Admin Access' : 'Security Access')}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <div className="relative inline-block">
                          <select
                            value={selectedRoles[u.id] ?? "teacher"}
                            onChange={(e) =>
                              setSelectedRoles((r) => ({ ...r, [u.id]: e.target.value as ApprovableRole }))
                            }
                            disabled={!!busy}
                            className="appearance-none pl-3 pr-8 py-1.5 text-[13px] rounded-lg border border-gray-200 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r} value={r}>
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(u.id)}
                            disabled={!!busy}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {busy === "approving" ? (
                              <Loader2 size={11} className="animate-spin" />
                            ) : (
                              <Check size={11} />
                            )}
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(u.id)}
                            disabled={!!busy}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-[12px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {busy === "rejecting" ? (
                              <Loader2 size={11} className="animate-spin" />
                            ) : (
                              <X size={11} />
                            )}
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
