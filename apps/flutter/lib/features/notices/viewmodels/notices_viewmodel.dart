import 'package:flutter/foundation.dart';
import 'package:universe_app/features/notices/models/announcement_model.dart';
import 'package:universe_app/features/notices/repositories/notices_repository.dart';

class NoticesViewModel extends ChangeNotifier {
  final NoticesRepository _repository;

  NoticesViewModel({required NoticesRepository repository})
      : _repository = repository;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  List<AnnouncementModel> _announcements = [];
  List<AnnouncementModel> get announcements => _announcements;

  // Top 4 for dashboard carousel
  List<AnnouncementModel> get dashboardAnnouncements =>
      _announcements.take(4).toList();

  Future<void> loadAnnouncements() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _announcements = await _repository.fetchAnnouncements();
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refresh() async {
    _error = null;
    try {
      _announcements = await _repository.fetchAnnouncements();
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
    } finally {
      notifyListeners();
    }
  }
}
