import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../models/message_models.dart';

class MessagesRepository {
  final ApiClient _apiClient;

  MessagesRepository(this._apiClient);

  Future<List<ContactModel>> getContacts() async {
    try {
      final response = await _apiClient.dio.get(ApiEndpoints.getContacts);
      final List data = response.data['data'] ?? response.data;
      return data.map((e) => ContactModel.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<List<ThreadModel>> getInbox() async {
    try {
      final response = await _apiClient.dio.get(ApiEndpoints.getInbox);
      final List data = response.data['data'] ?? response.data;
      return data.map((e) => ThreadModel.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<List<MessageModel>> getThread(String userId) async {
    try {
      final response = await _apiClient.dio.get('${ApiEndpoints.getThread}/$userId');
      final List data = response.data['data'] ?? response.data;
      return data.map((e) => MessageModel.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<String> sendMessage({
    required String receiverId,
    required String content,
    String? studentId,
  }) async {
    try {
      final response = await _apiClient.dio.post(
        ApiEndpoints.sendMessage,
        data: {
          'receiver_id': receiverId,
          'content': content,
          if (studentId != null) 'student_id': studentId,
        },
      );
      return response.data['data']?['message_id'] ?? response.data['message_id'];
    } catch (e) {
      rethrow;
    }
  }

  Future<void> markAsRead(String messageId) async {
    try {
      await _apiClient.dio.put('${ApiEndpoints.basePath}/messages/$messageId/read');
    } catch (e) {
      rethrow;
    }
  }
}
