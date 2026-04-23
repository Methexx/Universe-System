import 'package:flutter/material.dart';
import 'package:universe_app/app.dart';
import 'package:universe_app/core/di/service_locator.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  ServiceLocator.instance.setup();

  runApp(const UniverseApp());
}
