# 08 — Flutter App Structure

> School Connect — Parent Flutter Mobile App (iOS & Android)
> Architecture: MVVM (Model-View-ViewModel)

---

## Architecture: MVVM

```
Model       → Data classes, API response types
View        → UI screens and widgets (StatelessWidget / ConsumerWidget)
ViewModel   → Business logic, state management (ChangeNotifier / Riverpod)
Service     → API calls, external integrations (Dio HTTP client)
Repository  → Data access layer (abstracts service calls)
```

---

## Full Folder Structure

```
school-connect-flutter/
├── lib/
│   ├── core/
│   │   ├── api/
│   │   │   ├── api_client.dart           ← Dio HTTP client + interceptors
│   │   │   └── api_endpoints.dart        ← All API endpoint constants
│   │   ├── constants/
│   │   │   ├── app_colors.dart           ← 5 theme color palettes
│   │   │   ├── app_strings.dart          ← All UI text strings
│   │   │   └── app_routes.dart           ← Route name constants
│   │   ├── storage/
│   │   │   ├── secure_storage.dart       ← JWT token (flutter_secure_storage)
│   │   │   └── local_storage.dart        ← Theme, biometric flag (SharedPreferences)
│   │   ├── services/
│   │   │   ├── fcm_service.dart          ← Firebase FCM token + foreground handler
│   │   │   └── supabase_realtime.dart    ← Realtime channel subscriptions
│   │   └── utils/
│   │       ├── date_helpers.dart
│   │       ├── validators.dart
│   │       └── grade_helpers.dart        ← Letter grade display colours
│   │
│   ├── features/
│   │   │
│   │   ├── auth/
│   │   │   ├── models/
│   │   │   │   └── user_model.dart
│   │   │   ├── views/
│   │   │   │   ├── splash_screen.dart
│   │   │   │   ├── login_screen.dart
│   │   │   │   ├── register_screen.dart
│   │   │   │   ├── otp_screen.dart
│   │   │   │   ├── link_child_screen.dart      ← Enter Student ID
│   │   │   │   └── confirm_child_screen.dart   ← "Is this your child?"
│   │   │   ├── viewmodels/
│   │   │   │   └── auth_viewmodel.dart
│   │   │   └── repositories/
│   │   │       └── auth_repository.dart
│   │   │
│   │   ├── home/
│   │   │   ├── views/
│   │   │   │   ├── home_screen.dart             ← Announcements feed + quick stats
│   │   │   │   └── child_switcher_widget.dart   ← Multi-child header switcher
│   │   │   └── viewmodels/
│   │   │       └── home_viewmodel.dart
│   │   │
│   │   ├── gate/
│   │   │   ├── models/
│   │   │   │   └── gate_event_model.dart
│   │   │   ├── views/
│   │   │   │   └── gate_log_screen.dart         ← IN/OUT history per day
│   │   │   └── viewmodels/
│   │   │       └── gate_viewmodel.dart
│   │   │
│   │   ├── attendance/
│   │   │   ├── models/
│   │   │   │   └── attendance_model.dart
│   │   │   ├── views/
│   │   │   │   ├── attendance_screen.dart        ← History + summary
│   │   │   │   └── excuse_note_screen.dart       ← Submit excuse for absence
│   │   │   └── viewmodels/
│   │   │       └── attendance_viewmodel.dart
│   │   │
│   │   ├── messages/
│   │   │   ├── models/
│   │   │   │   └── message_model.dart
│   │   │   ├── views/
│   │   │   │   ├── messages_screen.dart          ← Inbox / thread list
│   │   │   │   └── message_thread_screen.dart    ← Individual thread
│   │   │   └── viewmodels/
│   │   │       └── messages_viewmodel.dart
│   │   │
│   │   ├── ai_bot/
│   │   │   ├── models/
│   │   │   │   └── rag_message_model.dart
│   │   │   ├── views/
│   │   │   │   ├── ai_bot_screen.dart            ← Chat with policy bot
│   │   │   │   └── public_qa_screen.dart         ← Browse past Q&A
│   │   │   └── viewmodels/
│   │   │       └── ai_bot_viewmodel.dart
│   │   │
│   │   ├── announcements/
│   │   │   ├── models/
│   │   │   │   └── announcement_model.dart
│   │   │   ├── views/
│   │   │   │   └── announcement_detail_screen.dart
│   │   │   └── viewmodels/
│   │   │       └── announcements_viewmodel.dart
│   │   │
│   │   ├── complaints/
│   │   │   ├── models/
│   │   │   │   └── complaint_model.dart
│   │   │   ├── views/
│   │   │   │   ├── complaints_screen.dart        ← My complaints list
│   │   │   │   ├── submit_complaint_screen.dart  ← New complaint form
│   │   │   │   └── complaint_detail_screen.dart  ← Detail + status trail
│   │   │   └── viewmodels/
│   │   │       └── complaints_viewmodel.dart
│   │   │
│   │   ├── lost_found/
│   │   │   ├── models/
│   │   │   │   └── lost_found_model.dart
│   │   │   ├── views/
│   │   │   │   ├── lost_found_screen.dart        ← Board + my reports tabs
│   │   │   │   └── report_lost_screen.dart       ← Submit lost item report
│   │   │   └── viewmodels/
│   │   │       └── lost_found_viewmodel.dart
│   │   │
│   │   ├── notifications/
│   │   │   ├── models/
│   │   │   │   └── notification_model.dart
│   │   │   ├── views/
│   │   │   │   └── notifications_screen.dart     ← Full notification panel
│   │   │   └── viewmodels/
│   │   │       └── notifications_viewmodel.dart
│   │   │
│   │   └── profile/
│   │       ├── models/
│   │       │   └── profile_model.dart
│   │       ├── views/
│   │       │   ├── profile_screen.dart           ← Main profile page
│   │       │   ├── edit_profile_screen.dart      ← Edit name / avatar
│   │       │   ├── change_password_screen.dart
│   │       │   ├── add_child_screen.dart         ← Link another child
│   │       │   └── settings_screen.dart          ← Theme, biometric, notifications
│   │       └── viewmodels/
│   │           └── profile_viewmodel.dart
│   │
│   ├── shared/
│   │   ├── widgets/
│   │   │   ├── custom_button.dart
│   │   │   ├── custom_text_field.dart
│   │   │   ├── bottom_nav_bar.dart           ← 5-tab bottom navigation
│   │   │   ├── child_switcher.dart           ← Header child selector
│   │   │   ├── notification_badge.dart       ← Bell icon + unread count
│   │   │   ├── announcement_card.dart
│   │   │   ├── gate_event_tile.dart
│   │   │   ├── attendance_tile.dart
│   │   │   ├── grade_chip.dart               ← A/B/C/D/F with colour
│   │   │   └── loading_indicator.dart
│   │   └── themes/
│   │       ├── app_theme.dart                ← Base theme definition
│   │       └── theme_provider.dart           ← 5 colour themes
│   │
│   └── main.dart
│
├── assets/
│   ├── images/
│   └── icons/
├── test/
└── pubspec.yaml
```

