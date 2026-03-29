'use client';

import { APP_ROUTES } from '@/core/constants/routes';
import { PrimaryButton } from '@/shared/components/ui/primary-button';
import { TextInput } from '@/shared/components/ui/text-input';
import React, { useState } from 'react';
import { validateLogin } from '../lib/validators';
import { LoginFormValues } from '../types/auth';

export function LoginForm() {
  const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({});

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
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <TextInput
        id="login-email"
        name="email"
        label="Email"
        type="email"
        value={values.email}
        onChange={onInputChange}
        placeholder="admin@school.lk"
        error={errors.email}
      />

      <TextInput
        id="login-password"
        name="password"
        label="Password"
        type="password"
        value={values.password}
        onChange={onInputChange}
        placeholder="Enter your password"
        error={errors.password}
      />

      <div className="mt-2">
        <PrimaryButton type="submit">Sign In</PrimaryButton>
      </div>
    </form>
  );
}
