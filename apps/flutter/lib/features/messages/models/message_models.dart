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
  });

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
    );
  }
}

class MessageUser {
  final String? fullName;
  final String role;
  final String? avatarUrl;

  MessageUser({this.fullName, required this.role, this.avatarUrl});

  factory MessageUser.fromJson(Map<String, dynamic> json) {
    return MessageUser(
      fullName: json['full_name'],
      role: json['role'] ?? '',
      avatarUrl: json['avatar_url'],
    );
  }
}

class MessageStudent {
  final String? fullName;

  MessageStudent({this.fullName});

  factory MessageStudent.fromJson(Map<String, dynamic> json) {
    return MessageStudent(
      fullName: json['full_name'],
    );
  }
}

class ContactModel {
  final String id;
  final String? fullName;
  final String role;
  final String? avatarUrl;
  final String? studentName;
  final String? className;

  ContactModel({
    required this.id,
    this.fullName,
    required this.role,
    this.avatarUrl,
    this.studentName,
    this.className,
  });

  factory ContactModel.fromJson(Map<String, dynamic> json) {
    return ContactModel(
      id: json['id'],
      fullName: json['full_name'],
      role: json['role'] ?? '',
      avatarUrl: json['avatar_url'],
      studentName: json['student_name'],
      className: json['class_name'],
    );
  }
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
}
