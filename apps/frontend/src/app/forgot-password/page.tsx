import { AuthLayout } from '@/shared/components/auth/auth-layout';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password | Universe',
  description: 'Reset your Universe system password',
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout reverse={false}>
      <div className="text-center mb-8">
        <h1 className="text-[28px] font-bold text-gray-900 mb-3 tracking-tight">Reset Password</h1>
        <p className="text-gray-500 text-[15px] leading-relaxed px-4">
          Enter your email address and we'll send you an OTP to reset your password.
        </p>
      </div>

      <ForgotPasswordForm />
    </AuthLayout>
  );
}
