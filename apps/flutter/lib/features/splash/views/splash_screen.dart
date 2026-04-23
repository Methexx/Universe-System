import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:universe_app/core/constants/app_routes.dart';
import 'package:universe_app/core/constants/app_strings.dart';
import 'package:universe_app/features/auth/viewmodels/auth_viewmodel.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  Timer? _redirectTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _bootstrap();
    });
  }

  Future<void> _bootstrap() async {
    final AuthViewModel authViewModel = context.read<AuthViewModel>();
    final bool isLoggedIn = await authViewModel.restoreSession();

    if (!mounted) {
      return;
    }

    _redirectTimer = Timer(const Duration(milliseconds: 600), () {
      if (!mounted) {
        return;
      }
      context.go(isLoggedIn ? AppRoutes.dashboard : AppRoutes.welcome);
    });
  }

  @override
  void dispose() {
    _redirectTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Text(
          AppStrings.appName,
          style: Theme.of(context).textTheme.headlineMedium,
        ),
      ),
    );
  }
}
