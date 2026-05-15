import 'package:universe_app/core/viewmodels/base_viewmodel.dart';
import 'package:universe_app/features/settings/models/settings_model.dart';
import 'package:universe_app/features/settings/repositories/settings_repository.dart';

class SettingsViewModel extends BaseViewModel {
  final SettingsRepository _repository;

  SettingsViewModel(this._repository) {
    // Initialize with defaults to allow interaction immediately
    _settings = UserSettingsModel(
      id: '',
      userId: '',
      pushNotifications: true,
      attendanceAlerts: true,
      gateAlerts: true,
      resultAlerts: true,
    );
  }

  UserSettingsModel? _settings;
  UserSettingsModel? get settings => _settings;

  Future<void> loadSettings() async {
    setLoading(true);
    try {
      final remoteSettings = await _repository.getSettings();
      _settings = remoteSettings;
      print('Settings loaded: ${_settings?.toJson()}');
      notifyListeners();
    } catch (e) {
      print('Error loading settings: $e');
      setError(e.toString());
      // Keep defaults on error
    } finally {
      setLoading(false);
    }
  }

  Future<void> _updateRemote() async {
    if (_settings == null) return;
    try {
      await _repository.updateSettings(_settings!.toJson());
    } catch (e) {
      setError(e.toString());
      // In a real app, we might want to rollback, but let's keep it simple for now
    }
  }

  Future<void> updatePushNotifications(bool value) async {
    if (_settings == null) return;
    _settings = _settings!.copyWith(pushNotifications: value);
    notifyListeners();
    await _updateRemote();
  }

  Future<void> updateAttendanceAlerts(bool value) async {
    if (_settings == null) return;
    _settings = _settings!.copyWith(attendanceAlerts: value);
    notifyListeners();
    await _updateRemote();
  }

  Future<void> updateGateAlerts(bool value) async {
    if (_settings == null) return;
    _settings = _settings!.copyWith(gateAlerts: value);
    notifyListeners();
    await _updateRemote();
  }

  Future<void> updateResultAlerts(bool value) async {
    if (_settings == null) return;
    _settings = _settings!.copyWith(resultAlerts: value);
    notifyListeners();
    await _updateRemote();
  }
}
