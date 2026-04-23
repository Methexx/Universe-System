import 'package:shared_preferences/shared_preferences.dart';

class LocalStorageService {
  static const String _themeKey = 'selected_theme';

  Future<void> setSelectedTheme(String themeName) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString(_themeKey, themeName);
  }

  Future<String?> getSelectedTheme() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString(_themeKey);
  }
}
