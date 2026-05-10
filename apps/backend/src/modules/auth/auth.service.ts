import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';
import { generateOTP } from '../../common/utils/otp';
import { hashPassword, comparePassword } from '../../common/utils/hash';
import {
  CompleteRegistrationInput,
  ForgotPasswordInput,
  LinkChildInput,
  LoginInput,
  RegisterInput,
  ResendOtpInput,
  ResetPasswordInput,
  UpdateFcmTokenInput,
  VerifyOtpInput,
} from './auth.schema';
import { generateToken } from '../../common/utils/jwt';
import { delCache, getCache, setCache } from '../../common/utils/cache';
import { sendOtpEmail } from '../../common/utils/email';

type PendingRegistration = {
  full_name: string;
  email: string;
  password: string;
  role: 'teacher' | 'security' | 'parent';
  student_id_no?: string;
};

type JwtClaims = {
  userId: string;
  role: string;
  email: string;
};

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const pendingRegistrationMemory = new Map<string, PendingRegistration>();

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const registrationCacheKey = (email: string) => `auth:register:${normalizeEmail(email)}`;

const sanitizeUser = (user: {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  avatar_url?: string | null;
  phone_number?: string | null;
}) => ({
  userId: user.id,
  email: user.email,
  role: user.role,
  full_name: user.full_name,
  avatar_url: user.avatar_url,
  phone_number: user.phone_number,
  classes_taught: (user as any).classes_taught,
});

const buildAuthPayload = (user: {
  id: string;
  role: string;
  email: string;
  full_name: string | null;
  avatar_url?: string | null;
  phone_number?: string | null;
}) => ({
  token: generateToken({ userId: user.id, role: user.role, email: user.email }),
  role: user.role,
  user: sanitizeUser(user),
});

export class AuthService {
  private static async ensureParentRegistrationInput(input: RegisterInput) {
    if (input.role !== 'parent') return;

    if (!input.student_id_no) {
      throw new Error('student_id_no is required for parent registration');
    }

    const student = await prisma.student.findUnique({
      where: { student_id_no: input.student_id_no },
      select: {
        id: true,
        full_name: true,
        parent_email: true,
        parent_mobile: true,
        is_parent_linked: true,
        is_active: true,
        class: {
          select: {
            name: true,
            school_grade: { select: { name: true } },
          },
        },
      },
    });

    if (!student || !student.is_active) {
      throw new Error('Student not found');
    }

    if (student.is_parent_linked) {
      throw new Error('This student is already linked to a parent account');
    }

    if (!student.parent_email) {
      throw new Error('Student has no parent email configured');
    }

    if (normalizeEmail(student.parent_email) !== normalizeEmail(input.email)) {
      throw new Error('Registration email does not match school records');
    }
  }

