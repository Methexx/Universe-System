import React from 'react';
import { AuthCarousel } from './auth-carousel';

interface AuthLayoutProps {
  children: React.ReactNode;
  reverse?: boolean;
}

export function AuthLayout({ children, reverse = false }: AuthLayoutProps) {
  return (
    <div className={`flex h-screen bg-white font-sans overflow-hidden ${reverse ? 'flex-row-reverse' : 'flex-row'}`}>
      
      {/* Form Column */}
      <div className="flex-1 flex flex-col items-center justify-start pt-[12vh] relative p-8 overflow-y-auto">
        <div className={`absolute top-8 ${reverse ? 'right-8' : 'left-8'} flex items-center gap-2`}>
          {/* Logo */}
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 28C20 28 26 24 26 18C26 14 20 14 20 14C20 14 14 14 14 18C14 24 20 28 20 28Z" fill="#1d4ed8"/>
            <path d="M18 12C18 12 12 8 8 14C4 20 10 24 10 24C10 24 14 20 18 12Z" fill="#1d4ed8"/>
            <path d="M22 12C22 12 28 8 32 14C36 20 30 24 30 24C30 24 26 20 22 12Z" fill="#1d4ed8"/>
            <circle cx="20" cy="32" r="2" fill="#1d4ed8"/>
          </svg>
        </div>

        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>

      {/* Carousel Column */}
      <div className="hidden lg:flex lg:flex-1 p-4 h-full">
        <AuthCarousel />
      </div>
    </div>
  );
}
