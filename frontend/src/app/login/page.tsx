import { APP_ROUTES } from '@/core/constants/routes';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Log in to manage school operations, attendance, gate activity, and communication."
      footerText="New staff account?"
      footerLinkLabel="Register now"
      footerLinkHref={APP_ROUTES.register}
    >
      <LoginForm />
    </AuthShell>
  );
}
