import { Resend } from 'resend';
import { env } from '../../config/env';

const resend = new Resend(env.RESEND_API_KEY);
const FROM = 'Universe System <noreply@mg.methum.space>';

const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(email: string): void {
  const now = Date.now();
  const window = 10 * 60 * 1000;
  const entry = rateLimitMap.get(email);
  if (!entry || now - entry.windowStart > window) {
    rateLimitMap.set(email, { count: 1, windowStart: now });
    return;
  }
  if (entry.count >= 3) {
    throw new Error('Too many email requests. Please wait before retrying.');
  }
  entry.count += 1;
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  checkRateLimit(to);
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your Universe System verification code',
    html: `
      <div style="background-color:#f4f4f4;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;">
          <div style="background-color:#1a5c38;padding:24px 32px;">
            <span style="color:#ffffff;font-size:24px;font-weight:700;letter-spacing:1px;">Universe System</span>
          </div>
          <div style="padding:32px;">
            <h2 style="margin:0 0 16px;font-size:22px;color:#111827;">Verify Your Email</h2>
            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
              Use the code below to complete your Universe System registration.
            </p>
            <div style="background:#f3f4f6;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
              <span style="font-size:40px;font-weight:700;letter-spacing:12px;font-family:Courier New,Courier,monospace;color:#1a5c38;">${otp}</span>
            </div>
            <p style="margin:0 0 12px;color:#6b7280;font-size:14px;">
              This code expires in <strong>10 minutes</strong>.
            </p>
            <p style="margin:0;color:#9ca3af;font-size:13px;">
              If you did not request this, ignore this email.
            </p>
          </div>
          <div style="background:#f9f9f9;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
            <span style="color:#9ca3af;font-size:12px;">&copy; 2026 Universe System</span>
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendApprovalEmail(to: string, fullName: string, role: string): Promise<void> {
  checkRateLimit(to);
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your Universe System account has been approved',
    html: `
      <div style="background-color:#f4f4f4;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;">
          <div style="background-color:#1a5c38;padding:24px 32px;">
            <span style="color:#ffffff;font-size:24px;font-weight:700;letter-spacing:1px;">Universe System</span>
          </div>
          <div style="padding:32px;">
            <h2 style="margin:0 0 16px;font-size:22px;color:#111827;">&#x2705; Account Approved</h2>
            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
              Welcome <strong>${fullName}</strong>! Your Universe System account has been approved as <strong>${role}</strong>.
            </p>
            <div style="text-align:center;margin-bottom:24px;">
              <a href="${process.env.WEB_URL ?? '#'}"
                 style="display:inline-block;background-color:#1a5c38;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
                Login to Dashboard
              </a>
            </div>
            <p style="margin:0;color:#9ca3af;font-size:13px;">
              If you have any questions, contact your school administrator.
            </p>
          </div>
          <div style="background:#f9f9f9;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
            <span style="color:#9ca3af;font-size:12px;">&copy; 2026 Universe System</span>
          </div>
        </div>
      </div>
    `,
  });
}
