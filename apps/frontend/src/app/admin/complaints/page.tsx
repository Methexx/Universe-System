"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { TextInput } from '@/shared/components/ui/forms/TextInput';
import { SelectInput } from '@/shared/components/ui/forms/SelectInput';
import { Trash2, ArrowUpCircle, Plus } from 'lucide-react';

interface Complaint {
  id: string;
  caption: string;
  details: string;
  time: string;
  date: string;
  status: string;
}

interface Assigner {
  id: string;
  teacher: string;
  note: string;
  priority: string;
}

const INITIAL_COMPLAINTS: Complaint[] = [
  { id: '1', caption: 'Lorem Lipsum doller sit amet', details: 'Lorem Lipsum dLorem Lipsum doller sit ametoller sit amet', time: 'Today', date: 'Oct 25, 2024', status: 'Not assigned' },
  { id: '2', caption: 'Lorem Lipsum doller sit amet', details: 'Lorem Lipsum dLorem Lipsum doller sit ametoller sit amet', time: 'Today', date: 'Oct 25, 2024', status: 'Not assigned' },
  { id: '3', caption: 'Lorem Lipsum doller sit amet', details: 'Lorem Lipsum dLorem Lipsum doller sit ametoller sit amet', time: 'Today', date: 'Oct 25, 2024', status: 'Not assigned' },
  { id: '4', caption: 'Lorem Lipsum doller sit amet', details: 'Lorem Lipsum dLorem Lipsum doller sit ametoller sit amet', time: 'Today', date: 'Oct 25, 2024', status: 'Not assigned' },
  { id: '5', caption: 'Lorem Lipsum doller sit amet', details: 'Lorem Lipsum dLorem Lipsum doller sit ametoller sit amet', time: 'Today', date: 'Oct 25, 2024', status: 'Not assigned' },
  { id: '6', caption: 'Lorem Lipsum doller sit amet', details: 'Lorem Lipsum dLorem Lipsum doller sit ametoller sit amet', time: 'Today', date: 'Oct 25, 2024', status: 'Not assigned' },
];

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>('1');
  const [assigners, setAssigners] = useState<Assigner[]>([
    { id: '1', teacher: '', note: '', priority: 'High' }
  ]);

  const handleAssignerChange = (id: string, field: keyof Assigner, value: string) => {
    setAssigners(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const addAssigner = () => {
    setAssigners(prev => [...prev, { id: Date.now().toString(), teacher: '', note: '', priority: 'High' }]);
  };

  const removeAssigner = (id: string) => {
    setAssigners(prev => prev.filter(a => a.id !== id));
  };

  const toggleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents row selection click
    setComplaints(prev => prev.map(c => 
      c.id === id 
        ? { ...c, status: c.status === 'Not assigned' ? 'Assigned' : 'Not assigned' } 
        : c
    ));
  };

  const getStatusColor = (status: string) => {
    switch(status.toUpperCase()) {
      case 'NOT ASSIGNED': return 'bg-red-50 text-red-600 border-red-200 border';
      case 'ASSIGNED': return 'bg-emerald-50 text-emerald-600 border-emerald-200 border';
      case 'ADMIN': return 'border border-red-500 text-green-500 bg-white';
      case 'TEACHERS': return 'bg-[#dcfce7] text-[#16a34a]';
      default: return 'bg-gray-50 text-gray-600 border-gray-200 border';
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 w-full pr-2">
      <PageHeader 
        title="Complain Management"
        subtitle=""
      />

      {/* Complaints Table */}
      <div className="bg-white border border-gray-200 rounded-[20px] overflow-hidden w-full shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
            <thead className="bg-white border-b border-gray-100 text-gray-400 font-semibold text-[13px] tracking-wider">
              <tr>
                <th className="py-4 px-6">Caption</th>
                <th className="py-4 px-6">Details</th>
                <th className="py-4 px-6">Time</th>
                <th className="py-4 px-6">Curent status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
              {complaints.map((complaint) => (
                <tr 
                  key={complaint.id} 
                  onClick={() => setSelectedComplaintId(complaint.id)}
                  className={`cursor-pointer transition-colors ${
                    selectedComplaintId === complaint.id 
                      ? 'bg-blue-50/30 border-blue-500 border-l-2 border-r-2 border-y-2 relative shadow-[inset_0_0_0_1px_#3b82f6]' 
                      : 'hover:bg-gray-50/50'
                  }`}
                >
                  <td className="py-4 px-6 text-[#334155]">{complaint.caption}</td>
                  <td className="py-4 px-6">{complaint.details}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-[#0f172a] font-semibold">{complaint.time}</span>
                      <span className="text-gray-400 text-xs mt-0.5">{complaint.date}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span 
                      onDoubleClick={(e) => toggleStatus(complaint.id, e)}
                      className={`px-4 py-1.5 rounded-full text-[11px] font-bold cursor-pointer select-none transition-colors ${getStatusColor(complaint.status)}`}
                      title="Double click to toggle assignment status"
                    >
                      {complaint.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assigned To Form Card */}
      {selectedComplaintId && (
        <div className="bg-white border border-gray-200 rounded-[20px] p-6 w-full shadow-sm mt-4">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <h3 className="text-[#334155] font-bold">Assigned to</h3>
            
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setAssigners([{ id: Date.now().toString(), teacher: '', note: '', priority: 'High' }])}
                className="w-10 h-10 rounded-[10px] flex items-center justify-center bg-[#fef2f2] hover:bg-red-100 text-[#ef4444] transition-colors"
              >
                <Trash2 className="w-[18px] h-[18px]" />
              </button>
              <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#3b82f6] hover:bg-blue-600 text-white rounded-[10px] text-[13px] font-bold transition-colors shadow-sm cursor-pointer whitespace-nowrap">
                <ArrowUpCircle className="w-[18px] h-[18px]" />
                Publish
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {assigners.map((assigner, index) => (
              <div key={assigner.id} className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_200px_40px] gap-6 items-start relative">
                <div className="">
                  <TextInput 
                    label={index === 0 ? "Teacher" : ""}
                    name="teacher"
                    placeholder="Lorem Lipsum doller sit amet"
                    value={assigner.teacher}
                    onChange={(e) => handleAssignerChange(assigner.id, 'teacher', e.target.value)}
                  />
                </div>
                <div className="">
                  <TextInput 
                    label={index === 0 ? "Note" : ""}
                    name="note"
                    placeholder="Lorem Lipsum doller sit amet"
                    value={assigner.note}
                    onChange={(e) => handleAssignerChange(assigner.id, 'note', e.target.value)}
                  />
                </div>
                <div className="">
                  <SelectInput 
                    label={index === 0 ? "Status" : ""}
                    name="priority"
                    options={[
                      { label: 'High', value: 'High' },
                      { label: 'Medium', value: 'Medium' },
                      { label: 'Low', value: 'Low' }
                    ]}
                    value={assigner.priority}
                    onChange={(e) => handleAssignerChange(assigner.id, 'priority', e.target.value)}
                  />
                </div>
                <div className={`flex items-center justify-end ${index === 0 ? 'mt-[34px]' : 'mt-1'}`}>
                  {assigners.length > 1 && (
                    <button 
                      onClick={() => removeAssigner(assigner.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button 
              onClick={addAssigner}
              className="w-full mt-2 py-3.5 border-2 border-dashed border-gray-200 rounded-[14px] flex items-center justify-center gap-2 text-[#64748b] text-[13px] font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <Plus className="w-4 h-4 text-[#64748b]" />
              Add another assigner
            </button>
          </div>
        </div>
      )}
    </div>
  );
}