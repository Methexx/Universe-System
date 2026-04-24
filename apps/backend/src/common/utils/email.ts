import { Resend } from 'resend';
import { env } from '../../config/env';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: 'Your School Connect verification code',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <h2 style="margin: 0 0 8px; font-size: 22px; color: #111827;">Verify your email</h2>
        <p style="margin: 0 0 24px; color: #6b7280; font-size: 15px;">
          Use the code below to complete your School Connect registration.
          It expires in <strong>10 minutes</strong>.
        </p>
        <div style="background: #f3f4f6; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #1d4ed8;">${otp}</span>
        </div>
        <p style="color: #9ca3af; font-size: 13px; margin: 0;">
          If you didn&apos;t request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
