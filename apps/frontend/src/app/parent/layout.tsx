"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/shared/components/layout/DashboardLayout";
import { useAuth } from "@/features/auth/context/AuthContext";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "parent") {
      if (user.role === "pending") router.replace("/pending");
      else if (user.role === "security") router.replace("/security/dashboard");
      else router.replace(`/${user.role}/overview`);
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <DashboardLayout
      role="parent"
      userParams={{
        name: user.full_name ?? user.email,
        roleLevel: "Parent",
        avatarUrl: user.avatar_url ?? undefined,
      }}
    >
      {children}
    </DashboardLayout>
  );
}
