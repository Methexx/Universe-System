import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:universe_app/core/constants/app_strings.dart';
import 'package:universe_app/core/navigation/app_router.dart';
import 'package:universe_app/features/auth/viewmodels/auth_viewmodel.dart';
import 'package:universe_app/features/messages/viewmodels/messages_viewmodel.dart';
import 'package:universe_app/features/profile/viewmodels/profile_viewmodel.dart';
import 'package:universe_app/shared/themes/app_theme.dart';

class UniverseApp extends StatefulWidget {
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
  State<UniverseApp> createState() => _UniverseAppState();
}

class _UniverseAppState extends State<UniverseApp> with WidgetsBindingObserver {
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _router = AppRouter.createRouter(widget.authViewModel);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    widget.authViewModel.onAppLifecycleChanged(state);
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthViewModel>.value(value: widget.authViewModel),
        ChangeNotifierProvider<MessagesViewModel>.value(value: widget.messagesViewModel),
        ChangeNotifierProvider<ProfileViewModel>.value(value: widget.profileViewModel),
      ],
      child: MaterialApp.router(
        title: AppStrings.appName,
        theme: AppTheme.light,
        routerConfig: _router,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
