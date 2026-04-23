"use client";

import React, { useState, useRef } from 'react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { TextInput } from '@/shared/components/ui/forms/TextInput';
import { Eye, Edit2 } from 'lucide-react';

export default function ProfilePage() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: 'Dizzpy Sanchez',
    lastName: 'Dizzpy Sanchez',
    phoneNumber: '+94 777777777777777',
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    emailNotifications: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileImage(url);
    }
  };

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-6 pb-12 w-full pr-2">
      <PageHeader 
        title="Profile"
        subtitle=""
      />

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
              onClick={handleEditClick}
              className="absolute top-6 right-6 text-[var(--muted)] hover:text-[#3b82f6] transition-colors"
            >
              <Edit2 className="w-[18px] h-[18px]" />
            </button>
            
            <div className="w-[100px] h-[100px] rounded-full bg-gray-200 overflow-hidden mb-5">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#1e293b] flex items-center justify-center text-white text-3xl font-bold">
                  {formData.firstName.charAt(0)}
                </div>
              )}
            </div>
            
            <h2 className="text-[18px] font-bold text-[#0f172a] mb-1">{formData.firstName} {formData.lastName.split(' ')[0]}</h2>
            <p className="text-[13px] font-medium text-[var(--muted)]">dizzzpy@gmail.com</p>
          </div>

          {/* Preferences Card */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[20px] p-6 w-full shadow-sm">
            <h3 className="text-[16px] font-bold text-[#0f172a] mb-1">Preferences</h3>
            <p className="text-[12px] font-medium text-[var(--muted)] mb-6">Customize ur web experience</p>

            <div className="flex flex-col gap-6">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[var(--muted)]">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#0f172a]">Dark Mode</h4>
                    <p className="text-[12px] font-medium text-[var(--muted)]">Customize ur web experience</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggle('darkMode')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${preferences.darkMode ? 'bg-[#3b82f6]' : 'bg-gray-200'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-[2px] transition-all shadow-sm ${preferences.darkMode ? 'left-[22px]' : 'left-[2px]'}`} />
                </button>
              </div>

              {/* Email Notifications Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[var(--muted)]">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#0f172a]">Email Notifications</h4>
                    <p className="text-[12px] font-medium text-[var(--muted)]">Customize ur web experience</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggle('emailNotifications')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${preferences.emailNotifications ? 'bg-[#3b82f6]' : 'bg-gray-200'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-[2px] transition-all shadow-sm ${preferences.emailNotifications ? 'left-[22px]' : 'left-[2px]'}`} />
                </button>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Personal Information Card */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[20px] p-8 w-full shadow-sm">
            <h3 className="text-[16px] font-bold text-[#0f172a] mb-1">Personal Information</h3>
            <p className="text-[12px] font-medium text-[var(--muted)] mb-8">Manage your personal information</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <TextInput 
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="bg-transparent"
              />
              <TextInput 
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="bg-transparent"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput 
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="bg-transparent"
              />
            </div>
          </div>

          {/* Danger Zone Card */}
          <div className="bg-[var(--surface)] border border-[var(--danger)] rounded-[20px] p-8 w-full shadow-sm mt-4">
            <h3 className="text-[16px] font-bold text-[#0f172a] mb-6">Danger Zone</h3>

            <div className="flex flex-col gap-6">
              {/* Password */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
                <div>
                  <h4 className="text-[14px] font-bold text-[#0f172a] mb-1">Password</h4>
                  <p className="text-[12px] font-medium text-[var(--muted)]">Last changed 3 months ago</p>
                </div>
                <button className="w-[160px] text-center px-6 py-2.5 rounded-xl border-2 border-[var(--danger)] text-[var(--danger)] text-[13px] font-bold hover:bg-red-50 transition-colors shadow-sm whitespace-nowrap">
                  Change Password
                </button>
              </div>

              {/* Delete Account */}
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
