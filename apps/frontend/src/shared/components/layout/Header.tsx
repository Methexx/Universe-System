"use client";

import React from "react";
import { Menu, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

interface HeaderProps {
  toggleSidebar: () => void;
  userParams: {
    name: string;
    roleLevel: string;
    avatarUrl?: string; // Optional avatar
  };
  profileLink?: string;
}

export function Header({ toggleSidebar, userParams, profileLink = "/admin/profile" }: HeaderProps) {
  const pathname = usePathname();

  const getBreadcrumbItems = () => {
    if (!pathname || pathname === "/") return [];
    
    const parts = pathname.split("/").filter(Boolean);
    const mappings: Record<string, string> = {
      admin: "Admin",
      teacher: "Teacher",
      security: "Security",
      pending: "Pending",
      overview: "Overview",
      policies: "Policies",
      dashboard: "Dashboard",
    };
    
    return parts.map((part, index) => {
      let url = `/${parts.slice(0, index + 1).join("/")}`;
      const name = mappings[part] || part.charAt(0).toUpperCase() + part.slice(1);
      const isLast = index === parts.length - 1;
      
      if (index === 0) {
        if (part === "admin") url = "/admin/overview";
        else if (part === "teacher") url = "/teacher/overview";
        else if (part === "security") url = "/security/dashboard";
      }
      
      return { name, url, isLast };
    });
  };

  const breadcrumbs = getBreadcrumbItems();

  return (
    <header className="sticky top-0 z-20 flex h-[72px] w-full items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8">
      {/* Left side: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none lg:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </button>

        <nav aria-label="Breadcrumb" className="hidden items-center sm:flex max-w-[400px] overflow-hidden whitespace-nowrap truncate">
          {breadcrumbs.length > 0 ? (
            breadcrumbs.map((crumb, index) => (
              <React.Fragment key={`${crumb.url}-${index}`}>
                {index > 0 && <ChevronRight className="mx-[10px] h-[16px] w-[16px] shrink-0 text-[#94a3b8] relative top-[1px]" strokeWidth={2.5} />}
                <Link
                  href={crumb.url}
                  className={clsx(
                    "text-[15px] transition-colors focus:outline-none",
                    crumb.isLast 
                      ? "text-[#0f172a] font-bold pointer-events-none" 
                      : "text-[#64748b] font-semibold hover:text-[#4f46e5]"
                  )}
                >
                  {crumb.name}
                </Link>
              </React.Fragment>
            ))
          ) : (
            <span className="text-[15px] font-bold text-[#0f172a]">Dashboard</span>
          )}
        </nav>
      </div>

      {/* Right side: User Profile */}
      <Link href={profileLink} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-gray-900 leading-tight">
              {userParams.name}
            </span>
            <span className="text-xs font-medium text-gray-500 leading-tight">
              {userParams.roleLevel}
            </span>
          </div>
          <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-200 border border-[var(--line)]">
            {userParams.avatarUrl ? (
              <Image
                src={userParams.avatarUrl}
                alt="User avatar"
                width={36}
                height={36}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#1e293b] text-white font-bold text-sm">
                {userParams.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </Link>
    </header>
  );
}
