import 'package:dio/dio.dart';
import 'package:universe_app/core/api/api_endpoints.dart';
import 'package:universe_app/core/storage/secure_storage.dart';
import 'package:universe_app/features/support/models/complaint_model.dart';

class SupportRepository {
  final Dio _dio;
  final SecureStorageService _secureStorage;

  SupportRepository({required Dio dio, required SecureStorageService secureStorage})
      : _dio = dio,
        _secureStorage = secureStorage;

  Future<String> _getToken() async {
    final String? token = await _secureStorage.getAccessToken();
    if (token == null || token.isEmpty) {
      throw Exception('Not authenticated');
    }
    return token;
  }

  Future<List<ComplaintModel>> fetchMyComplaints() async {
    final token = await _getToken();

    try {
      final response = await _dio.get(
        ApiEndpoints.complaintsMyList,
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

      return data.map((e) => ComplaintModel.fromJson(e as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw Exception(_handleDioError(e, 'Failed to load complaints.'));
    }
  }

  Future<ComplaintModel> submitComplaint({
    required String category,
    required String description,
    String? studentId,
  }) async {
    final token = await _getToken();

    try {
      final response = await _dio.post(
        ApiEndpoints.complaintsSubmit,
        data: {
          'category': category,
          'description': description,
          if (studentId != null) 'student_id': studentId,
        },
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      final dynamic payload = response.data;
      if (payload is! Map<String, dynamic>) {
        throw Exception('Unexpected server response.');
      }

      final dynamic data = payload['data'];
      return ComplaintModel.fromJson(data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception(_handleDioError(e, 'Failed to submit complaint.'));
    }
  }

  Future<ComplaintModel> fetchComplaintById(String id) async {
    final token = await _getToken();

    try {
      final response = await _dio.get(
        ApiEndpoints.complaintById(id),
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      final dynamic payload = response.data;
      if (payload is! Map<String, dynamic>) {
        throw Exception('Unexpected server response.');
      }

      final dynamic data = payload['data'];
      return ComplaintModel.fromJson(data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception(_handleDioError(e, 'Failed to load complaint details.'));
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
