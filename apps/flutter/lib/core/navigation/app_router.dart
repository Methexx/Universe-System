import 'package:go_router/go_router.dart';
import 'package:universe_app/core/constants/app_routes.dart';
import 'package:universe_app/features/auth/views/forgot_password_screen.dart';
import 'package:universe_app/features/auth/views/login_screen.dart';
import 'package:universe_app/features/auth/views/registration_otp_screen.dart';
import 'package:universe_app/features/dashboard/views/dashboard_screen.dart';
import 'package:universe_app/features/splash/views/splash_screen.dart';
import 'package:universe_app/features/splash/views/welcome_screen.dart';
import 'package:universe_app/features/auth/views/register_screen.dart';
import 'package:universe_app/features/messages/views/messages_screen.dart';

import 'package:universe_app/features/profile/views/profile_setup_screen.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: AppRoutes.splash,
    routes: <RouteBase>[
      GoRoute(
        path: AppRoutes.splash,
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: AppRoutes.welcome,
        builder: (context, state) => const WelcomeScreen(),
      ),
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.register,
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: AppRoutes.registerOtp,
        builder: (context, state) => const RegistrationOtpScreen(),
      ),
      GoRoute(
        path: AppRoutes.forgotPassword,
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: AppRoutes.dashboard,
        builder: (context, state) => const DashboardScreen(),
      ),
      GoRoute(
        path: AppRoutes.messages,
        builder: (context, state) => const MessagesScreen(),
      ),
      GoRoute(
        path: AppRoutes.profileSetup,
        builder: (context, state) => const ProfileSetupScreen(),
      ),
    ],
  );
}
