import 'package:flutter/foundation.dart';
import 'package:universe_app/features/support/models/complaint_model.dart';
import 'package:universe_app/features/support/repositories/support_repository.dart';

class SupportViewModel extends ChangeNotifier {
  final SupportRepository _repository;

  SupportViewModel({required SupportRepository repository}) : _repository = repository;

  // List State
  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  List<ComplaintModel> _complaints = [];
  List<ComplaintModel> get complaints => _complaints;

  List<ComplaintModel> get complaintsTab =>
      _complaints.where((c) => !c.isSuggestion).toList();

  List<ComplaintModel> get suggestionsTab =>
      _complaints.where((c) => c.isSuggestion).toList();

  // Submit State
  bool _isSubmitting = false;
  bool get isSubmitting => _isSubmitting;

  String? _submitError;
  String? get submitError => _submitError;

  // Detail State
  bool _isLoadingDetail = false;
  bool get isLoadingDetail => _isLoadingDetail;

  String? _detailError;
  String? get detailError => _detailError;

  ComplaintModel? _selectedComplaint;
  ComplaintModel? get selectedComplaint => _selectedComplaint;

  Future<void> loadComplaints() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _complaints = await _repository.fetchMyComplaints();
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refresh() async {
    try {
      _complaints = await _repository.fetchMyComplaints();
      _error = null;
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
    } finally {
      notifyListeners();
    }
  }

  Future<bool> submitComplaint({
    required String category,
    required String description,
    String? studentId,
  }) async {
    _isSubmitting = true;
    _submitError = null;
    notifyListeners();

    try {
      final newComplaint = await _repository.submitComplaint(
        category: category,
        description: description,
        studentId: studentId,
      );
      
      // Optimistic update: prepend to list
      _complaints.insert(0, newComplaint);
      return true;
    } catch (e) {
      _submitError = e.toString().replaceFirst('Exception: ', '');
      return false;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  Future<void> loadComplaintDetail(String id) async {
    _isLoadingDetail = true;
    _detailError = null;
    _selectedComplaint = null;
    notifyListeners();

    try {
      _selectedComplaint = await _repository.fetchComplaintById(id);
    } catch (e) {
      _detailError = e.toString().replaceFirst('Exception: ', '');
    } finally {
      _isLoadingDetail = false;
      notifyListeners();
    }
  }
}
