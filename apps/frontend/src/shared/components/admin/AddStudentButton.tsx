import React from 'react';
import { Plus } from 'lucide-react';

interface AddStudentButtonProps {
  onClick?: () => void;
}

export function AddStudentButton({ onClick }: AddStudentButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3b82f6] hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer ml-auto xl:ml-0"
    >
      <Plus className="w-5 h-5" />
      Add Students
    </button>
  );
}
