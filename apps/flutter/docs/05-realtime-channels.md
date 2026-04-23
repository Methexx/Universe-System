# 05 — Realtime Channels

> School Connect — Supabase Realtime + Firebase FCM Strategy

---

## Two-Layer Notification Strategy

```
App Open (Foreground):
    → Supabase Realtime
    → Instant UI updates without refresh

App Closed / Background:
    → Firebase FCM
    → Push notification to device

Both fire for every event — no either/or logic.
Realtime updates the UI. FCM reaches the user when they are away.
```

---

## Firebase FCM Push Notification Triggers

| Event | Fired By | Receiver | Data Payload |
|-------|----------|----------|-------------|
| Student scanned IN at gate | gate.service | Linked parent | type: gate_in, direction: IN |
| Student scanned OUT at gate | gate.service | Linked parent | type: gate_out, direction: OUT |
| Student marked absent | attendance.service | Linked parent | type: absent, subject |
| Teacher sends message | messages.service | Parent or teacher | type: message, thread_id |
| New class announcement | announcements.service | Class parents | type: announcement |
| New school-wide announcement | announcements.service | All parents / all staff (by target) | type: announcement |
| Grade published | grades.service | Linked parent | type: grade_published, term |
| Complaint assigned to teacher | complaints.service | Assigned teacher | type: complaint_assigned |
| New found item posted | lost-found.service | Parents with open reports | type: lost_found_item |
| AI absence alert (3+ days) | cron job / attendance.service | Admin | type: absence_alert |

---

## FCM Token Management

```
Parent FCM token:
    Flutter app on login or app open:
        → firebase_messaging.getToken()
        → POST /api/auth/fcm-token  { token: "xxx" }
        → Backend: UPDATE users SET fcm_token = ? WHERE id = ?

Teacher FCM token:
    Next.js dashboard uses web push (browser notifications)
    → Stored same way in users.fcm_token

On token refresh:
    → firebase_messaging.onTokenRefresh → send new token to backend
```

---

## Supabase Realtime Channels

### Channel: gate_events (Security guard — gate page)
```
Purpose    : Live gate log updates on the security guard's screen
Table      : gate_events
Event      : INSERT
Filter     : scanned_at::date = today
Subscribed : When security guard has gate page open

On INSERT:
  → New student row added to today's live gate log on screen
  → Entry counter updated (IN count / OUT count)
```

### Channel: notifications:{userId} (All roles — Flutter + Next.js)
```
Purpose    : Receive new notifications in real time
Table      : notifications
Event      : INSERT
Filter     : user_id = eq.{current_user_id}
Subscribed : When user opens app / dashboard

On INSERT:
  → Update notification bell badge count
  → Append notification to panel list
  → Show in-app toast (optional)
```

### Channel: gate_log (Admin — gate oversight page)
```
Purpose    : Admin's gate log page updates live
Table      : gate_events
Event      : INSERT
Filter     : none (all today's events)
Subscribed : When admin has gate log page open

On INSERT:
  → Add new row to gate log table
  → Update today's count stats
```

### Channel: attendance:{sessionId} (Teacher — while session is open)
```
Purpose    : Teacher sees excuse notes submitted by parents in real time
Table      : attendance_records
Event      : UPDATE
Filter     : session_id = eq.{sessionId}
Subscribed : When teacher has today's attendance session open

On UPDATE:
  → If excuse_note was added → highlight that student row
  → Show "Excuse note received" indicator
```

---

## FCM Notification Payload Structure

```json
{
  "notification": {
    "title": "Amal entered school",
    "body": "Amal entered school at 7:42 AM"
  },
  "data": {
    "type": "gate_in",
    "student_id": "uuid",
    "student_name": "Amal Bandara",
    "direction": "IN",
    "timestamp": "2026-03-20T07:42:00Z",
    "navigate_to": "gate_log"
  },
  "android": { "priority": "high" },
  "apns": { "payload": { "aps": { "sound": "default" } } }
}
```

## Navigate-To Values (Flutter tap-to-navigate)

| Notification Type | navigate_to Value | Screen Opened |
|-------------------|-------------------|---------------|
| gate_in | gate_log | Gate log screen |
| gate_out | gate_log | Gate log screen |
| absent | attendance_history | Attendance history screen |
| message | message_thread | Specific message thread |
| announcement | announcement_detail | Announcement detail |
| grade_published | grades | Grades screen |
| complaint_assigned | complaints | Complaints list (teacher) |
| lost_found_item | lost_found | Lost & found board |

---

## Realtime Implementation — Next.js (Gate page)

```typescript
// Subscribe to today's gate events on the gate page
const channel = supabase
  .channel('gate_events_today')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'gate_events',
    filter: `scanned_at=gte.${todayStart}`
  }, (payload) => {
    setGateLog(prev => [payload.new, ...prev])
    updateCounts(payload.new.direction)
  })
  .subscribe()

// Cleanup on unmount
return () => supabase.removeChannel(channel)
```

---

## Realtime Implementation — Flutter (Parent notifications)

```dart
// Subscribe to personal notifications channel
final channel = supabase
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
      // Update notification badge count
      ref.read(notificationCountProvider.notifier).increment();
      // Add to notification list
      ref.read(notificationsProvider.notifier).add(payload.newRecord);
    },
  )
  .subscribe();
```

---

## AI Absence Pattern Alert (Automated)

```
Not a real-time channel — runs as a scheduled check.

Trigger:
    Every time attendance is submitted for a class
    → attendance.service checks for consecutive absences:
    
    SELECT student_id, COUNT(*) as consecutive_absences
    FROM attendance_records
    WHERE student_id = ?
      AND status = 'absent'
      AND created_at >= NOW() - INTERVAL '14 days'
    ORDER BY created_at DESC
    
    → If 3 or more consecutive absences:
        INSERT into notifications (admin)
        type: 'absence_alert'
        title: 'Absence alert — Amal Bandara'
        body: 'Amal has been absent for 3 consecutive days (Grade 8A)'

Admin sees alert on dashboard via Supabase Realtime or on next visit.
```
