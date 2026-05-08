import React from 'react';

type PrimaryButtonProps = {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  variant?: 'default' | 'blue';
};

export function PrimaryButton({ children, type = 'button', disabled, onClick, className = '', variant = 'default' }: PrimaryButtonProps) {
  const baseClass = variant === 'blue'
    ? 'bg-[#3b82f6] text-white hover:bg-blue-600 transition-colors disabled:cursor-not-allowed disabled:opacity-60'
    : 'auth-button disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${baseClass} ${className}`}>
      {children}
    </button>
  );
}
