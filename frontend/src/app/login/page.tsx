import { LoginForm } from '@/features/auth/components/login-form';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <section className="login-scene">
      <p className="login-logo">Your Logo</p>

      <Image
        src="/Assets/leftside.svg"
        alt="Scooter illustration"
        className="login-asset login-asset-left"
        width={380}
        height={320}
      />
      <Image
        src="/Assets/rightside.svg"
        alt="Flying illustration"
        className="login-asset login-asset-right"
        width={330}
        height={340}
      />

      <div className="login-card">
        <div className="login-header">
          <div>
            <p className="login-top-note">Welcome to Lorem</p>
            <h1 className="login-subtitle">Sign in</h1>
          </div>

          <p className="login-mini-link">
            No Account ?
            <br />
            <Link href="/register">Sign up</Link>
          </p>
        </div>

        <LoginForm />
      </div>
    </section>
  );
}
