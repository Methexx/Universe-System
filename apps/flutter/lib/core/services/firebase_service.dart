import 'package:dio/dio.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../api/api_client.dart';
import '../api/api_config.dart';
import '../storage/secure_storage.dart';

class FirebaseService {
  FirebaseService({required SecureStorageService secureStorage})
      : _secureStorage = secureStorage;

  final SecureStorageService _secureStorage;
  FirebaseMessaging? _messaging;
  late FlutterLocalNotificationsPlugin _localNotifications;

  // Notification channel for Android Heads-up notifications
  static const AndroidNotificationChannel _channel = AndroidNotificationChannel(
    'high_importance_channel', // id
    'High Importance Notifications', // title
    description: 'This channel is used for important notifications.', // description
    importance: Importance.max,
  );

  Future<void> initialize() async {
    try {
      _messaging = FirebaseMessaging.instance;

      final settings = await _messaging!.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      if (settings.authorizationStatus != AuthorizationStatus.denied) {
        final token = await _messaging!.getToken();
        if (token != null) await _saveFcmToken(token);

        _messaging!.onTokenRefresh.listen(_saveFcmToken);
        
        // Initialize local notifications
        _localNotifications = FlutterLocalNotificationsPlugin();
        const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
        const iosInit = DarwinInitializationSettings();
        const initSettings = InitializationSettings(android: androidInit, iOS: iosInit);
        await _localNotifications.initialize(settings: initSettings);

        // Create the Android channel
        await _localNotifications
            .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
            ?.createNotificationChannel(_channel);

        // Required to show foreground notifications on iOS
        await _messaging!.setForegroundNotificationPresentationOptions(
          alert: true,
          badge: true,
          sound: true,
        );

        FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
      }
    } catch (e) {
      print('Firebase initialization failed: $e');
    }
  }

  // Call this after login so the token is uploaded with a valid JWT
  Future<void> uploadTokenIfLoggedIn() async {
    try {
      final token = await _messaging?.getToken();
      if (token != null) await _saveFcmToken(token);
    } catch (e) {
      print('Failed to upload FCM token post-login: $e');
    }
  }

  void _handleForegroundMessage(RemoteMessage message) {
    print('Gate notification: ${message.notification?.title} — ${message.notification?.body}');
    
    final notification = message.notification;
    final android = message.notification?.android;

    if (notification != null && android != null) {
      _localNotifications.show(
        id: notification.hashCode,
        title: notification.title,
        body: notification.body,
        notificationDetails: NotificationDetails(
          android: AndroidNotificationDetails(
            _channel.id,
            _channel.name,
            channelDescription: _channel.description,
            icon: '@mipmap/ic_launcher',
            importance: Importance.max,
            priority: Priority.high,
          ),
        ),
      );
    }
  }

  Future<void> _saveFcmToken(String token) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('fcm_token', token);

      final accessToken = await _secureStorage.getAccessToken();
      if (accessToken == null || accessToken.isEmpty) return;

      final apiClient = ApiClient(baseUrl: ApiConfig.baseUrl);
      await apiClient.dio.put(
        '/api/users/fcm-token',
        data: {'fcm_token': token},
        options: Options(headers: {'Authorization': 'Bearer $accessToken'}),
      );
    } catch (e) {
      print('Failed to upload FCM token: $e');
    }
  }

  Future<String?> getFcmToken() async {
    return _messaging?.getToken();
  }
}