  private static async ensureResendCooldown(email: string) {
    const latestOtp = await prisma.otpVerification.findFirst({
      where: { email },
      orderBy: { created_at: 'desc' },
      select: { created_at: true },
    });

    if (!latestOtp) return;

    const elapsedMs = Date.now() - latestOtp.created_at.getTime();
    if (elapsedMs < OTP_RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsedMs) / 1000);
      throw new Error(`Please wait ${waitSeconds}s before requesting a new OTP`);
    }
  }

  private static async createOtp(email: string) {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await prisma.otpVerification.create({
      data: {
        email,
        otp_code: otp,
        expires_at: expiresAt,
      },
    });

    await sendOtpEmail(email, otp);
  }

  private static async putPendingRegistration(input: PendingRegistration) {
    const key = registrationCacheKey(input.email);
    await setCache<PendingRegistration>(key, input, Math.floor(OTP_EXPIRY_MS / 1000));
    pendingRegistrationMemory.set(key, input);
  }

  private static async getPendingRegistration(email: string) {
    const key = registrationCacheKey(email);
    const cached = await getCache<PendingRegistration>(key);
    if (cached) return cached;

    return pendingRegistrationMemory.get(key) ?? null;
  }

  private static async clearPendingRegistration(email: string) {
    const key = registrationCacheKey(email);
    await delCache(key);
    pendingRegistrationMemory.delete(key);
  }

  private static async verifyOtpCode(email: string, otp: string) {
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        email,
        is_used: false,
      },
      orderBy: { created_at: 'desc' },
    });

    if (!otpRecord) {
      throw new Error('OTP not found or already used');
    }

    if (otpRecord.expires_at < new Date()) {
      throw new Error('OTP has expired');
    }

    if (otpRecord.attempts >= 3) {
      throw new Error('Maximum OTP attempts exceeded. Please request a new OTP.');
    }

    if (otpRecord.otp_code !== otp) {
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });
      throw new Error('Invalid OTP');
    }

    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { is_used: true },
    });
  }

  static async register(input: RegisterInput) {
    const email = normalizeEmail(input.email);

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      if (existingUser.role === 'pending' && existingUser.requested_role === input.role) {
        // Stale pending user from an incomplete registration — clear it so they can retry
        await prisma.user.delete({ where: { id: existingUser.id } });
      } else {
        throw new Error('User already exists');
      }
    }

    await AuthService.ensureParentRegistrationInput({ ...input, email });
    await AuthService.ensureResendCooldown(email);

    await AuthService.putPendingRegistration({
      full_name: input.full_name,
      email,
      password: input.password,
      role: input.role,
      student_id_no: input.student_id_no,
    });
    await AuthService.createOtp(email);

    return { message: 'OTP sent to your email' };
  }

  static async verifyOtp(input: VerifyOtpInput) {
    const email = normalizeEmail(input.email);
    const pendingRegistration = await AuthService.getPendingRegistration(email);

    if (!pendingRegistration) {
      throw new Error('No pending registration found. Please register again.');
    }

    await AuthService.verifyOtpCode(email, input.otp_code);

    const hashedPassword = await hashPassword(pendingRegistration.password);

    // If Parent, we DON'T create the user yet. 
    // We wait for the Profile Setup (2FA) to be completed.
    if (pendingRegistration.role === 'parent') {
      // Mark as verified in cache but don't delete yet
      (pendingRegistration as any).is_otp_verified = true;
      await AuthService.putPendingRegistration(pendingRegistration);

      const studentData = await prisma.student.findUnique({
        where: { student_id_no: pendingRegistration.student_id_no },
        include: {
          class: {
            include: { school_grade: true }
          }
        }
      });

      return {
        success: true,
        message: 'OTP verified. Please complete profile setup.',
        requires_profile_setup: true,
        student: studentData,
      };
    }

    const createdUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.user.create({
        data: {
          email,
          full_name: pendingRegistration.full_name,
          password_hash: hashedPassword,
          role: 'pending',
          requested_role: pendingRegistration.role,
        },
      });
    });

    await AuthService.clearPendingRegistration(email);
    return buildAuthPayload(createdUser);
  }

  static async completeRegistration(input: CompleteRegistrationInput) {
    const email = normalizeEmail(input.email);
    const pending = await AuthService.getPendingRegistration(email);

    if (!pending || !(pending as any).is_otp_verified) {
      throw new Error('Verification session expired or invalid. Please try again.');
    }

    if (pending.role !== 'parent' || !pending.student_id_no) {
      throw new Error('Invalid operation for this role.');
    }

    // 1. Fetch student for verification
    const student = await prisma.student.findUnique({
      where: { student_id_no: pending.student_id_no },
      include: {
        class: {
          include: { school_grade: true }
        }
      }
    });

    if (!student) throw new Error('Student record not found.');

    // 2. Perform 2FA Check (Logic from Flutter, moved to Backend for security)
    const actualGrade = student.class?.school_grade?.name?.toLowerCase() || '';
    const actualClass = student.class?.name?.toLowerCase() || '';
    const actualGender = student.gender?.toLowerCase() || '';
    
    // Admission year fallback if field is missing in DB
    let actualYear = (student as any).admission_year?.toString() || '';
    if (!actualYear && student.created_at) {
      actualYear = new Date(student.created_at).getFullYear().toString();
    }

    const gradeMatch = input.grade.toLowerCase() === actualGrade;
    const classMatch = input.class.toLowerCase() === actualClass || 
                       input.class.toLowerCase() === `class ${actualClass}`;
    const yearMatch = input.admission_year === actualYear;
    const genderMatch = input.gender.toLowerCase() === actualGender;

    if (!gradeMatch || !classMatch || !yearMatch || !genderMatch) {
      throw new Error('Profile verification failed. Information does not match school records.');
    }

    // 3. Create User & Link Student in Transaction
    const hashedPassword = await hashPassword(pending.password);
    const createdUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const parentCount = await tx.user.count({ where: { role: 'parent' } });
      const parent_user_id_no = `P-${String(parentCount + 1).padStart(6, '0')}`;

      const parent = await tx.user.create({
        data: {
          email,
          full_name: pending.full_name,
          password_hash: hashedPassword,
          role: 'parent',
          user_id_no: parent_user_id_no,
        },
      });

      await tx.parentStudent.create({
        data: {
          parent_id: parent.id,
          student_id: student.id,
          verified_via: 'email',
        },
      });

      await tx.student.update({
        where: { id: student.id },
        data: { is_parent_linked: true },
      });

      return parent;
    });

    await AuthService.clearPendingRegistration(email);
    return buildAuthPayload(createdUser);
  }

  static async login(input: LoginInput) {
    const email = normalizeEmail(input.email);

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        classes_taught: {
          select: { id: true, name: true, school_grade: { select: { id: true, name: true } } }
        }
      }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await comparePassword(input.password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    if (!user.is_active || user.is_suspended) {
      throw new Error('Account disabled or suspended');
    }

    return buildAuthPayload(user);
  }

  static async resendOtp(input: ResendOtpInput) {
    const email = normalizeEmail(input.email);
    const pendingRegistration = await AuthService.getPendingRegistration(email);

    if (!pendingRegistration) {
      throw new Error('No pending registration found. Please register again.');
    }

    await AuthService.ensureResendCooldown(email);
    await AuthService.createOtp(email);

    return { message: 'OTP resent successfully' };
  }

  static async forgotPassword(input: ForgotPasswordInput) {
    const email = normalizeEmail(input.email);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error('No account found with this email address');
    }

    await AuthService.ensureResendCooldown(email);
    await AuthService.createOtp(email);

    return { message: 'OTP sent to your email successfully.' };
  }

  static async resetPassword(input: ResetPasswordInput) {
    const email = normalizeEmail(input.email);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error('User not found');
    }

    await AuthService.verifyOtpCode(email, input.otp_code);
    const password_hash = await hashPassword(input.new_password);

    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash },
    });

    return { message: 'Password reset successful' };
  }

  static async refresh(userClaims: JwtClaims) {
    const user = await prisma.user.findUnique({
      where: { id: userClaims.userId },
      select: {
        id: true,
        email: true,
        role: true,
        full_name: true,
        is_active: true,
        is_suspended: true,
        avatar_url: true,
        phone_number: true,
        classes_taught: {
          select: { id: true, name: true, school_grade: { select: { id: true, name: true } } }
        }
      },
    });

    if (!user || !user.is_active || user.is_suspended || user.role === 'pending') {
      throw new Error('Session is no longer valid');
    }

    return buildAuthPayload(user);
  }

  static async logout(userId?: string) {
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { last_seen: new Date(Date.now() - 31000) },
      }).catch(() => {});
    }
    return { message: 'Logout successful' };
  }

  static async logoutAll() {
    return { message: 'Logout from all sessions successful' };
  }

  static async linkChild(input: LinkChildInput) {
    const student = await prisma.student.findUnique({
      where: { student_id_no: input.student_id_no },
      select: {
        id: true,
        full_name: true,
        parent_email: true,
        parent_mobile: true,
        is_parent_linked: true,
        is_active: true,
        class: {
          select: {
            name: true,
            school_grade: { select: { name: true } },
          },
        },
      },
    });

    if (!student || !student.is_active) {
      throw new Error('Student not found');
    }

    if (student.is_parent_linked) {
      throw new Error('This student is already linked to a parent account');
    }

    const targetEmail = student.parent_email?.trim().toLowerCase();
    if (!targetEmail) {
      throw new Error('No parent contact details found for this student');
    }

    await AuthService.ensureResendCooldown(targetEmail);
    await AuthService.createOtp(targetEmail);

    return {
      student: {
        full_name: student.full_name,
        class: student.class ? `${student.class.school_grade.name} ${student.class.name}` : null,
      },
      message: `OTP sent to stored ${input.verification_method === 'sms' ? 'mobile contact' : 'email'}`,
    };
  }

  static async updateFcmToken(userId: string, input: UpdateFcmTokenInput) {
    await prisma.user.update({
      where: { id: userId },
      data: { fcm_token: input.fcm_token },
    });

    return { message: 'FCM token updated' };
  }

  static async getParentProfile(userId: string) {
    const link = await prisma.parentStudent.findFirst({
      where: { parent_id: userId },
      include: {
        student: {
          include: {
            class: {
              include: {
                school_grade: true,
                teacher: {
                  select: {
                    full_name: true,
                    email: true,
                    phone_number: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const parent = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone_number: true,
        avatar_url: true,
        user_id_no: true,
      },
    });

    if (!parent) throw new Error('User not found');

    const student = link?.student ?? null;
    const cls = student?.class ?? null;
    const teacher = cls?.teacher ?? null;

    const admissionYear = student?.created_at
      ? new Date(student.created_at).getFullYear().toString()
      : null;

    return {
      parent: {
        id: parent.id,
        full_name: parent.full_name,
        email: parent.email,
        phone_number: parent.phone_number,
        avatar_url: parent.avatar_url,
        user_id_no: parent.user_id_no,
      },
      student: student
        ? {
            id: student.id,
            full_name: student.full_name,
            student_id_no: student.student_id_no,
            photo_url: student.photo_url,
            gender: student.gender,
            admission_year: admissionYear,
            grade: cls?.school_grade?.name ?? null,
            class_name: cls?.name ?? null,
          }
        : null,
      teacher: teacher
        ? {
            full_name: teacher.full_name,
            email: teacher.email,
            phone_number: teacher.phone_number,
          }
        : null,
    };
  }

  static async changePassword(userId: string, input: { old_password: string; new_password: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const isValid = await comparePassword(input.old_password, user.password_hash);
    if (!isValid) throw new Error('Incorrect old password');

    const newHash = await hashPassword(input.new_password);
    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: newHash },
    });

    return { message: 'Password updated successfully' };
  }
}
