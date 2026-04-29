import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../api/api_client.dart';
import '../api/api_config.dart';

class FirebaseService {
  static final FirebaseService _instance = FirebaseService._internal();
  FirebaseMessaging? _messaging;

  factory FirebaseService() {
    return _instance;
  }

  FirebaseService._internal();

  Future<void> initialize() async {
    try {
      await Firebase.initializeApp();
      _messaging = FirebaseMessaging.instance;

      // Request notification permission
      final settings = await _messaging!.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      if (settings.authorizationStatus != AuthorizationStatus.denied) {
        final token = await _messaging!.getToken();
        if (token != null) {
          await _saveFcmToken(token);
        }

        // Listen for token refresh
        _messaging!.onTokenRefresh.listen((newToken) {
          _saveFcmToken(newToken);
        });

        // Handle foreground messages
        FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
      }

      print('Firebase initialized successfully');
    } catch (e) {
      print('Firebase initialization failed: $e');
    }
  }

  void _handleForegroundMessage(RemoteMessage message) {
    print('Received foreground message: ${message.notification?.title}');
    print('Body: ${message.notification?.body}');
    print('Data: ${message.data}');
  }

  Future<void> _saveFcmToken(String token) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('fcm_token', token);

      // Send token to backend
      final apiClient = ApiClient(baseUrl: ApiConfig.baseUrl);
      await apiClient.dio.put('/api/users/fcm-token', data: {'fcm_token': token});

      print('FCM token saved and sent to backend: ${token.substring(0, 20)}...');
    } catch (e) {
      print('Failed to save FCM token: $e');
    }
  }

  Future<String?> getFcmToken() async {
    return await _messaging?.getToken();
  }
}
