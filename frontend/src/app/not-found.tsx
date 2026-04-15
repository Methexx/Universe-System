"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="relative w-[500px] h-[500px] max-w-full">
        <Image 
          src="/Assets/404.svg" 
          alt="404 Not Found" 
          fill
          priority 
          className="object-contain" 
        />
      </div>
      <h1 className="mt-8 text-3xl font-bold text-gray-900">Page Not Found</h1>
      <p className="mt-4 text-lg text-gray-600">The page you are looking for doesn&apos;t exist or has been moved.</p>
      <Link href="/admin/overview" className="mt-8 px-6 py-3 bg-[#3b82f6] hover:bg-blue-600 text-white font-medium rounded-xl transition-colors shadow-sm">
        Return to Dashboard
      </Link>
    </div>
  );
}
