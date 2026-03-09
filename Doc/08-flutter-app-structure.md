# 08 — Flutter App Structure

## Overview

The Flutter mobile app serves students exclusively and follows the MVVM (Model-View-ViewModel) architecture pattern. Feature-based folder structure ensures clean separation of concerns.

---

## Architecture: MVVM

```
Model      → Data classes, API response types
View       → UI screens and widgets
ViewModel  → Business logic, state management
Service    → API calls, external integrations
Repository → Data access layer (abstracts services)
```

---

## Full Folder Structure

```
universe-flutter/
├── lib/
│   ├── core/
│   │   ├── api/
│   │   │   ├── api_client.dart          ← HTTP client (Dio)
│   │   │   └── api_endpoints.dart       ← All endpoint constants
│   │   ├── constants/
│   │   │   ├── app_colors.dart          ← 5 theme colors
│   │   │   ├── app_strings.dart         ← All text strings
│   │   │   └── app_routes.dart          ← Route names
│   │   ├── storage/
│   │   │   ├── secure_storage.dart      ← JWT token storage
│   │   │   └── local_storage.dart       ← Theme, AI chat history
│   │   └── utils/
│   │       ├── validators.dart
│   │       └── helpers.dart
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── models/
│   │   │   │   └── user_model.dart
│   │   │   ├── views/
│   │   │   │   ├── login_screen.dart
│   │   │   │   ├── register_screen.dart
│   │   │   │   └── otp_screen.dart
│   │   │   ├── viewmodels/
│   │   │   │   └── auth_viewmodel.dart
│   │   │   ├── services/
│   │   │   │   └── auth_service.dart
│   │   │   └── repositories/
│   │   │       └── auth_repository.dart
│   │   │
│   │   ├── academic_profile/
│   │   │   ├── models/
│   │   │   │   └── academic_profile_model.dart
│   │   │   ├── views/
│   │   │   │   └── academic_setup_screen.dart
│   │   │   ├── viewmodels/
│   │   │   │   └── academic_viewmodel.dart
│   │   │   └── repositories/
│   │   │       └── academic_repository.dart
│   │   │
│   │   ├── dashboard/
│   │   │   ├── views/
│   │   │   │   └── dashboard_screen.dart
│   │   │   └── viewmodels/
│   │   │       └── dashboard_viewmodel.dart
│   │   │
│   │   ├── questions/
│   │   │   ├── models/
│   │   │   │   ├── question_model.dart
│   │   │   │   └── answer_model.dart
│   │   │   ├── views/
│   │   │   │   ├── questions_screen.dart
│   │   │   │   ├── ask_question_screen.dart
│   │   │   │   └── question_detail_screen.dart
│   │   │   ├── viewmodels/
│   │   │   │   └── questions_viewmodel.dart
│   │   │   └── repositories/
│   │   │       └── questions_repository.dart
│   │   │
│   │   ├── attendance/
│   │   │   ├── models/
│   │   │   │   └── attendance_model.dart
│   │   │   ├── views/
│   │   │   │   ├── attendance_screen.dart
│   │   │   │   ├── qr_scanner_screen.dart
│   │   │   │   └── attendance_history_screen.dart
│   │   │   ├── viewmodels/
│   │   │   │   └── attendance_viewmodel.dart
│   │   │   └── repositories/
│   │   │       └── attendance_repository.dart
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
│   │   │   │   ├── complaints_screen.dart
│   │   │   │   └── submit_complaint_screen.dart
│   │   │   ├── viewmodels/
│   │   │   │   └── complaints_viewmodel.dart
│   │   │   └── repositories/
│   │   │       └── complaints_repository.dart
│   │   │
│   │   ├── notifications/
│   │   │   ├── models/
│   │   │   │   └── notification_model.dart
│   │   │   ├── views/
│   │   │   │   └── notifications_screen.dart
│   │   │   └── viewmodels/
│   │   │       └── notifications_viewmodel.dart
│   │   │
│   │   ├── ai_chat/
│   │   │   ├── models/
│   │   │   │   └── chat_message_model.dart
│   │   │   ├── views/
│   │   │   │   └── ai_chat_screen.dart
│   │   │   ├── viewmodels/
│   │   │   │   └── ai_chat_viewmodel.dart
│   │   │   └── repositories/
│   │   │       └── ai_chat_repository.dart
│   │   │
│   │   ├── profile/
│   │   │   ├── views/
│   │   │   │   ├── profile_screen.dart
│   │   │   │   └── settings_screen.dart
│   │   │   └── viewmodels/
│   │   │       └── profile_viewmodel.dart
│   │   │
│   │   └── splash/
│   │       └── views/
│   │           └── splash_screen.dart
│   │
│   ├── shared/
│   │   ├── widgets/
│   │   │   ├── custom_button.dart
│   │   │   ├── custom_textfield.dart
│   │   │   ├── announcement_card.dart
│   │   │   ├── bottom_nav_bar.dart
│   │   │   └── loading_indicator.dart
│   │   └── themes/
│   │       ├── app_theme.dart           ← Base theme
│   │       └── theme_provider.dart      ← 5 color themes
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
Provider (recommended) or Riverpod

Each ViewModel extends ChangeNotifier:
    → Holds screen state
    → Calls repository methods
    → Notifies UI on change

View uses Consumer/watch to rebuild on state change
```

---

## Key Dependencies (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter

  # HTTP
  dio: ^5.0.0

  # State Management
  provider: ^6.0.0

  # Secure Storage
  flutter_secure_storage: ^9.0.0

  # Local Storage (themes, AI chat history)
  shared_preferences: ^2.0.0

  # Supabase Realtime
  supabase_flutter: ^2.0.0

  # Firebase Push Notifications
  firebase_core: ^2.0.0
  firebase_messaging: ^14.0.0

  # Biometric
  local_auth: ^2.0.0

  # QR Scanner
  mobile_scanner: ^3.0.0

  # Navigation
  go_router: ^12.0.0

  # UI
  cached_network_image: ^3.0.0
```

---

## Screen Navigation Flow

```
App Launch
    → Splash Screen
    → Check JWT in secure storage
        ↓
    Valid JWT → Role check
        student → Dashboard
        lecturer/admin → show error (wrong app)
        ↓
    No JWT → Login Screen
        ↓
    Login → OTP → Academic Setup → Dashboard

Dashboard Bottom Navigation:
    [Home] [Questions] [Attendance] [AI Chat] [Notifications] [Profile]
```

---

## Theme System

```dart
// 5 color options stored in SharedPreferences
enum AppTheme {
  purple,   // default
  blue,
  green,
  orange,
  pink,
}

// Only changes corner circle decoration components
// All other elements stay primary color
```

---

## Local AI Chat Storage

```dart
// Chat history stored in SharedPreferences
// Key: 'ai_chat_history'
// Value: JSON encoded list of messages
// Never sent to backend
// Cleared on logout
```

---

## Biometric Setup Flow

```dart
// In settings screen:
1. User toggles biometric switch
2. Verify current password first
3. If correct → enable biometric flag in SharedPreferences
4. On next app open → show biometric prompt
5. Uses local_auth package (fingerprint / face ID)
```
