"use client";

import React from "react";
import { Menu, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";

interface HeaderProps {
  toggleSidebar: () => void;
  userParams: {
    name: string;
    roleLevel: string;
    avatarUrl?: string; // Optional avatar
  };
}

export function Header({ toggleSidebar, userParams }: HeaderProps) {
  const pathname = usePathname();
  
  // A simplistic breadcrumb generator from pathname, 
  // you might want to expand this depending on your routes.
  const pathParts = pathname.split("/").filter(Boolean);
  
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm md:px-6">
      {/* Left side: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none lg:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </button>
        
        <nav aria-label="Breadcrumb" className="hidden items-center text-sm font-medium text-gray-500 sm:flex">
          {pathParts.length > 0 ? (
            pathParts.map((part, index) => {
              const isLast = index === pathParts.length - 1;
              const formattedPart = part.charAt(0).toUpperCase() + part.slice(1);
              return (
                <React.Fragment key={index}>
                  {index > 0 && <ChevronRight className="mx-1 h-4 w-4 shrink-0 text-gray-400" />}
                  <span
                    className={clsx(
                      "capitalize",
                      isLast ? "text-gray-900 font-semibold" : "text-gray-500"
                    )}
                  >
                    {formattedPart}
                  </span>
                </React.Fragment>
              );
            })
          ) : (
            <span className="text-gray-900 font-semibold">Dashboard</span>
          )}
        </nav>
      </div>

      {/* Right side: User Profile */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-gray-900 leading-tight">
              {userParams.name}
            </span>
            <span className="text-xs font-medium text-gray-500 leading-tight">
              {userParams.roleLevel}
            </span>
          </div>
          <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-200 border border-gray-300">
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
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <Menu className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
