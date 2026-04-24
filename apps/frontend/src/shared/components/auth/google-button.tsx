import React from 'react';

interface GoogleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function GoogleButton({ children = "Login with Google", className = '', ...props }: GoogleButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.8 15.71 17.58V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
        <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.58C14.73 18.24 13.48 18.64 12 18.64C9.13 18.64 6.7 16.7 5.82 14.12H2.14V16.97C3.96 20.58 7.68 23 12 23Z" fill="#34A853"/>
        <path d="M5.82 14.12C5.59 13.45 5.46 12.74 5.46 12C5.46 11.26 5.59 10.55 5.82 9.88V7.03H2.14C1.39 8.52 0.96 10.21 0.96 12C0.96 13.79 1.39 15.48 2.14 16.97L5.82 14.12Z" fill="#FBBC05"/>
        <path d="M12 5.36C13.62 5.36 15.07 5.92 16.21 7.01L19.36 3.86C17.46 2.09 14.97 1 12 1C7.68 1 3.96 3.42 2.14 7.03L5.82 9.88C6.7 7.3 9.13 5.36 12 5.36Z" fill="#EA4335"/>
      </svg>
      {children}
    </button>
  );
}
