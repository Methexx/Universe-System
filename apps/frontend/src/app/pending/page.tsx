"use client";

import { AlertCircle, LogOut } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";

export default function PendingPage() {
  const { logout } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <div className="bg-white border border-[var(--line)] rounded-[20px] shadow-sm p-8 max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#0f172a] mb-3">Account Pending Approval</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Your account has been successfully created and is currently awaiting administrator approval. 
          You will gain access to the system once your role has been verified and approved.
        </p>
        
        <button
          onClick={() => logout()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center justify-center transition-colors w-full sm:w-auto min-w-[200px]"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </button>
      </div>
    </div>
  );
}
