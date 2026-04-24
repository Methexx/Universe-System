"use client";

import { useAuth } from "@/features/auth/context/AuthContext";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Loader2 } from "lucide-react";

export default function SecurityOverviewPage() {
  const { user } = useAuth();
  const isPending = user?.role === "pending";

  return (
    <div className="flex flex-col gap-[20px] pb-12 w-full pr-2">
      <PageHeader
        title="Overview"
        subtitle={`Welcome back ${user?.full_name ?? ""}!`}
      />

      <div className="relative mt-2">
        {isPending && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm bg-white/30 rounded-xl">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-[22px] font-bold text-gray-900 mb-2 shadow-sm bg-white/80 px-6 py-2 rounded-full border border-gray-200">
              Waiting for approval
            </h3>
            <p className="text-gray-700 font-medium bg-white/80 px-4 py-1 rounded-full border border-gray-200 shadow-sm">
              Your account is currently under review
            </p>
          </div>
        )}

        <div className={isPending ? "pointer-events-none blur-[6px] opacity-60 transition-all duration-500 select-none" : ""}>
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 text-center text-gray-400">
            Security dashboard content coming soon.
          </div>
        </div>
      </div>
    </div>
  );
}
