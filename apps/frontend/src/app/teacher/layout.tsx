"use client";

import { DashboardLayout } from "@/shared/components/layout/DashboardLayout";

// In a real application, userParams would be fetched from auth context/session.
export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout 
      role="teacher" 
      userParams={{ name: "Methum Pathirana", roleLevel: "Teacher" }}
    >
      {children}
    </DashboardLayout>
  );
}
