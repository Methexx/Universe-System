import { APP_ROUTES } from '@/core/constants/routes';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { RegisterForm } from '@/features/auth/components/register-form';

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create Staff Account"
      subtitle="Register as pending staff. An admin must approve your account before dashboard access."
      footerText="Already registered?"
      footerLinkLabel="Back to login"
      footerLinkHref={APP_ROUTES.login}
    >
      <RegisterForm />
    </AuthShell>
  );
}
