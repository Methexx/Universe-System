import React from "react";
import { RefreshCw } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500">Welcome back Sarah Joseph!</p>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <div className="text-2xl font-bold text-gray-900">07:48 AM</div>
          <div className="text-xs font-semibold text-gray-500">23 March 2027</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 items-center justify-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 text-sm font-semibold text-indigo-600">
            <RefreshCw className="h-4 w-4" />
            Last updated: 1:24:43 AM
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Add your widgets and cards here as described in the UI */}
      <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 min-h-[400px] flex items-center justify-center text-gray-400">
        Dashboard content goes here...
      </div>
    </div>
  );
}
