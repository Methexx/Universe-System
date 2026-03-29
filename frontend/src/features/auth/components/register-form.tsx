'use client';

import { APP_ROUTES } from '@/core/constants/routes';
import { PrimaryButton } from '@/shared/components/ui/primary-button';
import { TextInput } from '@/shared/components/ui/text-input';
import React, { useState } from 'react';
import { validateRegister } from '../lib/validators';
import { RegisterFormValues } from '../types/auth';

export function RegisterForm() {
  const [values, setValues] = useState<RegisterFormValues>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormValues, string>>>({});

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateRegister(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      // This will be replaced by API integration in the next step.
      window.location.assign(APP_ROUTES.login);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <TextInput
        id="register-name"
        name="fullName"
        label="Full Name"
        value={values.fullName}
        onChange={onInputChange}
        placeholder="School Principal"
        error={errors.fullName}
      />

      <TextInput
        id="register-email"
        name="email"
        label="Email"
        type="email"
        value={values.email}
        onChange={onInputChange}
        placeholder="you@school.lk"
        error={errors.email}
      />

      <TextInput
        id="register-password"
        name="password"
        label="Password"
        type="password"
        value={values.password}
        onChange={onInputChange}
        placeholder="Create a secure password"
        error={errors.password}
      />

      <TextInput
        id="register-confirm-password"
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        value={values.confirmPassword}
        onChange={onInputChange}
        placeholder="Re-enter your password"
        error={errors.confirmPassword}
      />

      <div className="mt-2">
        <PrimaryButton type="submit">Create Account</PrimaryButton>
      </div>
    </form>
  );
}
