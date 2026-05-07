import React from 'react';

type PrimaryButtonProps = {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
};

export function PrimaryButton({ children, type = 'button', disabled, onClick, className = '' }: PrimaryButtonProps) {
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`auth-button disabled:cursor-not-allowed disabled:opacity-60 ${className}`}>
      {children}
    </button>
  );
}
