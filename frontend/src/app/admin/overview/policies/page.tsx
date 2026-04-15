"use client";

import React from "react";
import Link from "next/link";
import { 
  ChevronRight, 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Edit2, 
  Trash2, 
  ChevronUp 
} from "lucide-react";

export default function PoliciesPage() {
  const documents = Array(5).fill({
    name: "Student Handbook 2024.pdf",
    size: "37.4MB",
    date: "Oct 24, 2028",
    status: "Active"
  });

  return (
    <div className="flex flex-col gap-10 pb-12 w-full pr-4">
      {/* Header logic */}
      <div className="flex flex-col gap-2 mb-2 -mt-4">
        <h1 className="text-[24px] font-bold text-[#0f172a]">Policies Management</h1>
        <p className="text-[14px] font-semibold text-[#64748b]">Manage school documents and Policies</p>
      </div>

      {/* Document Library Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-[#0f172a]">Document Library</h2>
          <button className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 shadow-sm">
            <Plus className="h-4 w-4" strokeWidth={3} />
            Upload Documents
          </button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-[320px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Documents by name" 
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-[13px] font-semibold text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <select className="rounded-lg border border-gray-200 px-4 py-2.5 text-[13px] font-semibold text-[#64748b] bg-white outline-none w-32 cursor-pointer focus:border-blue-500">
              <option>All Statuses</option>
            </select>
            <select className="rounded-lg border border-gray-200 px-4 py-2.5 text-[13px] font-semibold text-[#64748b] bg-white outline-none w-32 cursor-pointer focus:border-blue-500">
              <option>All Plans</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[13px] font-bold text-[#64748b]">Documents</th>
                <th className="px-6 py-4 text-[13px] font-bold text-[#64748b]">Size</th>
                <th className="px-6 py-4 text-[13px] font-bold text-[#64748b]">Uploaded Date</th>
                <th className="px-6 py-4 text-[13px] font-bold text-[#64748b]">Status</th>
                <th className="px-6 py-4 text-[13px] font-bold text-[#64748b]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.map((doc, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-[18px] text-[13px] font-bold text-[#0f172a]">{doc.name}</td>
                  <td className="px-6 py-[18px] text-[13px] font-semibold text-[#64748b]">{doc.size}</td>
                  <td className="px-6 py-[18px] text-[13px] font-semibold text-[#64748b]">{doc.date}</td>
                  <td className="px-6 py-[18px]">
                    <span className="rounded-md bg-[#dcfce7] px-2.5 py-1 text-[11px] font-bold text-[#16a34a]">
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-[18px]">
                    <div className="flex items-center gap-2">
                      <button className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-[#64748b] hover:bg-gray-100 transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-[#64748b] hover:bg-gray-100 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-[#64748b] hover:bg-gray-100 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-[#64748b] hover:bg-gray-100 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Term Management */}
      <div className="flex flex-col gap-6">
        <h2 className="text-[20px] font-bold text-[#0f172a]">Term Management</h2>
        
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="text-[14px] font-bold text-[#0f172a]">Term 1</h3>
            <div className="flex items-center gap-2">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fef2f2] text-[#ef4444] transition-colors hover:bg-red-100">
                <Trash2 className="h-[14px] w-[14px]" strokeWidth={2.5} />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#64748b] transition-colors hover:bg-gray-200 border border-gray-100">
                <ChevronUp className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
          
          <div className="p-6 flex flex-col gap-4">
            <div>
              <p className="mb-4 text-[12px] font-bold text-[#94a3b8]">Time Period</p>
              <div className="flex items-center gap-4">
                <input 
                  type="text" 
                  placeholder="Start Date" 
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-[13px] font-semibold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 placeholder-gray-400 w-32" 
                />
                <span className="text-[13px] font-semibold text-[#94a3b8]">To</span>
                <input 
                  type="text" 
                  placeholder="End Date" 
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-[13px] font-semibold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 placeholder-gray-400 w-32" 
                />
              </div>
            </div>
            
            <div className="w-full">
              <input 
                type="text" 
                placeholder="Term Name" 
                className="w-full max-w-[400px] rounded-lg border border-gray-200 px-4 py-2.5 text-[13px] font-semibold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 placeholder-gray-400 mt-2" 
              />
            </div>
          </div>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3.5 text-[13px] font-bold text-[#64748b] hover:bg-gray-50 hover:text-gray-900 transition-colors bg-white">
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Add another Term
        </button>
      </div>

      {/* Create Grades & Classes */}
      <div className="flex flex-col gap-6">
        <h2 className="text-[20px] font-bold text-[#0f172a]">Create Grades & Classes</h2>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <input 
              type="text" 
              placeholder="Start Date" 
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-[13px] font-semibold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 placeholder-gray-400 w-32" 
            />
            <span className="text-[13px] font-semibold text-[#94a3b8]">To</span>
            <input 
              type="text" 
              placeholder="End Date" 
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-[13px] font-semibold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 placeholder-gray-400 w-32" 
            />
          </div>
          <div className="w-full">
            <input 
              type="text" 
              placeholder="Term Name" 
              className="w-full max-w-[400px] rounded-lg border border-gray-200 px-4 py-2.5 text-[13px] font-semibold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 placeholder-gray-400" 
            />
          </div>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3.5 text-[13px] font-bold text-[#64748b] hover:bg-gray-50 hover:text-gray-900 transition-colors bg-white">
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Add another Term
        </button>
      </div>

    </div>
  );
}