"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/shared/components/layout/DashboardLayout";
import { useAuth } from "@/features/auth/context/AuthContext";

export default function PendingLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "pending") {
      router.replace(`/${user.role}/overview`);
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <DashboardLayout
      role="pending"
      userParams={{
        name: user.full_name ?? user.email,
        roleLevel: "Pending User",
      }}
    >
      {children}
    </DashboardLayout>
  );
}
