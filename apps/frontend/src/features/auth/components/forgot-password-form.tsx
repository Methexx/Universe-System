'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { AuthInput } from '@/shared/components/auth/auth-input';
import { AuthButton } from '@/shared/components/auth/auth-button';
import { forgotPassword, resetPassword } from '../lib/auth-api';
import Link from 'next/link';
import { StepTwoOtp } from '@/shared/components/auth/register/StepTwoOtp'; // Assuming we can reuse it, or we build our own OTP input.
// Wait, StepTwoOtp might be specific to register flow. Let's just build a simple OTP input for here.

export function ForgotPasswordForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    
    const result = await forgotPassword({ email });
    setLoading(false);
    
    if (result.ok) {
      setSuccess(result.data.message);
      setStep(2);
    } else {
      setError(result.error || 'Failed to send OTP. Please try again.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      setError('Enter a valid 6-digit OTP.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    const result = await resetPassword({ email, otp_code: otpCode, new_password: newPassword });
    setLoading(false);
    
    if (result.ok) {
      setSuccess('Password reset successfully. Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      setError(result.error || 'Failed to reset password. Check your OTP and try again.');
    }
  };

  if (step === 1) {
    return (
      <form onSubmit={handleSendOtp} className="space-y-5" noValidate>
        {success && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">{success}</p>}
        {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
        
        <AuthInput
          id="forgot-email"
          name="email"
          type="email"
          label="Email address"
          placeholder="you@school.lk"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <AuthButton type="submit" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Sending...
            </span>
          ) : (
            'Send OTP'
          )}
        </AuthButton>

        <div className="text-center mt-6">
          <Link href="/login" className="inline-flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={16} /> Back to login
          </Link>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleResetPassword} className="space-y-5" noValidate>
      {success && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">{success}</p>}
      {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
      
      <AuthInput
        id="reset-otp"
        name="otp"
        type="text"
        label="6-Digit OTP Code"
        placeholder="123456"
        value={otpCode}
        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        maxLength={6}
      />

      <AuthInput
        id="reset-new-password"
        name="newPassword"
        type="password"
        label="New Password"
        placeholder="••••••••"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <AuthInput
        id="reset-confirm-password"
        name="confirmPassword"
        type="password"
        label="Confirm New Password"
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <AuthButton type="submit" disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Resetting...
          </span>
        ) : (
          'Reset Password'
        )}
      </AuthButton>
      
      <div className="text-center mt-6 flex justify-between px-2 text-sm text-gray-500">
        <button 
          type="button" 
          onClick={() => { setStep(1); setError(''); setSuccess(''); }} 
          className="hover:text-gray-900 transition-colors"
        >
          Use a different email
        </button>
        <button 
          type="button" 
          onClick={handleSendOtp} 
          disabled={loading}
          className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Resend OTP
        </button>
      </div>
    </form>
  );
}
