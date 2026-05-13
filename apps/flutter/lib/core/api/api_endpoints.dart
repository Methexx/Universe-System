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

  static const String getContacts = '$basePath/messages/contacts';
  static const String getInbox = '$basePath/messages/inbox';
  static const String getThread = '$basePath/messages/thread';
  static const String sendMessage = '$basePath/messages/send';

  // Gate
  static const String gateMyChildEvents = '$basePath/gate/my-child-events';
  static const String attendanceMyChild = '$basePath/attendance/my-child';
  static const String resultsMyChild = '$basePath/results/my-child';
  // Complaints / Suggestions
  static const String complaintsSubmit = '$basePath/complaints';
  static const String complaintsMyList = '$basePath/complaints/my';
  static String complaintById(String id) => '$basePath/complaints/$id';

  // RAG / Chatbot
  static const String ragQuery = '$basePath/rag/query';
}
