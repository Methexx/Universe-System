import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/storage/local_storage.dart';
import '../../../core/storage/secure_storage.dart';
import '../models/message_models.dart';

class MessagesRepository {
  final ApiClient _apiClient;
  final SecureStorageService _secureStorage;
  final LocalStorageService _localStorage;

  MessagesRepository(this._apiClient, this._secureStorage, this._localStorage);

  Future<Options> _authOptions() async {
    final token = await _secureStorage.getAccessToken();
    if (token == null || token.isEmpty) throw Exception('Not authenticated');
    return Options(headers: {'Authorization': 'Bearer $token'});
  }

  // ── Contacts ────────────────────────────────────────────────────────────────

  Future<List<ContactModel>> getContacts() async {
    final response = await _apiClient.dio.get(
      ApiEndpoints.getContacts,
      options: await _authOptions(),
    );
    final List data = response.data['data'] ?? response.data;
    return data.map((e) => ContactModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  // ── Inbox (cache-first) ─────────────────────────────────────────────────────

  /// Returns cached threads immediately (if available), then fetches fresh data
  /// from the network and saves it to cache. Always returns the freshest data
  /// it can; callers that want the cached-first experience should call
  /// [getInboxCached] for the instant result and [refreshInbox] for the update.
  Future<List<ThreadModel>> getInbox({String? userId}) async {
    final List<ThreadModel> fresh = await _fetchInboxFromNetwork();
    if (userId != null) {
      await _localStorage.saveMessagesInbox(userId, ThreadModel.listToJsonString(fresh));
    }
    return fresh;
  }

  Future<List<ThreadModel>?> getInboxCached(String userId) async {
    final cached = await _localStorage.getMessagesInbox(userId);
    if (cached == null) return null;
    try {
      return ThreadModel.listFromJsonString(cached);
    } catch (_) {
      return null;
    }
  }

  Future<List<ThreadModel>> _fetchInboxFromNetwork() async {
    final response = await _apiClient.dio.get(
      ApiEndpoints.getInbox,
      options: await _authOptions(),
    );
    final List data = response.data['data'] ?? response.data;
    return data.map((e) => ThreadModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  // ── Thread (cache-first) ────────────────────────────────────────────────────

  Future<List<MessageModel>> getThread(String contactId, {String? userId}) async {
    final List<MessageModel> fresh = await _fetchThreadFromNetwork(contactId);
    if (userId != null) {
      await _localStorage.saveMessagesThread(userId, contactId, MessageModel.listToJsonString(fresh));
    }
    return fresh;
  }

  Future<List<MessageModel>?> getThreadCached(String userId, String contactId) async {
    final cached = await _localStorage.getMessagesThread(userId, contactId);
    if (cached == null) return null;
    try {
      return MessageModel.listFromJsonString(cached);
    } catch (_) {
      return null;
    }
  }

  Future<List<MessageModel>> _fetchThreadFromNetwork(String contactId) async {
    final response = await _apiClient.dio.get(
      '${ApiEndpoints.getThread}/$contactId',
      options: await _authOptions(),
    );
    final List data = response.data['data'] ?? response.data;
    return data.map((e) => MessageModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  // ── Send ────────────────────────────────────────────────────────────────────

  Future<String> sendMessage({
    required String receiverId,
    required String content,
    String? studentId,
  }) async {
    final response = await _apiClient.dio.post(
      ApiEndpoints.sendMessage,
      data: {
        'receiver_id': receiverId,
        'content': content,
        if (studentId != null) 'student_id': studentId,
      },
      options: await _authOptions(),
    );
    return response.data['data']?['message_id'] ?? response.data['message_id'];
  }

  // ── Mark as read ────────────────────────────────────────────────────────────

  Future<void> markAsRead(String messageId) async {
    await _apiClient.dio.put(
      '${ApiEndpoints.basePath}/messages/$messageId/read',
      options: await _authOptions(),
    );
  }
}
