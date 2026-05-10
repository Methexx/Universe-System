import 'package:universe_app/core/storage/local_storage.dart';
import 'package:universe_app/core/viewmodels/base_viewmodel.dart';
import 'package:universe_app/features/profile/models/parent_profile_model.dart';
import 'package:universe_app/features/profile/repositories/profile_repository.dart';

class ProfileViewModel extends BaseViewModel {
  ProfileViewModel({
    required ProfileRepository repository,
    required LocalStorageService localStorage,
  })  : _repository = repository,
        _localStorage = localStorage;

  final ProfileRepository _repository;
  final LocalStorageService _localStorage;

  ParentProfileModel? _profile;
  ParentProfileModel? get profile => _profile;

  Future<void> loadProfile() async {
    setError(null);

    // 1. Serve from cache immediately if available
    final String? cached = await _localStorage.getProfileCache();
    if (cached != null) {
      final ParentProfileModel? cachedProfile =
          ParentProfileModel.fromJsonString(cached);
      if (cachedProfile != null) {
        _profile = cachedProfile;
        notifyListeners();
      }
    }

    // 2. Fetch fresh data from the network
    if (_profile == null) {
      setLoading(true);
    }

    try {
      final ParentProfileModel fresh = await _repository.fetchProfile();
      _profile = fresh;
      await _localStorage.saveProfileCache(fresh.toJsonString());
      notifyListeners();
    } catch (e) {
      // If we already have cached data, swallow the error silently
      if (_profile == null) {
        setError(e.toString().replaceFirst('Exception: ', ''));
      }
    } finally {
      setLoading(false);
    }
  }

  Future<void> clearProfile() async {
    _profile = null;
    await _localStorage.clearProfileCache();
    notifyListeners();
  }
}
