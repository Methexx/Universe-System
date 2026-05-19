import 'package:dio/dio.dart';
import 'package:universe_app/core/storage/secure_storage.dart';
import 'package:universe_app/features/lost_and_found/models/lost_found_model.dart';

class LostFoundRepository {
  final Dio _dio;
  final SecureStorageService _secureStorage;

  LostFoundRepository(this._dio, this._secureStorage);

  Future<Map<String, String>> _getAuthHeaders() async {
    final token = await _secureStorage.getAccessToken();
    return {
      'Authorization': 'Bearer $token',
    };
  }

  Future<List<LFPostModel>> getCommunityBoard() async {
    try {
      final response = await _dio.get(
        '/api/lost-found/board',
        options: Options(headers: await _getAuthHeaders()),
      );
      final List data = response.data['data'];
      return data.map((json) => LFPostModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Failed to load community board');
    }
  }

  Future<void> postLostReport({
    required String itemName,
    required String description,
    required String studentId,
    String? photoUrl,
    String? dateLost,
  }) async {
    try {
      await _dio.post(
        '/api/lost-found/reports',
        data: {
          'item_name': itemName,
          'description': description,
          'student_id': studentId,
          if (photoUrl != null) 'photo_url': photoUrl,
          if (dateLost != null) 'date_lost': dateLost,
        },
        options: Options(headers: await _getAuthHeaders()),
      );
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Failed to post lost report');
    }
  }

  Future<void> postFoundItem({
    required String itemName,
    required String description,
    required String foundAt,
    required String foundDate,
    String? photoUrl,
  }) async {
    try {
      await _dio.post(
        '/api/lost-found/items',
        data: {
          'item_name': itemName,
          'description': description,
          'found_at': foundAt,
          'found_date': foundDate,
          if (photoUrl != null) 'photo_url': photoUrl,
        },
        options: Options(headers: await _getAuthHeaders()),
      );
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Failed to post found item');
    }
  }

  Future<void> addComment({
    required String content,
    String? itemId,
    String? reportId,
  }) async {
    try {
      await _dio.post(
        '/api/lost-found/comments',
        data: {
          'content': content,
          if (itemId != null) 'item_id': itemId,
          if (reportId != null) 'report_id': reportId,
        },
        options: Options(headers: await _getAuthHeaders()),
      );
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Failed to post comment');
    }
  }
}
