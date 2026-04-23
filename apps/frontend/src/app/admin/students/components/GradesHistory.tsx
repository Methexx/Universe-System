import React from 'react';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';

export function GradesHistory() {
  const subjects = [
    { name: "Sinhala", result: "87" },
    { name: "Maths", result: "87" },
    { name: "English", result: "87" },
    { name: "History", result: "87" },
    { name: "Science", result: "87" },
    { name: "Sinhala", result: "87" },
    { name: "Sinhala", result: "87" },
    { name: "Sinhala", result: "87" },
    { name: "Sinhala", result: "87" },
  ];

  return (
    <div className="flex flex-col w-full bg-white rounded-[24px] border border-[#e2e8f0] shadow-sm p-6 overflow-hidden">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-[#1e293b]">Grades History</h2>
        
        <div className="flex items-center gap-3">
          {/* Term Filter */}
          <div className="relative inline-flex items-center px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
            <CalendarIcon className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-[13px] font-semibold text-gray-700 mr-2">Term 1</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          
          {/* Class Filter */}
          <div className="relative inline-flex items-center px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
            <span className="text-[13px] font-semibold text-gray-400 mr-2">Class</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap min-w-[800px]">
          <thead>
            <tr className="text-[12px] font-bold text-[#0f172a] border-b-0">
              <th className="py-2 px-1 text-left w-24">Grades</th>
              {subjects.map((subj, index) => (
                <th key={index} className="py-2 px-4 text-center font-bold">{subj.name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[13px]">
            <tr>
              <td className="py-4 px-1 font-semibold text-[#0f172a]">Result</td>
              {subjects.map((subj, index) => (
                <td key={index} className="py-4 px-4 text-center font-medium text-[#0f172a]">
                  {subj.result}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
