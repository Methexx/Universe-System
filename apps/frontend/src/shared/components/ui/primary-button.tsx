import React from 'react';

type PrimaryButtonProps = {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

export function PrimaryButton({ children, type = 'button', disabled }: PrimaryButtonProps) {
  return (
    <button type={type} disabled={disabled} className="auth-button disabled:cursor-not-allowed disabled:opacity-60">
      {children}
    </button>
  );
}
