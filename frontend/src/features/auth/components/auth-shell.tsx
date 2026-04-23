import { appConfig } from '@/core/config/app.config';
import Link from 'next/link';
import React from 'react';

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
};

export function AuthShell({
  title,
  subtitle,
  children,
  footerText,
  footerLinkLabel,
  footerLinkHref,
}: AuthShellProps) {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="mb-8">
          <p className="mb-2 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
            {appConfig.tagline}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        </div>

        {children}

        <p className="mt-8 text-center text-sm text-slate-600">
          {footerText} <Link href={footerLinkHref} className="auth-link">{footerLinkLabel}</Link>
        </p>
      </div>
    </div>
  );
}
