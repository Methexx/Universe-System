import 'dart:convert';

class StudentProfile {
  const StudentProfile({
    required this.id,
    required this.fullName,
    required this.studentIdNo,
    this.photoUrl,
    this.gender,
    this.admissionYear,
    this.grade,
    this.className,
  });

  final String id;
  final String fullName;
  final String studentIdNo;
  final String? photoUrl;
  final String? gender;
  final String? admissionYear;
  final String? grade;
  final String? className;

  factory StudentProfile.fromJson(Map<String, dynamic> json) {
    return StudentProfile(
      id: json['id'] as String? ?? '',
      fullName: json['full_name'] as String? ?? '',
      studentIdNo: json['student_id_no'] as String? ?? '',
      photoUrl: json['photo_url'] as String?,
      gender: json['gender'] as String?,
      admissionYear: json['admission_year'] as String?,
      grade: json['grade'] as String?,
      className: json['class_name'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'full_name': fullName,
        'student_id_no': studentIdNo,
        'photo_url': photoUrl,
        'gender': gender,
        'admission_year': admissionYear,
        'grade': grade,
        'class_name': className,
      };
}

class TeacherProfile {
  const TeacherProfile({
    this.fullName,
    this.email,
    this.phoneNumber,
  });

  final String? fullName;
  final String? email;
  final String? phoneNumber;

  factory TeacherProfile.fromJson(Map<String, dynamic> json) {
    return TeacherProfile(
      fullName: json['full_name'] as String?,
      email: json['email'] as String?,
      phoneNumber: json['phone_number'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'full_name': fullName,
        'email': email,
        'phone_number': phoneNumber,
      };
}

class ParentProfileModel {
  const ParentProfileModel({
    required this.id,
    required this.fullName,
    required this.email,
    this.phoneNumber,
    this.avatarUrl,
    this.userIdNo,
    this.student,
    this.teacher,
  });

  final String id;
  final String fullName;
  final String email;
  final String? phoneNumber;
  final String? avatarUrl;
  final String? userIdNo;
  final StudentProfile? student;
  final TeacherProfile? teacher;

  factory ParentProfileModel.fromJson(Map<String, dynamic> json) {
    final dynamic parentJson = json['parent'];
    final dynamic studentJson = json['student'];
    final dynamic teacherJson = json['teacher'];

    return ParentProfileModel(
      id: (parentJson as Map<String, dynamic>?)?['id'] as String? ?? '',
      fullName: (parentJson)?['full_name'] as String? ?? '',
      email: (parentJson)?['email'] as String? ?? '',
      phoneNumber: (parentJson)?['phone_number'] as String?,
      avatarUrl: (parentJson)?['avatar_url'] as String?,
      userIdNo: (parentJson)?['user_id_no'] as String?,
      student: studentJson is Map<String, dynamic>
          ? StudentProfile.fromJson(studentJson)
          : null,
      teacher: teacherJson is Map<String, dynamic>
          ? TeacherProfile.fromJson(teacherJson)
          : null,
    );
  }

  String toJsonString() => jsonEncode({
        'parent': {
          'id': id,
          'full_name': fullName,
          'email': email,
          'phone_number': phoneNumber,
          'avatar_url': avatarUrl,
          'user_id_no': userIdNo,
        },
        'student': student?.toJson(),
        'teacher': teacher?.toJson(),
      });

  static ParentProfileModel? fromJsonString(String jsonString) {
    try {
      final Map<String, dynamic> map =
          jsonDecode(jsonString) as Map<String, dynamic>;
      return ParentProfileModel.fromJson(map);
    } catch (_) {
      return null;
    }
  }
}
