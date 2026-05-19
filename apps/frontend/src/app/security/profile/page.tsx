"use client";

import React, { useState, useRef, useEffect } from 'react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { TextInput } from '@/shared/components/ui/forms/TextInput';
import { Edit2, Loader2, Check, Shield } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { updateProfile, changePassword, deleteMe } from '@/features/auth/lib/auth-api';

export default function SecurityProfilePage() {
  const { user, setUser, logout } = useAuth();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  const [initialData, setInitialData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  // Modals state
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  // Password state
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      const parts = (user.full_name || '').split(' ');
      const first = parts[0] || '';
      const last = parts.slice(1).join(' ') || '';

      const newData = {
        firstName: first,
        lastName: last,
        phoneNumber: user.phone_number || '',
      };

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(newData);
      setInitialData(newData);
      setProfileImage(user.avatar_url || null);
    }
  }, [user]);

  const isDirty =
    formData.firstName !== initialData.firstName ||
    formData.lastName !== initialData.lastName ||
    formData.phoneNumber !== initialData.phoneNumber ||
    profileImage !== (user?.avatar_url || null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    const result = await updateProfile({
      full_name: fullName,
      phone_number: formData.phoneNumber,
      avatar_url: profileImage || undefined,
    });

    if (result.ok) {
      setUser({
        ...user,
        full_name: fullName,
        phone_number: formData.phoneNumber,
        avatar_url: profileImage,
      });
      setInitialData(formData);
    }
    setIsSaving(false);
  };

  const handleChangePasswordSubmit = async () => {
    setPasswordError('');
    if (passwords.new !== passwords.confirm) {
      return setPasswordError("New passwords don't match");
    }
    if (passwords.new.length < 6) {
      return setPasswordError("New password must be at least 6 characters");
    }

    setIsChangingPassword(true);
    const res = await changePassword({
      old_password: passwords.old,
      new_password: passwords.new,
    });

    if (res.ok) {
      setPasswordSuccess(true);
      setTimeout(() => {
        setPasswordModalOpen(false);
        setPasswordSuccess(false);
        setPasswords({ old: '', new: '', confirm: '' });
      }, 2000);
    } else {
      setPasswordError(res.error || 'Failed to change password');
    }
    setIsChangingPassword(false);
  };

  const handleDeleteAccount = async () => {
    const res = await deleteMe();
    if (res.ok) {
      logout();
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 pb-12 w-full pr-2 relative">
      <div className="relative">
        <PageHeader
          title="Profile"
          subtitle="Manage your security officer account details and preferences."
        />

        {isDirty && (
          <div className="absolute top-13 right-2 z-30 animate-in fade-in zoom-in duration-300">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="flex h-[42px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-[14px] font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        )}
      </div>

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
              className="absolute top-6 right-6 text-[var(--muted)] hover:text-[#0f172a] transition-colors"
            >
              <Edit2 className="w-[18px] h-[18px]" />
            </button>

            <div className="w-[100px] h-[100px] rounded-full bg-gray-200 overflow-hidden mb-5 border-2 border-[#0f172a]/10">
              {profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#0f172a] flex items-center justify-center text-white text-3xl font-bold">
                  {(formData.firstName.charAt(0) || user.email.charAt(0)).toUpperCase()}
                </div>
              )}
            </div>

            <h2 className="text-[18px] font-bold text-[#0f172a] mb-1">
              {formData.firstName || formData.lastName ? `${formData.firstName} ${formData.lastName}` : 'No Name'}
            </h2>
            <p className="text-[13px] font-medium text-[var(--muted)] mb-3">{user.email}</p>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[12px] font-bold border border-slate-200">
              <Shield className="w-3.5 h-3.5" />
              Security
            </span>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Personal Information Card */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[20px] p-8 w-full shadow-sm">
            <h3 className="text-[16px] font-bold text-[#0f172a] mb-1">Personal Information</h3>
            <p className="text-[12px] font-medium text-[var(--muted)] mb-8">Manage your personal details</p>

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
                placeholder="+94 771 234 5678"
              />
              <TextInput
                label="Email Address"
                name="email"
                value={user.email}
                onChange={() => { }}
                className="bg-gray-50 text-gray-500 cursor-not-allowed"
                disabled
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
                  <p className="text-[12px] font-medium text-[var(--muted)]">Keep your account secure by using a strong password</p>
                </div>
                <button
                  onClick={() => setPasswordModalOpen(true)}
                  className="w-[160px] text-center px-6 py-2.5 rounded-xl border-2 border-[var(--danger)] text-[var(--danger)] text-[13px] font-bold hover:bg-red-50 transition-colors shadow-sm whitespace-nowrap"
                >
                  Change Password
                </button>
              </div>

              {/* Delete Account */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-[14px] font-bold text-[#0f172a] mb-1">Delete My Account</h4>
                  <p className="text-[12px] font-medium text-[var(--muted)]">This action is permanent and cannot be undone.</p>
                </div>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="w-[160px] text-center px-6 py-2.5 rounded-xl bg-[var(--danger)] hover:bg-red-600 text-white text-[13px] font-bold transition-colors shadow-sm whitespace-nowrap"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 transition-opacity">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all relative overflow-hidden">
            {passwordSuccess ? (
              <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300 py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
                <p className="text-gray-500 font-medium">Password setup successfully.</p>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Change Password</h3>
                <p className="text-sm text-gray-500 mb-6">Enter your old password and set a new one to secure your account.</p>

                {passwordError && (
                  <div className="bg-red-50 text-red-600 text-sm font-medium p-3 rounded-lg mb-4">
                    {passwordError}
                  </div>
                )}

                <div className="flex flex-col gap-4 mb-8">
                  <TextInput
                    label="Old Password"
                    name="old"
                    type="password"
                    value={passwords.old}
                    onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
                  />
                  <TextInput
                    label="New Password"
                    name="new"
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  />
                  <TextInput
                    label="Confirm New Password"
                    name="confirm"
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => { setPasswordModalOpen(false); setPasswordError(''); setPasswords({ old: '', new: '', confirm: '' }); }}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePasswordSubmit}
                    disabled={isChangingPassword || !passwords.old || !passwords.new || !passwords.confirm}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Save Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 transition-opacity">
          <div className="bg-white rounded-3xl p-8 w-full max-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Account</h3>
            <p className="text-sm text-gray-500 mb-6">Are you absolutely sure? This action cannot be undone and you will lose all data.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
