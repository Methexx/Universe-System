import React from 'react';
import clsx from 'clsx';
import { Edit2 } from 'lucide-react';

export interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  class: string;
  gender: string;
  avatar: string;
}

interface DirectoryTableProps {
  users: DirectoryUser[];
  selectedId?: string;
  idColumnHeader?: string;
  emptyMessage?: string;
  showEdit?: boolean;
  onSelect: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function DirectoryTable({
  users,
  selectedId,
  idColumnHeader = "Student ID",
  emptyMessage = "No records found matching your criteria.",
  showEdit = false,
  onSelect,
  onEdit,
}: DirectoryTableProps) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left text-[14px] whitespace-nowrap min-w-[700px]">
        <thead className="bg-[#fafafa] border-b border-gray-100 text-gray-700 font-bold text-[13px] tracking-wider">
          <tr>
            <th className="py-4 px-6 font-bold">Name</th>
            <th className="py-4 px-6 font-bold">{idColumnHeader}</th>
            <th className="py-4 px-6 font-bold">Email address</th>
            <th className="py-4 px-6 font-bold">Class</th>
            <th className="py-4 px-6 font-bold">Gender</th>
            {showEdit && <th className="py-4 px-6 w-10"></th>}
          </tr>
        </thead>
        <tbody className="font-medium">
          {users.length > 0 ? users.map((user) => {
            const isSelected = user.id === selectedId;
            return (
              <tr 
                key={user.id} 
                onClick={() => onSelect(user.id)}
                className={clsx(
                  "cursor-pointer transition-colors border-b border-gray-50/50",
                  isSelected ? "bg-[#4f8bf9] text-white" : "bg-[#f8fafc] text-gray-700 hover:bg-gray-50"
                )}
              >
                <td className="py-3 px-6">
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" />
                    <span className={clsx("font-bold text-[14px]", isSelected ? "text-white" : "text-[#0f172a]")}>{user.name}</span>
                  </div>
                </td>
                <td className={clsx("py-3 px-6 text-[13px]", isSelected ? "text-blue-50/90" : "text-[#475569]")}>{user.id}</td>
                <td className={clsx("py-3 px-6 text-[13px]", isSelected ? "text-blue-50/90" : "text-[#475569]")}>{user.email}</td>
                <td className={clsx("py-3 px-6 text-[13px]", isSelected ? "text-blue-50/90" : "text-[#475569]")}>{user.class}</td>
                <td className={clsx("py-3 px-6 text-[13px]", isSelected ? "text-blue-50/90" : "text-[#475569]")}>{user.gender}</td>
                {showEdit && (
                  <td className="py-3 px-6 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEdit) onEdit(user.id);
                      }}
                      className="p-2 inline-flex items-center justify-center rounded-full hover:bg-[rgba(0,0,0,0.1)] transition-colors outline-none"
                    >
                      <Edit2 className={clsx("w-4 h-4", isSelected ? "text-white" : "text-gray-400 hover:text-gray-600")} />
                    </button>
                  </td>
                )}
              </tr>
            );
          }) : (
            <tr>
              <td colSpan={showEdit ? 6 : 5} className="py-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
