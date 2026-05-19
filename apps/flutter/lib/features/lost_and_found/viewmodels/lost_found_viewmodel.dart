import 'package:universe_app/core/viewmodels/base_viewmodel.dart';
import 'package:universe_app/features/lost_and_found/models/lost_found_model.dart';
import 'package:universe_app/features/lost_and_found/repositories/lost_found_repository.dart';

class LostFoundViewModel extends BaseViewModel {
  final LostFoundRepository _repository;

  LostFoundViewModel(this._repository);

  List<LFPostModel> _posts = [];
  List<LFPostModel> get posts => _posts;

  Future<void> loadBoard() async {
    setLoading(true);
    try {
      _posts = await _repository.getCommunityBoard();
      notifyListeners();
    } catch (e) {
      setError(e.toString());
    } finally {
      setLoading(false);
    }
  }

  Future<bool> createLostReport({
    required String itemName,
    required String description,
    required String studentId,
  }) async {
    setLoading(true);
    try {
      await _repository.postLostReport(
        itemName: itemName,
        description: description,
        studentId: studentId,
      );
      await loadBoard();
      return true;
    } catch (e) {
      setError(e.toString());
      return false;
    } finally {
      setLoading(false);
    }
  }

  Future<bool> createFoundItem({
    required String itemName,
    required String description,
    required String foundAt,
  }) async {
    setLoading(true);
    try {
      await _repository.postFoundItem(
        itemName: itemName,
        description: description,
        foundAt: foundAt,
        foundDate: DateTime.now().toIso8601String(),
      );
      await loadBoard();
      return true;
    } catch (e) {
      setError(e.toString());
      return false;
    } finally {
      setLoading(false);
    }
  }

  Future<void> addComment({
    required String content,
    required LFPostModel post,
  }) async {
    try {
      await _repository.addComment(
        content: content,
        itemId: post.type == LFPostType.found ? post.id : null,
        reportId: post.type == LFPostType.lost ? post.id : null,
      );
      await loadBoard();
    } catch (e) {
      setError(e.toString());
    }
  }
}
