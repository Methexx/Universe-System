'use client';

import React, { useState } from 'react';
import { validateLogin } from '../lib/validators';
import { LoginFormValues } from '../types/auth';
import { AuthInput } from '@/shared/components/auth/auth-input';
import { AuthCheckbox } from '@/shared/components/auth/auth-checkbox';
import { AuthButton } from '@/shared/components/auth/auth-button';
import { GoogleButton } from '@/shared/components/auth/google-button';

export function LoginForm() {
  const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({});
  const [rememberMe, setRememberMe] = useState(false);

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateLogin(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      window.location.assign('/admin/overview');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <AuthInput
        id="login-email"
        name="email"
        type="email"
        label="Email address"
        placeholder="johnsmith@aeropanel.io"
        value={values.email}
        onChange={onInputChange}
        error={errors.email}
      />

      <AuthInput
        id="login-password"
        name="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        value={values.password}
        onChange={onInputChange}
        error={errors.password}
        showForgotPassword={true}
      />

      <AuthCheckbox
        id="remember-me"
        label="Remember me"
        checked={rememberMe}
        onChange={(e) => setRememberMe(e.target.checked)}
      />

      <AuthButton type="submit">
        Login
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
