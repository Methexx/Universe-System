import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:universe_app/app.dart';
import 'package:universe_app/core/di/service_locator.dart';
import 'package:universe_app/features/auth/viewmodels/auth_viewmodel.dart';
import 'package:universe_app/features/messages/viewmodels/messages_viewmodel.dart';
import 'package:universe_app/features/profile/viewmodels/profile_viewmodel.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

  final sl = ServiceLocator.instance;
  sl.setup();

  runApp(UniverseApp(
    authViewModel: AuthViewModel(sl.authRepository, sl.localStorageService),
    messagesViewModel: MessagesViewModel(sl.messagesRepository),
    profileViewModel: ProfileViewModel(
      repository: sl.profileRepository,
      localStorage: sl.localStorageService,
    ),
  ));
}
