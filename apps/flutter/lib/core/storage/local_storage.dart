import 'package:shared_preferences/shared_preferences.dart';

class LocalStorageService {
  static const String _themeKey = 'selected_theme';
  static const String _profileCacheKey = 'profile_cache';

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
