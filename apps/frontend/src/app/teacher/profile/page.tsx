"use client";

import React, { useState, useRef } from "react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { TextInput } from "@/shared/components/ui/forms/TextInput";
import { Eye, Edit2, Bell } from "lucide-react";

export default function TeacherProfilePage() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: "Samantha",
    lastName: "Perera",
    phoneNumber: "+94 771 234 5678",
    subject: "Mathematics",
    assignedClass: "Grade 10 - A",
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    emailNotifications: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 w-full pr-2">
      <PageHeader title="Profile" subtitle="Manage your account details and preferences." />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
        {/* Left Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Avatar Card */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[20px] p-8 w-full shadow-sm relative flex flex-col items-center">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute top-6 right-6 text-[var(--muted)] hover:text-[#4f46e5] transition-colors"
            >
              <Edit2 className="w-[18px] h-[18px]" />
            </button>

            <div className="w-[100px] h-[100px] rounded-full overflow-hidden mb-5">
              {profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#4f46e5] flex items-center justify-center text-white text-3xl font-bold">
                  {formData.firstName.charAt(0)}
                </div>
              )}
            </div>

            <h2 className="text-[18px] font-bold text-[#0f172a] mb-1">
              {formData.firstName} {formData.lastName}
            </h2>
            <p className="text-[13px] font-medium text-[var(--muted)] mb-3">s.perera@school.lk</p>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[12px] font-bold">
              Teacher
            </span>
          </div>

          {/* Preferences Card */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[20px] p-6 w-full shadow-sm">
            <h3 className="text-[16px] font-bold text-[#0f172a] mb-1">Preferences</h3>
            <p className="text-[12px] font-medium text-[var(--muted)] mb-6">Customize your experience</p>

            <div className="flex flex-col gap-6">
              {[
                { key: "darkMode" as const, label: "Dark Mode", desc: "Switch to dark theme", Icon: Eye },
                { key: "emailNotifications" as const, label: "Email Notifications", desc: "Receive updates via email", Icon: Bell },
              ].map(({ key, label, desc, Icon }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[var(--muted)]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-[#0f172a]">{label}</h4>
                      <p className="text-[12px] font-medium text-[var(--muted)]">{desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(key)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${preferences[key] ? "bg-[#4f46e5]" : "bg-gray-200"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-[2px] transition-all shadow-sm ${preferences[key] ? "left-[22px]" : "left-[2px]"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Personal Information Card */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[20px] p-8 w-full shadow-sm">
            <h3 className="text-[16px] font-bold text-[#0f172a] mb-1">Personal Information</h3>
            <p className="text-[12px] font-medium text-[var(--muted)] mb-8">Manage your personal details</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <TextInput label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} className="bg-transparent" />
              <TextInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} className="bg-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <TextInput label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="bg-transparent" />
              <TextInput label="Subject Taught" name="subject" value={formData.subject} onChange={handleInputChange} className="bg-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput label="Assigned Class" name="assignedClass" value={formData.assignedClass} onChange={handleInputChange} className="bg-transparent" />
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[var(--surface)] border border-[var(--danger)] rounded-[20px] p-8 w-full shadow-sm mt-4">
            <h3 className="text-[16px] font-bold text-[#0f172a] mb-6">Danger Zone</h3>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
                <div>
                  <h4 className="text-[14px] font-bold text-[#0f172a] mb-1">Password</h4>
                  <p className="text-[12px] font-medium text-[var(--muted)]">Last changed 2 months ago</p>
                </div>
                <button className="w-[160px] text-center px-6 py-2.5 rounded-xl border-2 border-[var(--danger)] text-[var(--danger)] text-[13px] font-bold hover:bg-red-50 transition-colors shadow-sm whitespace-nowrap">
                  Change Password
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-[14px] font-bold text-[#0f172a] mb-1">Delete My Account</h4>
                  <p className="text-[12px] font-medium text-[var(--muted)]">This action is permanent and cannot be undone.</p>
                </div>
                <button className="w-[160px] text-center px-6 py-2.5 rounded-xl bg-[var(--danger)] hover:bg-red-600 text-white text-[13px] font-bold transition-colors shadow-sm whitespace-nowrap">
                  Delete Account
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
