'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { OtpInput } from './OtpInput';
import { verifyOtp, resendOtp } from '@/features/auth/lib/register-api';
import { useAuth } from '@/features/auth/context/AuthContext';

const ROLE_DASHBOARD: Record<string, string> = {
  admin: '/admin/overview',
  teacher: '/teacher/overview',
  security: '/security/dashboard',
};

interface StepTwoOtpProps {
  email: string;
  role: string;
  onBack: () => void;
}

export function StepTwoOtp({ email, role, onBack }: StepTwoOtpProps) {
  const [otpValue, setOtpValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendSeconds, setResendSeconds] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [maxAttemptsReached, setMaxAttemptsReached] = useState(false);
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { setUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    startResendCountdown();
    return () => { if (resendTimerRef.current) clearInterval(resendTimerRef.current); };
  }, []);

  function startResendCountdown() {
    setResendSeconds(60);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    resendTimerRef.current = setInterval(() => {
      setResendSeconds((s) => {
        if (s <= 1) {
          clearInterval(resendTimerRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function submitOtp(code: string) {
    if (loading || maxAttemptsReached || code.length !== 6) return;
    setError('');
    setLoading(true);

    const result = await verifyOtp({ email, otp_code: code });
    setLoading(false);

    if (result.ok) {
      setUser(result.data.user);
      // All staff land as 'pending' — their dashboard will show the blur overlay
      const destination = ROLE_DASHBOARD[role] ?? ROLE_DASHBOARD[result.data.role] ?? '/admin/overview';
      router.push(destination);
      return;
    }

    setOtpValue('');

    if (result.error === 'INVALID_OTP') {
      setError('Incorrect code. Please try again.');
      return;
    }

    if (result.error === 'OTP_EXPIRED') {
      setError('This code has expired.');
      return;
    }

    if (result.error === 'MAX_ATTEMPTS') {
      setMaxAttemptsReached(true);
      setError('Too many incorrect attempts. Request a new code to continue.');
      return;
    }

    setError('Something went wrong. Please try again.');
  }

  function handleOtpChange(val: string) {
    setOtpValue(val);
    if (val.length === 6) {
      submitOtp(val);
    }
  }

  async function handleResend() {
    if (resendSeconds > 0 || resendLoading) return;
    setResendLoading(true);
    setResendSuccess(false);

    const result = await resendOtp({ email });
    setResendLoading(false);

    if (result.ok) {
      setResendSuccess(true);
      setOtpValue('');
      setError('');
      setMaxAttemptsReached(false);
      startResendCountdown();
      setTimeout(() => setResendSuccess(false), 4000);
      return;
    }

    if (result.error === 'RATE_LIMIT') {
      setError('Please wait before requesting another code.');
      return;
    }

    setError('Something went wrong. Please try again.');
  }

  const formatSec = (s: number) => `0:${String(s).padStart(2, '0')}`;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="mb-7">
        <h2 className="text-[22px] font-bold text-gray-900 mb-1.5">Check your inbox</h2>
        <p className="text-gray-500 text-sm">
          We sent a 6-digit code to <span className="font-medium text-gray-700">{email}</span>.{' '}
          Enter it below to verify your email address.
        </p>
      </div>

      <div className="space-y-5">
        <OtpInput
          value={otpValue}
          onChange={handleOtpChange}
          disabled={loading || maxAttemptsReached}
          hasError={!!error}
        />

        {error && (
          <div className="text-center">
            <p className="text-sm text-red-500">
              {error}
              {error.includes('expired') && (
                <>
                  {' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-blue-600 underline font-medium"
                  >
                    Request a new one
                  </button>
                </>
              )}
            </p>
          </div>
        )}

        {resendSuccess && (
          <p className="text-center text-sm text-green-600 font-medium">New code sent!</p>
        )}

        <button
          type="button"
          onClick={() => submitOtp(otpValue)}
          disabled={loading || maxAttemptsReached}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Verifying…</>
          ) : (
            'Verify'
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Didn&apos;t get the code?</p>
          {resendSeconds > 0 ? (
            <p className="text-sm text-gray-400">
              Resend in <span className="font-medium">{formatSec(resendSeconds)}</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="text-sm text-blue-600 font-medium hover:text-blue-700 disabled:opacity-50"
            >
              {resendLoading ? 'Sending…' : 'Resend code'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
