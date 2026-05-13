import 'package:flutter/foundation.dart';
import 'package:universe_app/features/results/models/result_model.dart';
import 'package:universe_app/features/results/repositories/results_repository.dart';

class ResultsViewModel extends ChangeNotifier {
  final ResultsRepository _repository;

  ResultsViewModel({required ResultsRepository repository}) : _repository = repository;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  List<ResultTermModel> _terms = [];
  List<ResultTermModel> get terms => _terms;

  ResultTermModel? _selectedTerm;
  ResultTermModel? get selectedTerm => _selectedTerm;

  void setSelectedTerm(ResultTermModel? term) {
    _selectedTerm = term;
    notifyListeners();
  }

  Future<void> loadResults() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _terms = await _repository.fetchChildResults();
      if (_terms.isNotEmpty && _selectedTerm == null) {
        _selectedTerm = _terms.first;
      }
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
      _terms = await _repository.fetchChildResults();
      if (_terms.isNotEmpty) {
        // Update selected term if it exists in the new list
        if (_selectedTerm != null) {
          final updated = _terms.firstWhere((t) => t.id == _selectedTerm!.id, orElse: () => _terms.first);
          _selectedTerm = updated;
        } else {
          _selectedTerm = _terms.first;
        }
      }
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
    } finally {
      notifyListeners();
    }
  }
}
