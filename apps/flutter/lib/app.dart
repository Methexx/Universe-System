import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:universe_app/core/constants/app_strings.dart';
import 'package:universe_app/core/di/service_locator.dart';
import 'package:universe_app/core/navigation/app_router.dart';
import 'package:universe_app/features/auth/viewmodels/auth_viewmodel.dart';
import 'package:universe_app/features/messages/viewmodels/messages_viewmodel.dart';
import 'package:universe_app/shared/themes/app_theme.dart';

class UniverseApp extends StatelessWidget {
  const UniverseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthViewModel>(
          create: (_) => AuthViewModel(ServiceLocator.instance.authRepository),
        ),
        ChangeNotifierProvider<MessagesViewModel>(
          create: (_) => MessagesViewModel(ServiceLocator.instance.messagesRepository),
        ),
      ],
      child: MaterialApp.router(
        title: AppStrings.appName,
        theme: AppTheme.light,
        routerConfig: AppRouter.router,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
