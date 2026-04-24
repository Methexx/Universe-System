"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LogOut } from "lucide-react";
import { SIDEBAR_MENU, Role } from "./sidebarConfig";
import { useAuth } from "@/features/auth/context/AuthContext";

interface SidebarProps {
  role: Role;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const menuItems = SIDEBAR_MENU[role] || SIDEBAR_MENU["admin"];
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
  };

  return (
    <>
      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl transform transition-all">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Logout</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                No
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#e31f26] hover:bg-[#c9181f] transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-[#fefcf8] border-r border-[#ecece8] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo / Header */}
        <div className="flex h-[72px] shrink-0 items-center justify-center border-b border-[#ecece8]">
          <Link href={`/${role}/overview`} className="flex items-center" onClick={onClose}>
            <Image 
              src="/Assets/Logo.svg" 
              alt="Logoipsum Foundation"
              width={160}
              height={40}
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
          <div className="mb-4">
            <h3 className="px-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              Navigations
            </h3>
          </div>
          
          <nav className="space-y-1">
            {menuItems.map((item, idx) => {
              const isActive = pathname.startsWith(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={idx}
                  href={item.path}
                  onClick={() => {
                    // close modal logic if on mobile
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={clsx(
                    "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "bg-[#dbccff] text-[#4d2db1]" // Active state
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900" // Inactive state
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={clsx("h-5 w-5", isActive ? "text-[#4d2db1]" : "text-gray-400 group-hover:text-gray-600")} strokeWidth={isActive ? 2.5 : 2} />
                    {item.title}
                  </div>
                  
                  {item.badge && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions / Footer */}
        <div className="shrink-0 p-4 border-t border-[#ecece8]">
          <div className="mb-4 flex items-center justify-between px-2">
            <span className="text-sm font-semibold text-gray-600">Dark Mode</span>
            {/* Simple styling placeholder for a toggle switch */}
            <div className="relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full bg-gray-200">
              <span className="sr-only">Toggle Dark Mode</span>
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform ease-in-out translate-x-1" />
            </div>
          </div>
          
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e31f26] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#c9181f]"
          >
            <LogOut className="h-4 w-4" strokeWidth={2.5} />
            LogOut
          </button>
          
          <div className="mt-4 text-center">
            <span className="text-xs font-semibold text-gray-400">@2026 Sequence Inc</span>
          </div>
        </div>
      </aside>
    </>
  );
}
