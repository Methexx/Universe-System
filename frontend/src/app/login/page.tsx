"use client";

import { LoginForm } from '@/features/auth/components/login-form';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

export default function LoginPage() {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const flipParam = query.get('flip');
    const lastPage = sessionStorage.getItem('auth-last-page');
    const shouldAnimateBack = flipParam === 'back' || lastPage === 'register';

    if (cardRef.current) {
      cardRef.current.classList.remove('flip-card-enter-back');

      if (shouldAnimateBack) {
        // Restart animation on route change by forcing reflow.
        void cardRef.current.offsetWidth;
        cardRef.current.classList.add('flip-card-enter-back');
      }
    }

    sessionStorage.setItem('auth-last-page', 'login');
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
            <p className="login-top-note">Welcome to Universe Platform</p>
            <h1 className="login-subtitle">Sign in</h1>
          </div>

          <p className="login-mini-link">
            No Account ?
            <br />
            <Link href="/register?flip=1">Sign up</Link>
          </p>
        </div>

        <LoginForm />
      </div>
    </section>
  );
}
