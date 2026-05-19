import 'package:flutter/material.dart';

/// Visual styling for a notification type (icon, category label, gradient).
class _NotifMeta {
  const _NotifMeta(this.category, this.icon, this.colors);
  final String category;
  final IconData icon;
  final List<Color> colors;
}

const Map<String, _NotifMeta> _kMeta = {
  'gate': _NotifMeta('Gate', Icons.sensor_door_rounded,
      [Color(0xFF77C8A8), Color(0xFF3DAA82)]),
  'message': _NotifMeta('Message', Icons.chat_bubble_rounded,
      [Color(0xFF8CB2FF), Color(0xFF5B82F0)]),
  'announcement': _NotifMeta('Announcement', Icons.campaign_rounded,
      [Color(0xFFD4AAFF), Color(0xFF9067C6)]),
  'attendance': _NotifMeta('Attendance', Icons.event_available_rounded,
      [Color(0xFF64C4E6), Color(0xFF3EA8D8)]),
  'result': _NotifMeta('Result', Icons.bar_chart_rounded,
      [Color(0xFF80E8B8), Color(0xFF2EAA75)]),
};

const _NotifMeta _kFallbackMeta = _NotifMeta('Update',
    Icons.notifications_rounded, [Color(0xFFFFB38A), Color(0xFFE8845A)]);

/// A single in-app notification, as returned by `GET /api/notifications`.
class NotificationModel {
  NotificationModel({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    required this.data,
    required this.isRead,
    required this.createdAt,
  });

  final String id;
  final String type;
  final String title;
  final String body;
  final Map<String, dynamic> data;
  final bool isRead;
  final DateTime createdAt;

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] as String? ?? '',
      type: json['type'] as String? ?? 'update',
      title: json['title'] as String? ?? '',
      body: json['body'] as String? ?? '',
      data: (json['data'] as Map?)?.cast<String, dynamic>() ?? const {},
      isRead: json['is_read'] as bool? ?? false,
      createdAt:
          DateTime.tryParse(json['created_at'] as String? ?? '')?.toLocal() ??
              DateTime.now(),
    );
  }

  NotificationModel copyWith({bool? isRead}) => NotificationModel(
        id: id,
        type: type,
        title: title,
        body: body,
        data: data,
        isRead: isRead ?? this.isRead,
        createdAt: createdAt,
      );

  _NotifMeta get _meta => _kMeta[type] ?? _kFallbackMeta;

  String get category => _meta.category;
  IconData get icon => _meta.icon;
  List<Color> get gradientColors => _meta.colors;

  /// Deep-link route carried in the payload (e.g. '/gate-status'), if any.
  String? get route {
    final dynamic r = data['route'];
    return r is String && r.isNotEmpty ? r : null;
  }

  /// Human-friendly relative time, e.g. "5 min ago".
  String get time {
    final Duration diff = DateTime.now().difference(createdAt);
    if (diff.inSeconds < 60) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes} min ago';
    if (diff.inHours < 24) {
      return '${diff.inHours} h ago';
    }
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays} days ago';
    return '${createdAt.day}/${createdAt.month}/${createdAt.year}';
  }
}
