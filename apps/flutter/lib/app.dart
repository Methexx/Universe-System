import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:universe_app/core/constants/app_routes.dart';
import 'package:universe_app/core/constants/app_strings.dart';
import 'package:universe_app/core/navigation/app_router.dart';
import 'package:universe_app/core/services/firebase_service.dart';
import 'package:universe_app/features/auth/viewmodels/auth_viewmodel.dart';
import 'package:universe_app/features/gate/viewmodels/gate_viewmodel.dart';
import 'package:universe_app/features/messages/viewmodels/messages_viewmodel.dart';
import 'package:universe_app/features/profile/viewmodels/profile_viewmodel.dart';
import 'package:universe_app/features/attendance/viewmodels/attendance_viewmodel.dart';
import 'package:universe_app/features/results/viewmodels/results_viewmodel.dart';
import 'package:universe_app/features/support/viewmodels/support_viewmodel.dart';
import 'package:universe_app/features/notices/viewmodels/notices_viewmodel.dart';
import 'package:universe_app/features/settings/viewmodels/settings_viewmodel.dart';
import 'package:universe_app/features/lost_and_found/viewmodels/lost_found_viewmodel.dart';
import 'package:universe_app/features/notifications/viewmodels/notifications_viewmodel.dart';
import 'package:universe_app/shared/themes/app_theme.dart';

class UniverseApp extends StatefulWidget {
  const UniverseApp({
    super.key,
    required this.authViewModel,
    required this.messagesViewModel,
    required this.profileViewModel,
    required this.gateViewModel,
    required this.attendanceViewModel,
    required this.resultsViewModel,
    required this.supportViewModel,
    required this.noticesViewModel,
    required this.settingsViewModel,
    required this.lostFoundViewModel,
    required this.notificationsViewModel,
    required this.firebaseService,
  });

  final AuthViewModel authViewModel;
  final MessagesViewModel messagesViewModel;
  final ProfileViewModel profileViewModel;
  final GateViewModel gateViewModel;
  final AttendanceViewModel attendanceViewModel;
  final ResultsViewModel resultsViewModel;
  final SupportViewModel supportViewModel;
  final NoticesViewModel noticesViewModel;
  final SettingsViewModel settingsViewModel;
  final LostFoundViewModel lostFoundViewModel;
  final NotificationsViewModel notificationsViewModel;
  final FirebaseService firebaseService;

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
    _wireNotifications();
  }

  /// Connects FCM events to the notification viewmodel + router so the in-app
  /// list, unread badge, and deep links all stay live.
  void _wireNotifications() {
    // Foreground push → refresh the in-app list + badge.
    widget.firebaseService.onMessageReceived = (_) {
      widget.notificationsViewModel.refresh();
    };

    // Tapped push (background/terminated) → refresh + deep-link.
    widget.firebaseService.onNotificationTap = (message) async {
      await widget.notificationsViewModel.refresh();

      // Mark the tapped notification as read using the ID sent in the FCM payload.
      final notificationId = message.data['notificationId'];
      if (notificationId is String && notificationId.isNotEmpty) {
        widget.notificationsViewModel.markRead(notificationId);
      }

      final dynamic route = message.data['route'];
      if (route is String && route.isNotEmpty) {
        _router.go(route);
      } else {
        _router.go(AppRoutes.notifications);
      }
    };
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
        ChangeNotifierProvider<GateViewModel>.value(value: widget.gateViewModel),
        ChangeNotifierProvider<AttendanceViewModel>.value(value: widget.attendanceViewModel),
        ChangeNotifierProvider<ResultsViewModel>.value(value: widget.resultsViewModel),
        ChangeNotifierProvider<SupportViewModel>.value(value: widget.supportViewModel),
        ChangeNotifierProvider<NoticesViewModel>.value(value: widget.noticesViewModel),
        ChangeNotifierProvider<SettingsViewModel>.value(value: widget.settingsViewModel),
        ChangeNotifierProvider<LostFoundViewModel>.value(value: widget.lostFoundViewModel),
        ChangeNotifierProvider<NotificationsViewModel>.value(value: widget.notificationsViewModel),
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
