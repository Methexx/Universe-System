import 'dart:convert';
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

  /// Called when the app opens from a tapped notification (background/terminated).
  void Function(RemoteMessage)? onNotificationTap;

  /// Called for every foreground message — lets the UI refresh live (e.g. the
  /// in-app notification list and unread badge).
  void Function(RemoteMessage)? onMessageReceived;

  static const AndroidNotificationChannel _channel = AndroidNotificationChannel(
    'high_importance_channel',
    'High Importance Notifications',
    description: 'This channel is used for important notifications.',
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

        _localNotifications = FlutterLocalNotificationsPlugin();
        const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
        const iosInit = DarwinInitializationSettings();
        const initSettings = InitializationSettings(android: androidInit, iOS: iosInit);
        await _localNotifications.initialize(
          settings: initSettings,
          onDidReceiveNotificationResponse: (details) {
            if (details.payload != null) {
              try {
                final message = RemoteMessage.fromMap(jsonDecode(details.payload!));
                onNotificationTap?.call(message);
              } catch (_) {}
            }
          },
        );

        await _localNotifications
            .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
            ?.createNotificationChannel(_channel);

        await _messaging!.setForegroundNotificationPresentationOptions(
          alert: true,
          badge: true,
          sound: true,
        );

        FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

        FirebaseMessaging.onMessageOpenedApp.listen((message) {
          onNotificationTap?.call(message);
        });

        FirebaseMessaging.instance.getInitialMessage().then((message) {
          if (message != null) {
            Future.delayed(Duration.zero, () => onNotificationTap?.call(message));
          }
        });
      }
    } catch (e) {
      print('Firebase initialization failed: $e');
    }
  }

  Future<void> uploadTokenIfLoggedIn() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cached = prefs.getString('fcm_token');
      final token = cached ?? await _messaging?.getToken();
      if (token != null) await _saveFcmToken(token);
    } catch (e) {
      print('Failed to upload FCM token post-login: $e');
    }
  }

  void _handleForegroundMessage(RemoteMessage message) {
    print('Gate notification: ${message.notification?.title} — ${message.notification?.body}');

    // Let the UI update the in-app list / unread badge live.
    onMessageReceived?.call(message);

    final notification = message.notification;
    if (notification == null) return;

    _localNotifications.show(
      id: notification.hashCode,
      title: notification.title,
      body: notification.body,
      payload: jsonEncode(message.toMap()),
      notificationDetails: NotificationDetails(
        android: AndroidNotificationDetails(
          _channel.id,
          _channel.name,
          channelDescription: _channel.description,
          icon: '@mipmap/ic_launcher',
          importance: Importance.max,
          priority: Priority.high,
        ),
        iOS: const DarwinNotificationDetails(
          sound: 'default',
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
    );
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

  /// Checks the current OS notification permission and requests it if not yet
  /// determined. Returns `true` if permission is granted or provisional,
  /// `false` if permanently denied (caller should show "open device settings" UI).
  Future<bool> requestOrCheckPermission() async {
    try {
      final messaging = _messaging ?? FirebaseMessaging.instance;
      final settings = await messaging.getNotificationSettings();
      final status = settings.authorizationStatus;

      if (status == AuthorizationStatus.authorized ||
          status == AuthorizationStatus.provisional) {
        return true;
      }

      if (status == AuthorizationStatus.notDetermined) {
        final result = await messaging.requestPermission(
          alert: true,
          badge: true,
          sound: true,
        );
        return result.authorizationStatus == AuthorizationStatus.authorized ||
            result.authorizationStatus == AuthorizationStatus.provisional;
      }

      // AuthorizationStatus.denied — permanently denied by user.
      return false;
    } catch (_) {
      return false;
    }
  }
}
