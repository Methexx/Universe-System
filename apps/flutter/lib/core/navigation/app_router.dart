import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:universe_app/core/constants/app_routes.dart';
import 'package:universe_app/features/auth/viewmodels/auth_viewmodel.dart';
import 'package:universe_app/features/auth/views/forgot_password_screen.dart';
import 'package:universe_app/features/auth/views/login_screen.dart';
import 'package:universe_app/features/auth/views/registration_otp_screen.dart';
import 'package:universe_app/features/dashboard/views/dashboard_screen.dart';
import 'package:universe_app/features/attendance/views/attendance_screen.dart';
import 'package:universe_app/features/support/views/support_screen.dart';
import 'package:universe_app/features/support/views/submit_complaint_screen.dart';
import 'package:universe_app/features/support/views/complaint_detail_screen.dart';
import 'package:universe_app/features/gate/views/gate_status_screen.dart';
import 'package:universe_app/features/splash/views/splash_screen.dart';
import 'package:universe_app/features/splash/views/welcome_screen.dart';
import 'package:universe_app/features/auth/views/register_screen.dart';
import 'package:universe_app/features/messages/views/messages_screen.dart';
import 'package:universe_app/features/profile/views/profile_setup_screen.dart';
import 'package:universe_app/features/contact_teacher/views/teacher_chat_screen.dart';
import 'package:universe_app/features/messages/views/teacher_inbox_screen.dart';
import 'package:universe_app/features/lost_and_found/views/lost_and_found_screen.dart';
import 'package:universe_app/features/results/views/results_screen.dart';
import 'package:universe_app/features/chatbot/views/chatbot_screen.dart';
import 'package:universe_app/features/profile/views/profile_screen.dart';
import 'package:universe_app/features/settings/views/settings_screen.dart';
import 'package:universe_app/features/notices/views/notices_screen.dart';
import 'package:universe_app/features/notifications/views/notifications_screen.dart';
import 'package:universe_app/features/settings/views/privacy_policy_screen.dart';
import 'package:universe_app/features/settings/views/terms_of_service_screen.dart';

CustomTransitionPage<void> _slideTransition({
  required LocalKey key,
  required Widget child,
}) {
  return CustomTransitionPage<void>(
    key: key,
    child: child,
    transitionDuration: const Duration(milliseconds: 420),
    reverseTransitionDuration: const Duration(milliseconds: 320),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      final curved = CurvedAnimation(
        parent: animation,
        curve: Curves.easeOutCubic,
        reverseCurve: Curves.easeInCubic,
      );
      return SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(1.0, 0),
          end: Offset.zero,
        ).animate(curved),
        child: FadeTransition(
          opacity: Tween<double>(begin: 0.0, end: 1.0).animate(curved),
          child: child,
        ),
      );
    },
  );
}

class AppRouter {
  static GoRouter createRouter(AuthViewModel authViewModel) {
    return GoRouter(
      initialLocation: AppRoutes.splash,
      refreshListenable: authViewModel,
      redirect: (context, state) {
        final bool loggedIn = authViewModel.isAuthenticated;
        final bool isLoggingIn = state.matchedLocation == AppRoutes.login || 
                                 state.matchedLocation == AppRoutes.welcome ||
                                 state.matchedLocation == AppRoutes.register ||
                                 state.matchedLocation == AppRoutes.splash;

        if (!loggedIn && !isLoggingIn) {
          return AppRoutes.login;
        }

        if (loggedIn && isLoggingIn && state.matchedLocation != AppRoutes.splash) {
          return AppRoutes.dashboard;
        }

        return null;
      },
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
      GoRoute(
        path: AppRoutes.support,
        pageBuilder: (context, state) => _slideTransition(
          key: state.pageKey,
          child: const SupportScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutes.submitComplaint,
        pageBuilder: (context, state) => _slideTransition(
          key: state.pageKey,
          child: SubmitComplaintScreen(isSuggestion: state.extra as bool? ?? false),
        ),
      ),
      GoRoute(
        path: AppRoutes.complaintDetail,
        pageBuilder: (context, state) => _slideTransition(
          key: state.pageKey,
          child: ComplaintDetailScreen(complaintId: state.extra as String? ?? ''),
        ),
      ),
      GoRoute(
        path: AppRoutes.attendance,
        pageBuilder: (context, state) => _slideTransition(
          key: state.pageKey,
          child: const AttendanceScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutes.gateStatus,
        pageBuilder: (context, state) => _slideTransition(
          key: state.pageKey,
          child: const GateStatusScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutes.teacherChat,
        pageBuilder: (context, state) => _slideTransition(
          key: state.pageKey,
          child: TeacherChatScreen(targetUserId: state.extra as String?),
        ),
      ),
      GoRoute(
        path: AppRoutes.teacherInbox,
        pageBuilder: (context, state) => _slideTransition(
          key: state.pageKey,
          child: TeacherInboxScreen(initialContactId: state.extra as String?),
        ),
      ),
      GoRoute(
        path: AppRoutes.lostAndFound,
        pageBuilder: (context, state) => _slideTransition(
          key: state.pageKey,
          child: const LostAndFoundScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutes.results,
        pageBuilder: (context, state) => _slideTransition(
          key: state.pageKey,
          child: const ResultsScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutes.chatbot,
        pageBuilder: (context, state) => _slideTransition(
          key: state.pageKey,
          child: const ChatBotScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutes.profile,
        pageBuilder: (context, state) => _slideTransition(
          key: state.pageKey,
          child: const ProfileScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutes.settings,
        pageBuilder: (context, state) => _slideTransition(
          key: state.pageKey,
          child: const SettingsScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutes.notices,
        pageBuilder: (context, state) => _slideTransition(
          key: state.pageKey,
          child: const NoticesScreen(),
        ),
      ),
        ),
      ),
      GoRoute(
        path: AppRoutes.privacyPolicy,
        pageBuilder: (context, state) => _slideTransition(
          key: state.pageKey,
          child: const PrivacyPolicyScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutes.termsOfService,
        pageBuilder: (context, state) => _slideTransition(
          key: state.pageKey,
          child: const TermsOfServiceScreen(),
        ),
      ),
    ],
    );
  }
}
