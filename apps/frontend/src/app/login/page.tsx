import { AuthLayout } from '@/shared/components/auth/auth-layout';
import { LoginForm } from '@/features/auth/components/login-form';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <AuthLayout reverse={false}>
      <div className="text-center mb-8">
        <h1 className="text-[28px] font-bold text-gray-900 mb-3 tracking-tight">Welcome Back to Universe</h1>
        <p className="text-gray-500 text-[15px] leading-relaxed px-4">
          Log in to manage your academic operations, track attenacance, and gain real-time insights.
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-[15px] text-gray-500 mt-8">
        Don&apos;t have an account? <Link href="/register" className="text-blue-600 font-medium hover:text-blue-700">Create one</Link>
      </p>
    </AuthLayout>
  );
}
