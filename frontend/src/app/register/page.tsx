"use client";

import { RegisterForm } from '@/features/auth/components/register-form';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function RegisterPage() {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const flipParam = query.get('flip');
    const lastPage = sessionStorage.getItem('auth-last-page');
    const shouldAnimateForward = flipParam === '1' || lastPage === 'login';

    if (cardRef.current) {
      cardRef.current.classList.remove('flip-card-enter');

      if (shouldAnimateForward) {
        // Restart animation on route change by forcing reflow.
        void cardRef.current.offsetWidth;
        cardRef.current.classList.add('flip-card-enter');
      }
    }

    sessionStorage.setItem('auth-last-page', 'register');
  }, []);

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

      <div ref={cardRef} className="login-card">
        <div className="login-header">
          <div>
            <p className="login-top-note">Welcome to Lorem</p>
            <h1 className="login-subtitle">Sign up</h1>
          </div>

          <p className="login-mini-link">
            Have an Account ?
            <br />
            <Link href="/login?flip=back">Sign in</Link>
          </p>
        </div>

        <RegisterForm />
      </div>
    </section>
  );
}
