"use client";

import { DashboardLayout } from "@/shared/components/layout/DashboardLayout";

// In a real application, userParams would be fetched from auth context/session.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout 
      role="admin" 
      userParams={{ name: "Methum Pathirana", roleLevel: "Admin" }}
    >
      {children}
    </DashboardLayout>
  );
}
