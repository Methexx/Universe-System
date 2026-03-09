# 05 — Realtime Channels

## Overview

Universe uses Supabase Realtime for live in-app updates when the app is open, and Firebase FCM for push notifications when the app is in background or closed.

---

## Two-Layer Notification Strategy

```
App Open (Foreground):
    → Supabase Realtime
    → Instant UI updates without refresh

App Closed / Background:
    → Firebase FCM
    → Push notification to device
```

---

## Supabase Realtime Channels

### Channel 1: notifications:{userId}
```
Purpose   : Receive new notifications in real-time
Subscribes: When user opens app
Listens   : INSERT on notifications table WHERE user_id = current user

On event:
    → Update notification badge count
    → Add notification to panel list
    → Show in-app toast/banner
```

### Channel 2: questions:{moduleId}
```
Purpose   : Live updates on question answers
Subscribes: When student is on questions screen
Listens   : INSERT on lecturer_answers WHERE question module matches

On event:
    → Update question card with new answer
    → Show answer without page refresh
```

### Channel 3: announcements
```
Purpose   : Live announcement updates on dashboard
Subscribes: When user is on dashboard
Listens   : INSERT on announcements WHERE relevant to user

On event:
    → Add new card to sliding announcements
    → Update announcements list
```

### Channel 4: attendance:{sessionId}
```
Purpose   : Lecturer sees live attendance as students scan
Subscribes: When lecturer is viewing active session
Listens   : INSERT on attendance_records WHERE session_id matches

On event:
    → Update attendance count live
    → Add student name to present list
```

---

## Firebase FCM Push Notifications

### Trigger Points

| Event | Sender | Receiver | FCM Topic/Token |
|-------|--------|----------|-----------------|
| Lecturer answers question | Backend | That student | Student FCM token |
| New university announcement | Backend | All students | Topic: all_students |
| New module announcement | Backend | Module students | Topic: module_{id} |
| Admin sends to lecturers | Backend | All lecturers | Topic: all_lecturers |
| Lecturer sends to module | Backend | Module students | Topic: module_{id} |
| Complaint assigned | Backend | That lecturer | Lecturer FCM token |
| Academic change approved/rejected | Backend | That student | Student FCM token |
| Attendance session created | Backend | Module students | Topic: module_{id} |
| Account expiry warning | Backend | That student | Student FCM token |

---

## FCM Token Management

```
Flutter app on login:
    → Get FCM token from firebase_messaging
    → Send token to backend → POST /api/users/fcm-token
    → Backend saves to users table

Backend sends notification:
    → Retrieve FCM token from DB
    → Send via firebase-admin
    → Handle delivery errors
```

### users table FCM column
```sql
ALTER TABLE users ADD COLUMN fcm_token TEXT;
```

---

## FCM Topic Subscriptions

```
When student enrolled in module:
    → Subscribe to topic: module_{moduleId}

When lecturer assigned to module:
    → Subscribe to topic: module_{moduleId}

All students auto-subscribed to:
    → Topic: all_students

All lecturers auto-subscribed to:
    → Topic: all_lecturers
```

---

## Notification Payload Structure

```json
{
  "notification": {
    "title": "New Answer Available",
    "body": "Your question about polymorphism has been answered"
  },
  "data": {
    "type": "question_answered",
    "reference_id": "question_uuid",
    "navigate_to": "question_detail"
  }
}
```

## Navigation on Tap

| Notification Type | Navigate To |
|-------------------|-------------|
| question_answered | Question detail screen |
| announcement | Announcement detail screen |
| academic_change | Profile view screen |
| attendance_created | Attendance screen |
| complaint_assigned | Complaints screen (lecturer) |

---

## Realtime Implementation (Flutter)

```dart
// Subscribe to personal notifications channel
supabase
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
      // Update UI
    },
  )
  .subscribe();
```

## Realtime Implementation (Next.js)

```typescript
// Subscribe to attendance updates for lecturer
const channel = supabase
  .channel(`attendance:${sessionId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'attendance_records',
    filter: `session_id=eq.${sessionId}`
  }, (payload) => {
    // Update attendance list live
  })
  .subscribe()
```
