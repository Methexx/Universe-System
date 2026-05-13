import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:universe_app/app.dart';
import 'package:universe_app/core/di/service_locator.dart';
import 'package:universe_app/features/auth/viewmodels/auth_viewmodel.dart';
import 'package:universe_app/features/messages/viewmodels/messages_viewmodel.dart';
import 'package:universe_app/features/profile/viewmodels/profile_viewmodel.dart';
import 'firebase_options.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  // OS auto-displays the notification — backend sends notification-keyed messages.
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  final sl = ServiceLocator.instance;
  await sl.setup();

  runApp(UniverseApp(
    authViewModel: AuthViewModel(
      sl.authRepository,
      sl.localStorageService,
      sl.firebaseService,
      sl.secureStorageService,
      sl.biometricService,
    ),
    messagesViewModel: MessagesViewModel(sl.messagesRepository),
    profileViewModel: ProfileViewModel(
      repository: sl.profileRepository,
      localStorage: sl.localStorageService,
    ),
    gateViewModel: sl.gateViewModel,
    attendanceViewModel: sl.attendanceViewModel,
    resultsViewModel: sl.resultsViewModel,
    supportViewModel: sl.supportViewModel,
    noticesViewModel: sl.noticesViewModel,
  ));
}
