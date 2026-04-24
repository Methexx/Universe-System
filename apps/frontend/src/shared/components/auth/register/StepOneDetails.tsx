'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { stepOneSchema, StepOneValues } from '@/features/auth/lib/register-schemas';
// import { registerUser } from '@/features/auth/lib/register-api';
// TODO: wire up real API call after auth backend is ready
import { PasswordStrengthBar } from './PasswordStrengthBar';

interface StepOneDetailsProps {
  defaultValues?: Partial<StepOneValues>;
  onSuccess: (data: { full_name: string; email: string }) => void;
  onToast: (message: string) => void;
}

export function StepOneDetails({ defaultValues, onSuccess, onToast }: StepOneDetailsProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);
  const [emailExistsError, setEmailExistsError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StepOneValues>({
    resolver: zodResolver(stepOneSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const passwordValue = watch('password', '');

  useEffect(() => {
    if (rateLimitSeconds <= 0) return;
    const t = setInterval(() => setRateLimitSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [rateLimitSeconds]);

  async function onSubmit(values: StepOneValues) {
    setEmailExistsError('');
    setLoading(true);

    // --- MOCK: skip real API call, go straight to step 2 ---
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    onSuccess({ full_name: values.full_name, email: values.email });
    return;

    /* TODO: uncomment when auth backend is ready
    const result = await registerUser({
      full_name: values.full_name,
      email: values.email,
      password: values.password,
    });
    setLoading(false);

    if (result.ok) {
      onSuccess({ full_name: values.full_name, email: values.email });
      return;
    }

    if (result.error === 'EMAIL_EXISTS') {
      setEmailExistsError('An account with this email already exists.');
      return;
    }

    if (result.error === 'RATE_LIMIT') {
      setRateLimitSeconds(result.retry_after ?? 60);
      onToast('Too many registration attempts. Please wait a few minutes.');
      return;
    }

    if (result.error === 'VALIDATION_ERROR') {
      onToast('Please check your details and try again.');
      return;
    }

    onToast('Something went wrong. Please try again.');
    */
  }

  const formatCountdown = (s: number) => `0:${String(s).padStart(2, '0')}`;
  const isRateLimited = rateLimitSeconds > 0;

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-[22px] font-bold text-gray-900 mb-1.5">Create your account</h2>
        <p className="text-gray-500 text-sm">Join School Connect to start working with your school.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <input
            {...register('full_name')}
            type="text"
            placeholder="e.g. Nimasha Perera"
            className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm ${
              errors.full_name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.full_name && (
            <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@school.lk"
            className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm ${
              errors.email || emailExistsError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
          {emailExistsError && (
            <p className="mt-1 text-xs text-red-500">
              {emailExistsError}{' '}
              <Link href="/login" className="font-medium underline text-blue-600">
                Login instead?
              </Link>
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`w-full px-4 py-2.5 pr-10 rounded-lg border outline-none transition-all focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <PasswordStrengthBar password={passwordValue} />
          {errors.password ? (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          ) : (
            <p className="mt-1.5 text-xs text-gray-400">
              Must be at least 8 characters with 1 uppercase and 1 number.
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              className={`w-full px-4 py-2.5 pr-10 rounded-lg border outline-none transition-all focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || isRateLimited}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Creating account…</>
          ) : isRateLimited ? (
            `Try again in ${formatCountdown(rateLimitSeconds)}`
          ) : (
            'Continue'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 font-medium hover:text-blue-700">
          Login
        </Link>
      </p>
    </div>
  );
}
