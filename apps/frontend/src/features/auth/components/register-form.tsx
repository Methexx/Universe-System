'use client';

import { APP_ROUTES } from '@/core/constants/routes';
import React, { useState } from 'react';
import { validateRegister } from '../lib/validators';
import { RegisterFormValues } from '../types/auth';

export function RegisterForm() {
  const [values, setValues] = useState<RegisterFormValues>({
    emailOrUsername: '',
    userName: '',
    contactNumber: '',
    password: '',
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
    <form onSubmit={onSubmit} className="register-form">
      <label htmlFor="register-email-or-username" className="login-label">
        Enter your username or email address
      </label>
      <input
        id="register-email-or-username"
        name="emailOrUsername"
        type="text"
        value={values.emailOrUsername}
        onChange={onInputChange}
        placeholder="Username or email address"
        className="auth-input"
      />
      {errors.emailOrUsername ? <span className="form-error">{errors.emailOrUsername}</span> : null}

      <div className="register-grid-2">
        <div>
          <label htmlFor="register-user-name" className="login-label">
            User name
          </label>
          <input
            id="register-user-name"
            name="userName"
            type="text"
            value={values.userName}
            onChange={onInputChange}
            placeholder="User name"
            className="auth-input"
          />
          {errors.userName ? <span className="form-error">{errors.userName}</span> : null}
        </div>

        <div>
          <label htmlFor="register-contact-number" className="login-label">
            Contact Number
          </label>
          <input
            id="register-contact-number"
            name="contactNumber"
            type="text"
            value={values.contactNumber}
            onChange={onInputChange}
            placeholder="Contact Number"
            className="auth-input"
          />
          {errors.contactNumber ? <span className="form-error">{errors.contactNumber}</span> : null}
        </div>
      </div>

      <label htmlFor="register-password" className="login-label">
        Enter your Password
      </label>
      <input
        id="register-password"
        name="password"
        type="password"
        value={values.password}
        onChange={onInputChange}
        placeholder="Password"
        className="auth-input"
      />
      {errors.password ? <span className="form-error">{errors.password}</span> : null}

      <button type="submit" className="auth-button mt-2">
        Sign up
      </button>
    </form>
  );
}
