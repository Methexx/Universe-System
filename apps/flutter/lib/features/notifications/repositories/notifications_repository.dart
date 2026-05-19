import 'package:dio/dio.dart';
import 'package:universe_app/core/api/api_endpoints.dart';
import 'package:universe_app/core/storage/secure_storage.dart';
import 'package:universe_app/features/notifications/models/notification_model.dart';

/// Result of fetching the notification list: the items + the unread count.
class NotificationsPage {
  const NotificationsPage({required this.notifications, required this.unreadCount});
  final List<NotificationModel> notifications;
  final int unreadCount;
}

class NotificationsRepository {
  final Dio _dio;
  final SecureStorageService _secureStorage;

  NotificationsRepository({
    required Dio dio,
    required SecureStorageService secureStorage,
  })  : _dio = dio,
        _secureStorage = secureStorage;

  Future<String> _getToken() async {
    final String? token = await _secureStorage.getAccessToken();
    if (token == null || token.isEmpty) throw Exception('Not authenticated');
    return token;
  }

  Future<Options> _authOptions() async =>
      Options(headers: {'Authorization': 'Bearer ${await _getToken()}'});

  Future<NotificationsPage> fetchNotifications() async {
    try {
      final Response<dynamic> response = await _dio.get(
        ApiEndpoints.notifications,
        options: await _authOptions(),
      );

      final dynamic data = (response.data as Map<String, dynamic>?)?['data'];
      if (data is! Map<String, dynamic>) {
        throw Exception('Unexpected server response.');
      }

      final List<dynamic> list = (data['notifications'] as List?) ?? const [];
      return NotificationsPage(
        notifications: list
            .map((dynamic e) =>
                NotificationModel.fromJson(e as Map<String, dynamic>))
            .toList(),
        unreadCount: (data['unread_count'] as num?)?.toInt() ?? 0,
      );
    } on DioException catch (e) {
      throw Exception(_handleDioError(e, 'Failed to load notifications.'));
    }
  }

  Future<int> fetchUnreadCount() async {
    try {
      final Response<dynamic> response = await _dio.get(
        ApiEndpoints.notificationsUnreadCount,
        options: await _authOptions(),
      );
      final dynamic data = (response.data as Map<String, dynamic>?)?['data'];
      if (data is Map<String, dynamic>) {
        return (data['count'] as num?)?.toInt() ?? 0;
      }
      return 0;
    } on DioException catch (e) {
      throw Exception(_handleDioError(e, 'Failed to load unread count.'));
    }
  }

  Future<void> markRead(String id) async {
    try {
      await _dio.patch(
        ApiEndpoints.notificationRead(id),
        options: await _authOptions(),
      );
    } on DioException catch (e) {
      throw Exception(_handleDioError(e, 'Failed to update notification.'));
    }
  }

  Future<void> markAllRead() async {
    try {
      await _dio.post(
        ApiEndpoints.notificationsReadAll,
        options: await _authOptions(),
      );
    } on DioException catch (e) {
      throw Exception(_handleDioError(e, 'Failed to update notifications.'));
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
