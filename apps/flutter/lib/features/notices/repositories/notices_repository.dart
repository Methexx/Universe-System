import 'package:dio/dio.dart';
import 'package:universe_app/core/api/api_endpoints.dart';
import 'package:universe_app/core/storage/secure_storage.dart';
import 'package:universe_app/features/notices/models/announcement_model.dart';

class NoticesRepository {
  final Dio _dio;
  final SecureStorageService _secureStorage;

  NoticesRepository({
    required Dio dio,
    required SecureStorageService secureStorage,
  })  : _dio = dio,
        _secureStorage = secureStorage;

  Future<String> _getToken() async {
    final String? token = await _secureStorage.getAccessToken();
    if (token == null || token.isEmpty) throw Exception('Not authenticated');
    return token;
  }

  Future<List<AnnouncementModel>> fetchAnnouncements() async {
    final String token = await _getToken();

    try {
      final Response<dynamic> response = await _dio.get(
        ApiEndpoints.announcements,
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      final dynamic payload = response.data;
      if (payload is! Map<String, dynamic>) {
        throw Exception('Unexpected server response.');
      }

      final dynamic data = payload['data'];
      if (data is! List) {
        throw Exception('Unexpected server response format.');
      }

      return data
          .map((dynamic e) =>
              AnnouncementModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw Exception(_handleDioError(e, 'Failed to load announcements.'));
    }
  }

  String _handleDioError(DioException e, String defaultMessage) {
    final dynamic data = e.response?.data;
    if (data is Map<String, dynamic>) {
      final dynamic msg = data['message'] ?? data['error'];
      if (msg is String && msg.isNotEmpty) return msg;
    }
    return defaultMessage;
  }
}
