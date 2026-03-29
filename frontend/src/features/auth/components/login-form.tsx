'use client';

import { APP_ROUTES } from '@/core/constants/routes';
import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';
import { validateLogin } from '../lib/validators';
import { LoginFormValues } from '../types/auth';

export function LoginForm() {
  const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({});
  const [showPassword, setShowPassword] = useState(false);

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateLogin(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      // This will be replaced by API integration in the next step.
      window.location.assign(APP_ROUTES.dashboard);
    }
  }

  return (
    <form onSubmit={onSubmit} className="login-form">
      <label htmlFor="login-email" className="login-label">
        Enter your username or email address
      </label>
      <input
        id="login-email"
        name="email"
        type="email"
        value={values.email}
        onChange={onInputChange}
        placeholder="Username or email address"
        className="auth-input"
      />
      {errors.email ? <span className="form-error">{errors.email}</span> : null}

      <label htmlFor="login-password" className="login-label">
        Enter your Password
      </label>
      <div className="login-password-wrap">
        <input
          id="login-password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={values.password}
          onChange={onInputChange}
          placeholder="Password"
          className="auth-input pr-11"
        />
        <button
          type="button"
          className="login-eye"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          onClick={() => setShowPassword((previous) => !previous)}
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>
      {errors.password ? <span className="form-error">{errors.password}</span> : null}

      <div className="text-right">
        <Link href="#" className="forgot-link">
          Forgot Password
        </Link>
      </div>

      <button type="submit" className="auth-button mt-0.5">
        Sign in
      </button>

      <p className="login-divider">OR</p>

      <button type="button" className="google-button">
        <Image src="/Assets/google.svg" alt="Google" width={28} height={28} className="google-icon" />
        Sign in with Google
      </button>
    </form>
  );
}
