import { appConfig } from '@/core/config/app.config';
import { LoginFormValues, RegisterFormValues } from '../types/auth';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(values: LoginFormValues) {
  const errors: Partial<Record<keyof LoginFormValues, string>> = {};

  if (!emailRegex.test(values.email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  }

  return errors;
}

export function validateRegister(values: RegisterFormValues) {
  const errors: Partial<Record<keyof RegisterFormValues, string>> = {};

  if (values.fullName.trim().length < 3) {
    errors.fullName = 'Full name must be at least 3 characters';
  }

  if (!emailRegex.test(values.email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  if (values.password.length < appConfig.auth.minPasswordLength) {
    errors.password = `Password must be at least ${appConfig.auth.minPasswordLength} characters`;
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
}
