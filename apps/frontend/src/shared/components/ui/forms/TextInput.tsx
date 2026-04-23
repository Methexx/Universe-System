import React from 'react';
import clsx from 'clsx';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  containerClassName?: string;
}

export function TextInput({ label, error, containerClassName, className, ...props }: TextInputProps) {
  return (
    <div className={clsx('flex flex-col gap-1.5 w-full', containerClassName)}>
      <label className="text-[13px] font-bold text-[#475569] tracking-wide">{label}</label>
      <input
        className={clsx(
          "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow",
          error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
}
