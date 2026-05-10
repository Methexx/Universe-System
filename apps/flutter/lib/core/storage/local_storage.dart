import 'package:shared_preferences/shared_preferences.dart';

class LocalStorageService {
  static const String _keepMeSignedInKey = 'keep_me_signed_in';
  static const String _profileCacheKey = 'profile_cache';
  static const String _themeKey = 'selected_theme';
  static const String _inboxPrefix = 'messages_inbox_';
  static const String _threadPrefix = 'messages_thread_';

  // ── Auth / session ──────────────────────────────────────────────────────────

  Future<void> setKeepMeSignedIn(bool value) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keepMeSignedInKey, value);
  }

  Future<bool> getKeepMeSignedIn() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_keepMeSignedInKey) ?? false;
  }

  // ── Theme ───────────────────────────────────────────────────────────────────

  Future<void> setSelectedTheme(String themeName) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString(_themeKey, themeName);
  }

  Future<String?> getSelectedTheme() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString(_themeKey);
  }

  // ── Profile cache ───────────────────────────────────────────────────────────

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

  // ── Messages inbox cache ────────────────────────────────────────────────────

  Future<void> saveMessagesInbox(String userId, String jsonString) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('$_inboxPrefix$userId', jsonString);
  }

  Future<String?> getMessagesInbox(String userId) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString('$_inboxPrefix$userId');
  }

  Future<void> clearMessagesInbox(String userId) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.remove('$_inboxPrefix$userId');
  }

  // ── Messages thread cache ───────────────────────────────────────────────────

  Future<void> saveMessagesThread(String userId, String contactId, String jsonString) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('${_threadPrefix}${userId}_$contactId', jsonString);
  }

  Future<String?> getMessagesThread(String userId, String contactId) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString('${_threadPrefix}${userId}_$contactId');
  }

  Future<void> clearMessagesThread(String userId, String contactId) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.remove('${_threadPrefix}${userId}_$contactId');
  }
}
