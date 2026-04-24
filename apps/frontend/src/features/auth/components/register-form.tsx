'use client';

import React, { useState } from 'react';
import { validateRegister } from '../lib/validators';
import { RegisterFormValues } from '../types/auth';
import { AuthInput } from '@/shared/components/auth/auth-input';
import { AuthButton } from '@/shared/components/auth/auth-button';
import { GoogleButton } from '@/shared/components/auth/google-button';

export function RegisterForm() {
  const [values, setValues] = useState<RegisterFormValues>({
    emailOrUsername: '',
    userName: '',
    contactNumber: '',
    password: ''
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
      window.location.assign('/admin/overview');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <AuthInput
          id="register-userName"
          name="userName"
          type="text"
          label="Full Name"
          placeholder="John Smith"
          value={values.userName}
          onChange={onInputChange}
          error={errors.userName}
        />
        <AuthInput
          id="register-contactNumber"
          name="contactNumber"
          type="text"
          label="Contact Number"
          placeholder="+1 234 567 890"
          value={values.contactNumber}
          onChange={onInputChange}
          error={errors.contactNumber}
        />
      </div>

      <AuthInput
        id="register-emailOrUsername"
        name="emailOrUsername"
        type="email"
        label="Email address"
        placeholder="johnsmith@aeropanel.io"
        value={values.emailOrUsername}
        onChange={onInputChange}
        error={errors.emailOrUsername}
      />

      <AuthInput
        id="register-password"
        name="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        value={values.password}
        onChange={onInputChange}
        error={errors.password}
      />

      <AuthButton type="submit">
        Create Account
      </AuthButton>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500">Or</span>
        </div>
      </div>

      <GoogleButton>Sign up with Google</GoogleButton>
    </form>
  );
}
