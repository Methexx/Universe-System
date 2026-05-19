import 'dart:convert';

class MessageModel {
  final String id;
  final String senderId;
  final String receiverId;
  final String? studentId;
  final String content;
  final bool isRead;
  final DateTime createdAt;
  final MessageUser sender;
  final MessageUser receiver;
  final MessageStudent? student;
  final bool isPending;

  MessageModel({
    required this.id,
    required this.senderId,
    required this.receiverId,
    this.studentId,
    required this.content,
    required this.isRead,
    required this.createdAt,
    required this.sender,
    required this.receiver,
    this.student,
    this.isPending = false,
  });

  MessageModel copyWith({
    String? id,
    String? senderId,
    String? receiverId,
    String? studentId,
    String? content,
    bool? isRead,
    DateTime? createdAt,
    MessageUser? sender,
    MessageUser? receiver,
    MessageStudent? student,
    bool? isPending,
  }) {
    return MessageModel(
      id: id ?? this.id,
      senderId: senderId ?? this.senderId,
      receiverId: receiverId ?? this.receiverId,
      studentId: studentId ?? this.studentId,
      content: content ?? this.content,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt ?? this.createdAt,
      sender: sender ?? this.sender,
      receiver: receiver ?? this.receiver,
      student: student ?? this.student,
      isPending: isPending ?? this.isPending,
    );
  }

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    return MessageModel(
      id: json['id'],
      senderId: json['sender_id'],
      receiverId: json['receiver_id'],
      studentId: json['student_id'],
      content: json['content'],
      isRead: json['is_read'] ?? false,
      createdAt: DateTime.parse(json['created_at']),
      sender: MessageUser.fromJson(json['sender']),
      receiver: MessageUser.fromJson(json['receiver']),
      student: json['student'] != null ? MessageStudent.fromJson(json['student']) : null,
      isPending: false, // Do not read from JSON so cached threads don't persist it
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'sender_id': senderId,
        'receiver_id': receiverId,
        'student_id': studentId,
        'content': content,
        'is_read': isRead,
        'created_at': createdAt.toIso8601String(),
        'sender': sender.toJson(),
        'receiver': receiver.toJson(),
        if (student != null) 'student': student!.toJson(),
        // isPending is intentionally omitted from toJson so it's not cached
      };

  static List<MessageModel> listFromJsonString(String jsonString) {
    final List decoded = jsonDecode(jsonString) as List;
    return decoded.map((e) => MessageModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  static String listToJsonString(List<MessageModel> messages) {
    return jsonEncode(messages.map((m) => m.toJson()).toList());
  }
}

class MessageUser {
  final String id;
  final String? fullName;
  final String role;
  final String? avatarUrl;

  MessageUser({required this.id, this.fullName, required this.role, this.avatarUrl});

  factory MessageUser.fromJson(Map<String, dynamic> json) {
    return MessageUser(
      id: json['id'] ?? '',
      fullName: json['full_name'],
      role: json['role'] ?? '',
      avatarUrl: json['avatar_url'],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'full_name': fullName,
        'role': role,
        'avatar_url': avatarUrl,
      };
}

class MessageStudent {
  final String? fullName;

  MessageStudent({this.fullName});

  factory MessageStudent.fromJson(Map<String, dynamic> json) {
    return MessageStudent(fullName: json['full_name']);
  }

  Map<String, dynamic> toJson() => {'full_name': fullName};
}

class ContactModel {
  final String id;
  final String? fullName;
  final String role;
  final String? avatarUrl;
  final String? studentName;
  final String? className;
  final String? studentId;

  ContactModel({
    required this.id,
    this.fullName,
    required this.role,
    this.avatarUrl,
    this.studentName,
    this.className,
    this.studentId,
  });

  factory ContactModel.fromJson(Map<String, dynamic> json) {
    return ContactModel(
      id: json['id'],
      fullName: json['full_name'],
      role: json['role'] ?? '',
      avatarUrl: json['avatar_url'],
      studentName: json['student_name'],
      className: json['class_name'],
      studentId: json['student_id'],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'full_name': fullName,
        'role': role,
        'avatar_url': avatarUrl,
        'student_name': studentName,
        'class_name': className,
        'student_id': studentId,
      };
}

class ThreadModel {
  final ThreadUser user;
  final MessageModel lastMessage;
  final int unreadCount;

  ThreadModel({
    required this.user,
    required this.lastMessage,
    required this.unreadCount,
  });

  factory ThreadModel.fromJson(Map<String, dynamic> json) {
    return ThreadModel(
      user: ThreadUser.fromJson(json['user']),
      lastMessage: MessageModel.fromJson(json['lastMessage']),
      unreadCount: json['unreadCount'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'user': user.toJson(),
        'lastMessage': lastMessage.toJson(),
        'unreadCount': unreadCount,
      };

  static List<ThreadModel> listFromJsonString(String jsonString) {
    final List decoded = jsonDecode(jsonString) as List;
    return decoded.map((e) => ThreadModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  static String listToJsonString(List<ThreadModel> threads) {
    return jsonEncode(threads.map((t) => t.toJson()).toList());
  }
}

class ThreadUser {
  final String id;
  final String? fullName;
  final String role;
  final String? avatarUrl;

  ThreadUser({
    required this.id,
    this.fullName,
    required this.role,
    this.avatarUrl,
  });

  factory ThreadUser.fromJson(Map<String, dynamic> json) {
    return ThreadUser(
      id: json['id'],
      fullName: json['full_name'],
      role: json['role'] ?? '',
      avatarUrl: json['avatar_url'],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'full_name': fullName,
        'role': role,
        'avatar_url': avatarUrl,
      };
}
