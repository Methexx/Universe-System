'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AuthInput } from '@/shared/components/auth/auth-input';
import { AuthCheckbox } from '@/shared/components/auth/auth-checkbox';
import { AuthButton } from '@/shared/components/auth/auth-button';
import { GoogleButton } from '@/shared/components/auth/google-button';
import { loginUser } from '../lib/auth-api';
import { useAuth } from '../context/AuthContext';

const ROLE_DASHBOARD: Record<string, string> = {
  admin: '/admin/overview',
  teacher: '/teacher/overview',
  security: '/security/dashboard',
  pending: '/pending',
};

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuth();
  const router = useRouter();

  function validate() {
    const next: typeof errors = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Password is required.';
    return next;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    const result = await loginUser({ email, password });
    setLoading(false);

    if (result.ok) {
      setUser(result.data.user);
      const destination = ROLE_DASHBOARD[result.data.role] ?? '/admin/overview';
      router.push(destination);
      return;
    }

    if (result.error === 'ACCOUNT_PENDING') {
      // User exists but is pending approval — land them on their dashboard (will show blur)
      // Re-fetch session via getMe is not needed; set a minimal pending user shell
      router.push('/login?pending=1');
      setErrors({ general: 'Your account is awaiting admin approval. You can log in once approved.' });
      return;
    }

    if (result.error === 'INVALID_CREDENTIALS') {
      setErrors({ general: 'Incorrect email or password.' });
      return;
    }

    if (result.error === 'ACCOUNT_DISABLED') {
      setErrors({ general: 'Your account has been suspended. Please contact the administrator.' });
      return;
    }

    setErrors({ general: 'Something went wrong. Please try again.' });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <AuthInput
        id="login-email"
        name="email"
        type="email"
        label="Email address"
        placeholder="you@school.lk"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />

      <AuthInput
        id="login-password"
        name="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        showForgotPassword={true}
        forgotPasswordHref="/forgot-password"
      />

      <AuthCheckbox
        id="remember-me"
        label="Remember me"
        checked={rememberMe}
        onChange={(e) => setRememberMe(e.target.checked)}
      />

      {errors.general && (
        <p className="text-sm text-red-500 text-center">{errors.general}</p>
      )}

      <AuthButton type="submit" disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Signing in…
          </span>
        ) : (
          'Login'
        )}
      </AuthButton>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500">Or</span>
        </div>
      </div>

      <GoogleButton />
    </form>
  );
}
