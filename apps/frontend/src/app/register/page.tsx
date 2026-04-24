import { AuthLayout } from '@/shared/components/auth/auth-layout';
import { RegisterForm } from '@/features/auth/components/register-form';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <AuthLayout reverse={true}>
      <div className="text-center mb-8">
        <h1 className="text-[28px] font-bold text-gray-900 mb-3 tracking-tight">Create an Account</h1>
        <p className="text-gray-500 text-[15px] leading-relaxed px-4">
          Join AeroPanel to start managing your drone fleet with confidence.
        </p>
      </div>

      <RegisterForm />

      <p className="text-center text-[15px] text-gray-500 mt-8">
        Already have an account? <Link href="/login" className="text-blue-600 font-medium hover:text-blue-700">Login</Link>
      </p>
    </AuthLayout>
  );
}
