"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/shared/components/layout/DashboardLayout";
import { useAuth } from "@/features/auth/context/AuthContext";

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "security") {
      router.replace(user.role === "pending" ? "/pending" : `/${user.role}/overview`);
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <DashboardLayout
      role="security"
      userParams={{
        name: user.full_name ?? user.email,
        roleLevel: "Security",
        avatarUrl: user.avatar_url ?? undefined,
      }}
    >
      {children}
    </DashboardLayout>
  );
}
