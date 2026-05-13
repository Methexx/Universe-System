import 'package:flutter/foundation.dart';
import 'package:universe_app/features/attendance/models/attendance_model.dart';
import 'package:universe_app/features/attendance/repositories/attendance_repository.dart';

class AttendanceViewModel extends ChangeNotifier {
  final AttendanceRepository _repository;

  AttendanceViewModel({required AttendanceRepository repository}) : _repository = repository;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  String? _refreshError;
  String? get refreshError => _refreshError;

  void clearRefreshError() {
    _refreshError = null;
    notifyListeners();
  }

  bool? _isInsideSchool;
  bool? get isInsideSchool => _isInsideSchool;

  List<AttendanceRecordModel> _records = [];
  List<AttendanceRecordModel> get records => _records;

  bool _hasMore = false;
  bool get hasMore => _hasMore;

  int _currentPage = 1;
  bool _isLoadingMore = false;
  bool get isLoadingMore => _isLoadingMore;

  bool _isRefreshing = false;
  bool get isRefreshing => _isRefreshing;

  DateTime? _lastUpdated;
  DateTime? get lastUpdated => _lastUpdated;

  Future<void> loadAttendance() async {
    _isLoading = true;
    _error = null;
    _refreshError = null;
    _currentPage = 1;
    _records = [];
    _isInsideSchool = null;
    notifyListeners();

    try {
      final result = await _repository.fetchChildAttendance(page: 1);
      _isInsideSchool = result.isInsideSchool;
      _records = result.records;
      _hasMore = result.pagination.hasMore;
      _currentPage = 1;
      _lastUpdated = DateTime.now();
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refresh() async {
    if (_isRefreshing) return;
    _isRefreshing = true;
    _refreshError = null;
    notifyListeners();

    try {
      final result = await _repository.fetchChildAttendance(page: 1);
      _isInsideSchool = result.isInsideSchool;
      _records = result.records;
      _hasMore = result.pagination.hasMore;
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
      final result = await _repository.fetchChildAttendance(page: nextPage);
      _records = [..._records, ...result.records];
      _hasMore = result.pagination.hasMore;
      _currentPage = nextPage;
    } catch (e) {
      _refreshError = e.toString().replaceFirst('Exception: ', '');
    } finally {
      _isLoadingMore = false;
      notifyListeners();
    }
  }
}
