import 'package:flutter/material.dart';

class AnnouncementAuthor {
  const AnnouncementAuthor({
    required this.fullName,
    required this.role,
    this.avatarUrl,
  });

  final String fullName;
  final String role;
  final String? avatarUrl;

  factory AnnouncementAuthor.fromJson(Map<String, dynamic> json) =>
      AnnouncementAuthor(
        fullName: json['full_name'] as String? ?? 'Unknown',
        role: json['role'] as String? ?? '',
        avatarUrl: json['avatar_url'] as String?,
      );
}

class AnnouncementModel {
  const AnnouncementModel({
    required this.id,
    required this.title,
    required this.content,
    this.imageUrl,
    required this.scope,
    required this.target,
    required this.createdAt,
    required this.author,
    this.className,
    this.classSubject,
  });

  final String id;
  final String title;
  final String content;
  final String? imageUrl;
  final String scope;
  final String target;
  final DateTime createdAt;
  final AnnouncementAuthor author;
  final String? className;
  final String? classSubject;

  List<Color> get gradientColors {
    if (scope == 'school_wide') {
      return const [Color(0xFF64C4E6), Color(0xFF3EA8D8)];
    }
    return const [Color(0xFFD4AAFF), Color(0xFF9067C6)];
  }

  IconData get icon {
    if (scope == 'school_wide') return Icons.campaign_rounded;
    return Icons.class_rounded;
  }

  String get scopeLabel {
    if (scope == 'school_wide') return 'School Wide';
    return 'Class';
  }

  String get formattedDate {
    final now = DateTime.now();
    final local = createdAt.toLocal();
    final difference = now.difference(local);
    final int hour = local.hour;
    final int minute = local.minute;
    final String period = hour >= 12 ? 'PM' : 'AM';
    final int displayHour = hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour);
    final String timeStr =
        '$displayHour:${minute.toString().padLeft(2, '0')} $period';

    if (difference.inDays == 0) return 'Today · $timeStr';
    if (difference.inDays == 1) return 'Yesterday · $timeStr';

    const List<String> months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${local.day} ${months[local.month - 1]} · $timeStr';
  }

  factory AnnouncementModel.fromJson(Map<String, dynamic> json) {
    final Map<String, dynamic>? classMap =
        json['class'] as Map<String, dynamic>?;
    return AnnouncementModel(
      id: json['id'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      imageUrl: json['image_url'] as String?,
      scope: json['scope'] as String? ?? 'school_wide',
      target: json['target'] as String? ?? 'all',
      createdAt: DateTime.parse(json['created_at'] as String),
      author: AnnouncementAuthor.fromJson(
          json['author'] as Map<String, dynamic>),
      className: classMap?['name'] as String?,
      classSubject: classMap?['subject'] as String?,
    );
  }
}
