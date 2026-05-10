class ApiEndpoints {
  static const String basePath = '/api';
  static const String register = '$basePath/auth/register';
  static const String verifyOtp = '$basePath/auth/verify-otp';
  static const String resendOtp = '$basePath/auth/resend-otp';
  static const String login = '$basePath/auth/login';
  static const String refresh = '$basePath/auth/refresh';
  static const String logout = '$basePath/auth/logout';
  static const String forgotPassword = '$basePath/auth/forgot-password';
  static const String resetPassword = '$basePath/auth/reset-password';

  static const String parentProfile = '$basePath/auth/parent-profile';

  // Messaging
  static const String getContacts = '$basePath/messages/contacts';
  static const String getInbox = '$basePath/messages/inbox';
  static const String getThread = '$basePath/messages/thread';
  static const String sendMessage = '$basePath/messages/send';
}
