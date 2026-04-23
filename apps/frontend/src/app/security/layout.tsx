"use client";

import { DashboardLayout } from "@/shared/components/layout/DashboardLayout";

// In a real application, userParams would be fetched from auth context/session.
export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout 
      role="security" 
      userParams={{ name: "Methum Pathirana", roleLevel: "Security" }}
    >
      {children}
    </DashboardLayout>
  );
}
