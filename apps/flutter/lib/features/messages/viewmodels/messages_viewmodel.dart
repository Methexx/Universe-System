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

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  Future<void> fetchInbox() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _threads = await _repository.getInbox();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

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
}
