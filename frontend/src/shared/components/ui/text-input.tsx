import React from 'react';

type TextInputProps = {
  id: string;
  name: string;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  value: string;
  placeholder?: string;
  error?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function TextInput({
  id,
  name,
  label,
  type = 'text',
  value,
  placeholder,
  error,
  onChange,
}: TextInputProps) {
  return (
    <label htmlFor={id} className="flex w-full flex-col gap-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="auth-input"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? (
        <span id={`${id}-error`} className="form-error">
          {error}
        </span>
      ) : null}
    </label>
  );
}
