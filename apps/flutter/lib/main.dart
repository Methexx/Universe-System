import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:universe_app/app.dart';
import 'package:universe_app/core/di/service_locator.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  ServiceLocator.instance.setup();

  runApp(const UniverseApp());
}
