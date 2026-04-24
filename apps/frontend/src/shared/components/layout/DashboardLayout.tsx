"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Role } from "./sidebarConfig";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: Role;
  userParams?: {
    name: string;
    roleLevel: string;
    avatarUrl?: string;
  };
}

export function DashboardLayout({
  children,
  role,
  userParams = {
    name: "Methum Pathirana",
    roleLevel: "Admin",
    avatarUrl: "",
  },
}: DashboardLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#fafafa]">
      <Sidebar
        role={role}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          userParams={userParams}
          profileLink={role === 'pending' ? '#' : `/${role}/profile`}
        />
        <main className="flex-1 overflow-y-auto bg-[#fafafa] p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
