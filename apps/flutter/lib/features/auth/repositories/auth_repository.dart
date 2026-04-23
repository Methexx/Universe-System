import 'package:dio/dio.dart';
import 'package:universe_app/core/api/api_endpoints.dart';
import 'package:universe_app/core/storage/secure_storage.dart';
import 'package:universe_app/features/auth/models/user_model.dart';

abstract class AuthRepository {
  Future<UserModel> login({required String email, required String password});
  Future<void> requestParentRegistrationOtp({
    required String fullName,
    required String email,
    required String password,
    required String studentIdNo,
  });
  Future<UserModel> verifyRegistrationOtp({
    required String email,
    required String otp,
  });
  Future<void> requestPasswordResetOtp({required String email});
  Future<void> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  });
  Future<UserModel?> restoreSession();
  Future<void> logout();
}

class ApiAuthRepository implements AuthRepository {
  ApiAuthRepository({required Dio dio, required SecureStorageService secureStorage})
      : _dio = dio,
        _secureStorage = secureStorage;

  final Dio _dio;
  final SecureStorageService _secureStorage;

  UserModel _requireParent(Map<String, dynamic> userJson, {required String action}) {
    final UserModel user = UserModel.fromJson(userJson);
    if (user.role != 'parent') {
      throw Exception('This mobile app is for parent accounts only. Please use a parent account to $action.');
    }
    return user;
  }

  String _extractMessage(DioException error) {
    final dynamic data = error.response?.data;
    if (data is Map<String, dynamic>) {
      final dynamic message = data['message'] ?? data['error'];
      if (message is String && message.isNotEmpty) {
        return message;
      }
    }
    return 'Request failed. Please try again.';
  }

  Future<Map<String, dynamic>> _post(String path, {Map<String, dynamic>? data, Map<String, dynamic>? headers}) async {
    try {
      final Response<dynamic> response = await _dio.post<dynamic>(
        path,
        data: data,
        options: Options(headers: headers),
      );

      final dynamic payload = response.data;
      if (payload is! Map<String, dynamic>) {
        throw Exception('Unexpected server response.');
      }

      return payload;
    } on DioException catch (error) {
      throw Exception(_extractMessage(error));
    }
  }

  Future<Map<String, dynamic>> _extractDataEnvelope(Map<String, dynamic> payload) async {
    final dynamic data = payload['data'];
    if (data is! Map<String, dynamic>) {
      throw Exception('Unexpected server response format.');
    }
    return data;
  }

  @override
  Future<UserModel> login({required String email, required String password}) async {
    final Map<String, dynamic> payload = await _post(
      ApiEndpoints.login,
      data: {
        'email': email.trim(),
        'password': password,
      },
    );

    final Map<String, dynamic> data = await _extractDataEnvelope(payload);
    final String? token = data['token'] as String?;
    final dynamic userJson = data['user'];

    if (token == null || userJson is! Map<String, dynamic>) {
      throw Exception('Invalid login response from server.');
    }

    final UserModel user = _requireParent(userJson, action: 'sign in');
    await _secureStorage.saveAccessToken(token);
    return user;
  }

  @override
  Future<void> requestParentRegistrationOtp({
    required String fullName,
    required String email,
    required String password,
    required String studentIdNo,
  }) async {
    await _post(
      ApiEndpoints.register,
      data: {
        'full_name': fullName.trim(),
        'email': email.trim(),
        'password': password,
        'role': 'parent',
        'student_id_no': studentIdNo.trim(),
      },
    );
  }

  @override
  Future<UserModel> verifyRegistrationOtp({
    required String email,
    required String otp,
  }) async {
    final Map<String, dynamic> verifyPayload = await _post(
      ApiEndpoints.verifyOtp,
      data: {
        'email': email.trim(),
        'otp': otp.trim(),
      },
    );

    final Map<String, dynamic> data = await _extractDataEnvelope(verifyPayload);
    final String? token = data['token'] as String?;
    final dynamic userJson = data['user'];

    if (token == null || userJson is! Map<String, dynamic>) {
      throw Exception('Invalid OTP verification response from server.');
    }

    final UserModel user = _requireParent(userJson, action: 'complete registration');
    await _secureStorage.saveAccessToken(token);
    return user;
  }

  @override
  Future<void> requestPasswordResetOtp({required String email}) async {
    await _post(
      ApiEndpoints.forgotPassword,
      data: {'email': email.trim()},
    );
  }

  @override
  Future<void> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    await _post(
      ApiEndpoints.resetPassword,
      data: {
        'email': email.trim(),
        'otp': otp.trim(),
        'new_password': newPassword,
      },
    );
  }

  @override
  Future<UserModel?> restoreSession() async {
    final String? token = await _secureStorage.getAccessToken();
    if (token == null || token.isEmpty) {
      return null;
    }

    try {
      final Map<String, dynamic> payload = await _post(
        ApiEndpoints.refresh,
        headers: {'Authorization': 'Bearer $token'},
      );

      final Map<String, dynamic> data = await _extractDataEnvelope(payload);
      final String? newToken = data['token'] as String?;
      final dynamic userJson = data['user'];

      if (newToken == null || userJson is! Map<String, dynamic>) {
        await _secureStorage.clearAccessToken();
        return null;
      }

      final UserModel user = UserModel.fromJson(userJson);
      if (user.role != 'parent') {
        await _secureStorage.clearAccessToken();
        return null;
      }

      await _secureStorage.saveAccessToken(newToken);
      return user;
    } on Exception {
      await _secureStorage.clearAccessToken();
      return null;
    }
  }

  @override
  Future<void> logout() async {
    final String? token = await _secureStorage.getAccessToken();

    if (token != null && token.isNotEmpty) {
      try {
        await _post(
          ApiEndpoints.logout,
          headers: {'Authorization': 'Bearer $token'},
        );
      } on Exception {
        // Always continue local logout even if network logout fails.
      }
    }

    await _secureStorage.clearAccessToken();
  }
}
