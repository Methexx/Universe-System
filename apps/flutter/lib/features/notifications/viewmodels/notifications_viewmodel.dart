import 'package:flutter/foundation.dart';
import 'package:universe_app/features/notifications/models/notification_model.dart';
import 'package:universe_app/features/notifications/repositories/notifications_repository.dart';

/// Holds the in-app notification list + unread count. Backs the notifications
/// screen, the dashboard bell badge, and the bottom-nav badge.
class NotificationsViewModel extends ChangeNotifier {
  final NotificationsRepository _repository;

  NotificationsViewModel(this._repository);

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  bool _hasLoaded = false;

  List<NotificationModel> _items = [];
  List<NotificationModel> get notifications => _items;
  List<NotificationModel> get unread =>
      _items.where((NotificationModel n) => !n.isRead).toList();
  List<NotificationModel> get read =>
      _items.where((NotificationModel n) => n.isRead).toList();

  int _unreadCount = 0;
  int get unreadCount => _unreadCount;
  bool get hasUnread => _unreadCount > 0;

  /// Initial load — shows a spinner on first call only. Subsequent calls use
  /// cached state so optimistic mark-as-read updates are not overwritten.
  Future<void> load() async {
    if (_hasLoaded && _items.isNotEmpty) {
      notifyListeners();
      return;
    }
    _isLoading = true;
    _error = null;
    notifyListeners();
    await _fetch();
    _hasLoaded = true;
    _isLoading = false;
    notifyListeners();
  }

  /// Silent refresh — always re-fetches from server. Used for pull-to-refresh
  /// and when a new push notification arrives.
  Future<void> refresh() async {
    await _fetch();
    _hasLoaded = true;
    notifyListeners();
  }

  Future<void> _fetch() async {
    try {
      final NotificationsPage page = await _repository.fetchNotifications();
      _items = page.notifications;
      _unreadCount = page.unreadCount;
      _error = null;
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
    }
  }

  /// Optimistically mark one notification read, then sync with the server.
  Future<void> markRead(String id) async {
    final int idx = _items.indexWhere((NotificationModel n) => n.id == id);
    if (idx == -1 || _items[idx].isRead) return;

    _items[idx] = _items[idx].copyWith(isRead: true);
    if (_unreadCount > 0) _unreadCount--;
    notifyListeners();

    try {
      await _repository.markRead(id);
    } catch (_) {
      // Keep the optimistic state; a later refresh will reconcile.
    }
  }

  /// Optimistically mark every notification read.
  Future<void> markAllRead() async {
    if (_unreadCount == 0) return;
    _items = _items
        .map((NotificationModel n) => n.isRead ? n : n.copyWith(isRead: true))
        .toList();
    _unreadCount = 0;
    notifyListeners();

    try {
      await _repository.markAllRead();
    } catch (_) {
      // Keep the optimistic state.
    }
  }

  /// Clears state on logout.
  void clear() {
    _items = [];
    _unreadCount = 0;
    _error = null;
    _isLoading = false;
    _hasLoaded = false;
    notifyListeners();
  }
}
