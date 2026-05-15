import 'package:dio/dio.dart';
import 'package:universe_app/core/storage/secure_storage.dart';
import 'package:universe_app/features/settings/models/settings_model.dart';

class SettingsRepository {
  final Dio _dio;
  final SecureStorageService _secureStorage;

  SettingsRepository(this._dio, this._secureStorage);

  Future<Map<String, String>> _getAuthHeaders() async {
    final token = await _secureStorage.getAccessToken();
    return {
      'Authorization': 'Bearer $token',
    };
  }

  Future<UserSettingsModel> getSettings() async {
    try {
      final response = await _dio.get(
        '/api/users/settings',
        options: Options(headers: await _getAuthHeaders()),
      );
      return UserSettingsModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Failed to load settings');
    }
  }

  Future<UserSettingsModel> updateSettings(Map<String, dynamic> settings) async {
    try {
      final response = await _dio.patch(
        '/api/users/settings',
        data: settings,
        options: Options(headers: await _getAuthHeaders()),
      );
      return UserSettingsModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Failed to update settings');
    }
  }
}
