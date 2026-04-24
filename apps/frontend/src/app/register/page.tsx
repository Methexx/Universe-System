import { AuthLayout } from '@/shared/components/auth/auth-layout';
import { RegisterFlow } from '@/shared/components/auth/register/RegisterFlow';

export default function RegisterPage() {
  return (
    <AuthLayout reverse={true}>
      <RegisterFlow />
    </AuthLayout>
  );
}
