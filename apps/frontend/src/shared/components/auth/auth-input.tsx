'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showForgotPassword?: boolean;
  forgotPasswordHref?: string;
}

export function AuthInput({
  label,
  error,
  type,
  showForgotPassword,
  forgotPasswordHref = '#',
  className = '',
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {showForgotPassword && (
          <Link href={forgotPasswordHref} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Forgot password?
          </Link>
        )}
      </div>
      <div className="relative">
        <input
          type={inputType}
          className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
            isPassword ? 'pr-10' : ''
          } ${error ? 'border-red-500' : 'border-gray-300'}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
