import 'package:dio/dio.dart';
import 'package:universe_app/core/api/api_endpoints.dart';
import 'package:universe_app/core/storage/secure_storage.dart';
import 'package:universe_app/features/gate/models/gate_event_model.dart';

class GateRepository {
  GateRepository({required Dio dio, required SecureStorageService secureStorage})
      : _dio = dio,
        _secureStorage = secureStorage;

  final Dio _dio;
  final SecureStorageService _secureStorage;

  Future<GateStatusModel> fetchChildGateStatus({int page = 1, int limit = 20}) async {
    final String? token = await _secureStorage.getAccessToken();
    if (token == null || token.isEmpty) {
      throw Exception('Not authenticated');
    }

    try {
      final Response<dynamic> response = await _dio.get<dynamic>(
        ApiEndpoints.gateMyChildEvents,
        queryParameters: {'page': page, 'limit': limit},
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

      return GateStatusModel.fromJson(data);
    } on DioException catch (e) {
      final dynamic data = e.response?.data;
      String message = 'Failed to load gate data.';
      if (data is Map<String, dynamic>) {
        final dynamic msg = data['message'] ?? data['error'];
        if (msg is String && msg.isNotEmpty) message = msg;
      }
      throw Exception(message);
    }
  }
}
