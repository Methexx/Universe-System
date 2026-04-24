import React from 'react';

interface AuthCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function AuthCheckbox({ label, className = '', ...props }: AuthCheckboxProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
        {...props}
      />
      <label htmlFor={props.id} className="ml-2 block text-sm text-gray-600">
        {label}
      </label>
    </div>
  );
}
