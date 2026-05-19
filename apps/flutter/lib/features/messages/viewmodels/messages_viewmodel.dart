import 'package:flutter/material.dart';
import '../models/message_models.dart';
import '../repositories/messages_repository.dart';

class MessagesViewModel extends ChangeNotifier {
  final MessagesRepository _repository;

  MessagesViewModel(this._repository);

  List<ThreadModel> _threads = [];
  List<ThreadModel> get threads => _threads;

  List<ContactModel> _contacts = [];
  List<ContactModel> get contacts => _contacts;

  List<MessageModel> _messages = [];
  List<MessageModel> get messages => _messages;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  // ── Inbox ───────────────────────────────────────────────────────────────────

  /// Loads inbox. If [userId] is provided, serves cached data instantly then
  /// refreshes from network in the background.
  Future<void> fetchInbox({String? userId}) async {
    // Serve cache immediately so the UI is populated on cold start
    if (userId != null) {
      final cached = await _repository.getInboxCached(userId);
      if (cached != null && cached.isNotEmpty) {
        _threads = cached;
        _error = null;
        notifyListeners();
      }
    }

    _isLoading = true;
    if (_threads.isEmpty) notifyListeners(); // show spinner only when truly empty
    _error = null;

    try {
      _threads = await _repository.getInbox(userId: userId);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ── Contacts ────────────────────────────────────────────────────────────────

  Future<void> fetchContacts() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _contacts = await _repository.getContacts();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ── Thread ──────────────────────────────────────────────────────────────────

  /// Loads a thread. If [userId] is provided, serves cached messages instantly
  /// then refreshes from network.
  Future<void> fetchThread(String contactId, {String? userId}) async {
    // Serve cache immediately
    if (userId != null) {
      final cached = await _repository.getThreadCached(userId, contactId);
      if (cached != null && cached.isNotEmpty) {
        _messages = cached;
        _error = null;
        notifyListeners();
      }
    }

    _isLoading = true;
    if (_messages.isEmpty) notifyListeners();
    _error = null;

    try {
      _messages = await _repository.getThread(contactId, userId: userId);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ── Send ────────────────────────────────────────────────────────────────────

  Future<bool> sendMessage({
    required String receiverId,
    required String content,
    String? studentId,
    String? userId,
  }) async {
    final temp = MessageModel(
      id: 'temp_${DateTime.now().microsecondsSinceEpoch}',
      senderId: userId ?? '',
      receiverId: receiverId,
      studentId: studentId,
      content: content,
      isRead: false,
      createdAt: DateTime.now(),
      sender: MessageUser(id: userId ?? '', role: ''),
      receiver: MessageUser(id: receiverId, role: ''),
      isPending: true,
    );

    _messages = [..._messages, temp];
    notifyListeners();

    try {
      await _repository.sendMessage(
        receiverId: receiverId,
        content: content,
        studentId: studentId,
      );
      await fetchThread(receiverId, userId: userId); // real list replaces temp
      // Refresh inbox list so last message and unread counts update
      await fetchInbox(userId: userId);
      return true;
    } catch (e) {
      _messages = _messages.where((m) => m.id != temp.id).toList(); // roll back
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  void clearMessages() {
    _messages = [];
    notifyListeners();
  }
}
