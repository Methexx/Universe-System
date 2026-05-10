import 'package:shared_preferences/shared_preferences.dart';

class LocalStorageService {
  static const String _keepMeSignedInKey = 'keep_me_signed_in';
  static const String _profileCacheKey = 'profile_cache';
  static const String _themeKey = 'selected_theme';

  Future<void> setKeepMeSignedIn(bool value) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keepMeSignedInKey, value);
  }

  Future<bool> getKeepMeSignedIn() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_keepMeSignedInKey) ?? false;
  }

  Future<void> setSelectedTheme(String themeName) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString(_themeKey, themeName);
  }

  Future<String?> getSelectedTheme() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString(_themeKey);
  }

  Future<void> saveProfileCache(String jsonString) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString(_profileCacheKey, jsonString);
  }

  Future<String?> getProfileCache() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString(_profileCacheKey);
  }

  Future<void> clearProfileCache() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.remove(_profileCacheKey);
  }
}
