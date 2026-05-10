import 'package:flutter/foundation.dart';
import 'package:universe_app/features/gate/models/gate_event_model.dart';
import 'package:universe_app/features/gate/repositories/gate_repository.dart';

class GateViewModel extends ChangeNotifier {
  GateViewModel({required GateRepository repository}) : _repository = repository;

  final GateRepository _repository;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  // Separate flag for refresh-only errors (so we can show SnackBar without hiding events)
  String? _refreshError;
  String? get refreshError => _refreshError;

  void clearRefreshError() {
    _refreshError = null;
    notifyListeners();
  }

  bool? _isInsideSchool;
  bool? get isInsideSchool => _isInsideSchool;

  List<GateEventModel> _events = [];
  List<GateEventModel> get events => _events;

  bool _hasMore = false;
  bool get hasMore => _hasMore;

  int _currentPage = 1;
  bool _isLoadingMore = false;
  bool get isLoadingMore => _isLoadingMore;

  bool _isRefreshing = false;
  bool get isRefreshing => _isRefreshing;

  DateTime? _lastUpdated;
  DateTime? get lastUpdated => _lastUpdated;

  // Initial load - clears everything and shows full loading state
  Future<void> loadGateStatus() async {
    _isLoading = true;
    _error = null;
    _refreshError = null;
    _currentPage = 1;
    _events = [];        // ← clear so loading spinner shows
    _isInsideSchool = null;
    notifyListeners();

    try {
      final result = await _repository.fetchChildGateStatus(page: 1);
      _isInsideSchool = result.isInsideSchool;
      _events = result.events;
      _hasMore = result.hasMore;
      _currentPage = 1;
      _lastUpdated = DateTime.now();
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Refresh - keeps existing events visible, surfaces error via refreshError
  Future<void> refresh() async {
    if (_isRefreshing) return;
    _isRefreshing = true;
    _refreshError = null;
    notifyListeners();

    try {
      final result = await _repository.fetchChildGateStatus(page: 1);
      _isInsideSchool = result.isInsideSchool;
      _events = result.events;
      _hasMore = result.hasMore;
      _currentPage = 1;
      _lastUpdated = DateTime.now();
    } catch (e) {
      _refreshError = e.toString().replaceFirst('Exception: ', '');
    } finally {
      _isRefreshing = false;
      notifyListeners();
    }
  }

  Future<void> loadMore() async {
    if (_isLoadingMore || !_hasMore) return;
    _isLoadingMore = true;
    notifyListeners();

    try {
      final nextPage = _currentPage + 1;
      final result = await _repository.fetchChildGateStatus(page: nextPage);
      _events = [..._events, ...result.events];
      _hasMore = result.hasMore;
      _currentPage = nextPage;
    } catch (e) {
      _refreshError = e.toString().replaceFirst('Exception: ', '');
    } finally {
      _isLoadingMore = false;
      notifyListeners();
    }
  }
}
