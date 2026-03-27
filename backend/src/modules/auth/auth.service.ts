import { prisma } from '../../config/prisma';
import { generateOTP } from '../../common/utils/otp';
import { hashPassword, comparePassword } from '../../common/utils/hash';
import { RegisterInput, VerifyOtpInput, LoginInput } from './auth.schema';
import { generateToken } from '../../common/utils/jwt';

export class AuthService {
  static async register(input: RegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to DB
    await prisma.otpVerification.create({
      data: {
        email: input.email,
        otp_code: otp,
        expires_at: expiresAt,
      },
    });

    // In a real app, send OTP via email/SMS here
    console.log(`[DEVELOPMENT ONLY] OTP for ${input.email} is ${otp}`);

    return { message: 'OTP sent to your email' };
  }

  static async verifyOtp(input: VerifyOtpInput) {
    const { email, otp, full_name, password } = input;

    // We require full_name and password here again to create the user,
    // or we assume it's passed from the frontend state.
    if (!full_name || !password) {
      throw new Error('Full name and password are required to complete registration');
    }

    // Find the latest valid OTP
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

    // Mark OTP as used
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { is_used: true },
    });

    // Create User
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        full_name,
        password_hash: hashedPassword,
        role: 'pending', // Pending admin approval
      },
    });

    // Generate Token
    const token = generateToken({ userId: user.id, role: user.role });

    return { 
      user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name }, 
      token 
    };
  }

  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
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

    const token = generateToken({ userId: user.id, role: user.role });

    return { 
      user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name }, 
      token 
    };
  }
}
