import 'package:flutter/material.dart';

enum LFPostType { lost, found }

enum LFStatus { unclaimed, collected, open, recovered }

extension LFStatusExtension on LFStatus {
  String get label {
    switch (this) {
      case LFStatus.unclaimed:
        return 'Unclaimed';
      case LFStatus.collected:
        return 'Collected';
      case LFStatus.open:
        return 'Open';
      case LFStatus.recovered:
        return 'Recovered';
    }
  }

  Color get color {
    switch (this) {
      case LFStatus.unclaimed:
      case LFStatus.open:
        return const Color(0xFFE8845A);
      case LFStatus.collected:
      case LFStatus.recovered:
        return const Color(0xFF16A34A);
    }
  }
}

class LFCommentModel {
  final String authorName;
  final String role;
  final String classOrDept;
  final String text;
  final DateTime timeAgo;

  LFCommentModel({
    required this.authorName,
    required this.role,
    required this.classOrDept,
    required this.text,
    required this.timeAgo,
  });

  factory LFCommentModel.fromJson(Map<String, dynamic> json) {
    return LFCommentModel(
      authorName: json['authorName'],
      role: json['role'],
      classOrDept: json['classOrDept'],
      text: json['text'],
      timeAgo: DateTime.parse(json['timeAgo']),
    );
  }
}

class LFPostModel {
  final String id;
  final LFPostType type;
  final String title;
  final String description;
  final String location;
  final DateTime timeAgo;
  final LFStatus status;
  final String authorName;
  final String role;
  final String classOrDept;
  final String? photoUrl;
  final List<LFCommentModel> comments;

  LFPostModel({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.location,
    required this.timeAgo,
    required this.status,
    required this.authorName,
    required this.role,
    required this.classOrDept,
    this.photoUrl,
    required this.comments,
  });

  factory LFPostModel.fromJson(Map<String, dynamic> json) {
    return LFPostModel(
      id: json['id'],
      type: json['type'] == 'lost' ? LFPostType.lost : LFPostType.found,
      title: json['title'],
      description: json['description'] ?? '',
      location: json['location'] ?? 'Unknown',
      timeAgo: DateTime.parse(json['timeAgo']),
      status: _parseStatus(json['status']),
      authorName: json['authorName'],
      role: json['role'],
      classOrDept: json['classOrDept'],
      photoUrl: json['photo_url'],
      comments: (json['comments'] as List? ?? [])
          .map((c) => LFCommentModel.fromJson(c))
          .toList(),
    );
  }

  static LFStatus _parseStatus(String status) {
    switch (status) {
      case 'unclaimed':
        return LFStatus.unclaimed;
      case 'collected':
        return LFStatus.collected;
      case 'open':
        return LFStatus.open;
      case 'recovered':
        return LFStatus.recovered;
      default:
        return LFStatus.open;
    }
  }
}
