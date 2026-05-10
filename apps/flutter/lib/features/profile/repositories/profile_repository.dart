import 'package:dio/dio.dart';
import 'package:universe_app/core/api/api_endpoints.dart';
import 'package:universe_app/core/storage/secure_storage.dart';
import 'package:universe_app/features/profile/models/parent_profile_model.dart';

abstract class ProfileRepository {
  Future<ParentProfileModel> fetchProfile();
}

class ApiProfileRepository implements ProfileRepository {
  ApiProfileRepository({required Dio dio, required SecureStorageService secureStorage})
      : _dio = dio,
        _secureStorage = secureStorage;

  final Dio _dio;
  final SecureStorageService _secureStorage;

  @override
  Future<ParentProfileModel> fetchProfile() async {
    final String? token = await _secureStorage.getAccessToken();
    if (token == null || token.isEmpty) {
      throw Exception('Not authenticated');
    }

    try {
      final Response<dynamic> response = await _dio.get<dynamic>(
        ApiEndpoints.parentProfile,
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      final dynamic payload = response.data;
      if (payload is! Map<String, dynamic>) {
        throw Exception('Unexpected server response.');
      }

      final dynamic data = payload['data'];
      if (data is! Map<String, dynamic>) {
        throw Exception('Unexpected server response format.');
      }

      return ParentProfileModel.fromJson(data);
    } on DioException catch (e) {
      final dynamic data = e.response?.data;
      String message = 'Failed to load profile.';
      if (data is Map<String, dynamic>) {
        final dynamic msg = data['message'] ?? data['error'];
        if (msg is String && msg.isNotEmpty) message = msg;
      }
      throw Exception(message);
    }
  }
}
