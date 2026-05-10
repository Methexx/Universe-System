class UserModel {
  const UserModel({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
  });

  final String id;
  final String email;
  final String fullName;
  final String role;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final String parsedId = (json['id'] ?? json['userId'] ?? '').toString();
    return UserModel(
      id: parsedId,
      email: json['email'] as String? ?? '',
      fullName: json['full_name'] as String? ?? '',
      role: json['role'] as String? ?? 'student',
    );
  }
}