---

## State Management

```
Provider (ChangeNotifier pattern)

Each ViewModel extends ChangeNotifier:
  → Holds screen state (loading, data, error)
  → Calls repository methods
  → Calls notifyListeners() to rebuild UI
  → Handles FCM deep-link navigation

View uses Consumer<ViewModel> or context.watch<ViewModel>()
to rebuild on state changes.
```

---

## Screen Navigation Flow

```
App Launch
    ↓
SplashScreen
    → Check JWT in flutter_secure_storage
    → POST /api/auth/refresh to validate
        ↓
    Valid JWT → Check is_parent_linked
        Linked     → HomeScreen (Main dashboard)
        Not linked → LinkChildScreen
        ↓
    No JWT / Expired → LoginScreen
        ↓
LoginScreen → RegisterScreen → OtpScreen
    → LinkChildScreen → ConfirmChildScreen → OtpScreen (email)
    → HomeScreen

Main App (after login):
    BottomNavigationBar (5 tabs):
        [Home] [Attendance] [Messages] [Complaints] [Profile]

    Child Switcher (shown if > 1 child linked):
        → Header widget on all main screens
        → Tap → BottomSheet with child list
        → Select → all screens update to show selected child's data
```

---

## Bottom Navigation Tabs

| Tab | Icon | Screen | Description |
|-----|------|--------|-------------|
| Home | 🏠 | HomeScreen | Announcement feed, quick stats |
| Attendance | 📋 | AttendanceScreen | History, summary, excuse notes |
| Messages | 💬 | MessagesScreen | Teacher threads |
| Complaints | 📝 | ComplaintsScreen | Submit + track |
| Profile | 👤 | ProfileScreen | Settings, children, grades, timetable |

> Lost & Found and AI Bot accessible from Home screen shortcuts / Profile menu.
> Notifications panel accessible from bell icon in app header.

---

## Theme System

```dart
// 5 colour themes stored in SharedPreferences
enum AppThemeColor {
  purple,   // default
  blue,
  green,
  orange,
  pink,
}

// ThemeProvider (ChangeNotifier)
// Reads from SharedPreferences on init
// Notifies all widgets on theme change
// Applied via MaterialApp theme parameter
```

---

## Key Dependencies (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter

  # HTTP client
  dio: ^5.4.0

  # State Management
  provider: ^6.1.0

  # Secure token storage
  flutter_secure_storage: ^9.2.0

  # Local preferences (theme, biometric flag)
  shared_preferences: ^2.2.0

  # Supabase (Realtime subscriptions)
  supabase_flutter: ^2.3.0

  # Firebase push notifications
  firebase_core: ^2.27.0
  firebase_messaging: ^14.7.0

  # Biometric login
  local_auth: ^2.2.0

  # Navigation
  go_router: ^13.0.0

  # Image loading + caching
  cached_network_image: ^3.3.0

  # Date formatting
  intl: ^0.19.0
```

---

## FCM Foreground + Background Handling

```dart
// main.dart
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  await Supabase.initialize(url: ..., anonKey: ...);

  // Handle background/terminated FCM
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  runApp(const SchoolConnectApp());
}

// Background handler (top-level function)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // System handles showing the notification
  // No UI update needed here
}

// Foreground handler (in FCMService)
FirebaseMessaging.onMessage.listen((RemoteMessage message) {
  // Show in-app banner or update badge count
  notificationProvider.add(message.data);
});

// Tap handler (app opened from notification)
FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
  final navigateTo = message.data['navigate_to'];
  router.push('/$navigateTo');
});
```

---

## Supabase Realtime Subscription (Parent notifications)

```dart
// In NotificationsViewModel
void subscribeToNotifications(String userId) {
  _channel = supabase
    .channel('notifications:$userId')
    .onPostgresChanges(
      event: PostgresChangeEvent.insert,
      schema: 'public',
      table: 'notifications',
      filter: PostgresChangeFilter(
        type: FilterType.eq,
        column: 'user_id',
        value: userId,
      ),
      callback: (payload) {
        _unreadCount++;
        _notifications.insert(0, NotificationModel.fromJson(payload.newRecord));
        notifyListeners();
      },
    )
    .subscribe();
}

@override
void dispose() {
  supabase.removeChannel(_channel);
  super.dispose();
}

