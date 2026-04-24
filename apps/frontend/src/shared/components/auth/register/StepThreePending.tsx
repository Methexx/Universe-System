'use client';

import { Clock, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StepThreePendingProps {
  fullName: string;
  email: string;
}

export function StepThreePending({ fullName, email }: StepThreePendingProps) {
  const router = useRouter();

  return (
    <div className="text-center">
      <div className="flex justify-center mb-5">
        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
          <Clock size={32} className="text-amber-500" />
        </div>
      </div>

      <h2 className="text-[22px] font-bold text-gray-900 mb-3">You&apos;re almost in!</h2>

      <p className="text-gray-500 text-sm leading-relaxed mb-3">
        Your account has been created and is waiting for admin approval.
        The school admin will review your details and assign your role.
      </p>

      <p className="text-gray-500 text-sm leading-relaxed mb-6">
        Once approved, you will receive an email notification and can
        log in to access your full dashboard.
      </p>

      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg p-3.5 mb-6 text-left">
        <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          Logged in as: <span className="font-semibold">{fullName}</span>{' '}
          <span className="text-blue-500">({email})</span>
        </p>
      </div>

      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors duration-200 mb-4"
      >
        Go to dashboard →
      </button>

      <button
        type="button"
        onClick={() => router.push('/login')}
        className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        Log out
      </button>
    </div>
  );
}
