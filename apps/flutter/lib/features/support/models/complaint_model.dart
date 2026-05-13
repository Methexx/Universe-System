class ComplaintModel {
  const ComplaintModel({
    required this.id,
    required this.parentId,
    this.studentId,
    required this.category,   // 'academic'|'teacher_conduct'|'facility'|'administrative'|'suggestion'|'other'
    required this.description,
    required this.status,     // 'pending'|'assigned'|'in_progress'|'resolved'|'rejected'
    this.assignedToId,
    this.assignedAt,
    this.replyNote,
    this.resolvedById,
    required this.createdAt,
    required this.updatedAt,
    this.parentFullName,
    this.studentFullName,
    this.assignedToFullName,
  });

  final String id;
  final String parentId;
  final String? studentId;
  final String category;
  final String description;
  final String status;
  final String? assignedToId;
  final DateTime? assignedAt;
  final String? replyNote;
  final String? resolvedById;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? parentFullName;
  final String? studentFullName;
  final String? assignedToFullName;

  bool get isSuggestion => category == 'suggestion';

  String get descriptionPreview =>
      description.length <= 80 ? description : '${description.substring(0, 80)}...';

  String get formattedDate {
    final d = createdAt.toLocal();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return '${months[d.month - 1]} ${d.day}, ${d.year}';
  }

  factory ComplaintModel.fromJson(Map<String, dynamic> json) => ComplaintModel(
    id: json['id'] as String,
    parentId: json['parent_id'] as String,
    studentId: json['student_id'] as String?,
    category: json['category'] as String,
    description: json['description'] as String,
    status: json['status'] as String? ?? 'pending',
    assignedToId: json['assigned_to_id'] as String?,
    assignedAt: json['assigned_at'] != null ? DateTime.parse(json['assigned_at'] as String) : null,
    replyNote: json['reply_note'] as String?,
    resolvedById: json['resolved_by_id'] as String?,
    createdAt: DateTime.parse(json['created_at'] as String),
    updatedAt: DateTime.parse(json['updated_at'] as String),
    parentFullName: (json['parent'] as Map<String, dynamic>?)?['full_name'] as String?,
    studentFullName: (json['student'] as Map<String, dynamic>?)?['full_name'] as String?,
    assignedToFullName: (json['assigned_to'] as Map<String, dynamic>?)?['full_name'] as String?,
  );
}
