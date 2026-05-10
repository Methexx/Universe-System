import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:universe_app/core/constants/app_strings.dart';
import 'package:universe_app/core/navigation/app_router.dart';
import 'package:universe_app/features/auth/viewmodels/auth_viewmodel.dart';
import 'package:universe_app/features/messages/viewmodels/messages_viewmodel.dart';
import 'package:universe_app/features/profile/viewmodels/profile_viewmodel.dart';
import 'package:universe_app/shared/themes/app_theme.dart';

class UniverseApp extends StatelessWidget {
  const UniverseApp({
    super.key,
    required this.authViewModel,
    required this.messagesViewModel,
    required this.profileViewModel,
  });

  final AuthViewModel authViewModel;
  final MessagesViewModel messagesViewModel;
  final ProfileViewModel profileViewModel;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthViewModel>.value(value: authViewModel),
        ChangeNotifierProvider<MessagesViewModel>.value(value: messagesViewModel),
        ChangeNotifierProvider<ProfileViewModel>.value(value: profileViewModel),
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
