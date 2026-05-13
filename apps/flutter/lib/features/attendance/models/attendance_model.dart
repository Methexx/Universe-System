class AttendanceResponseModel {
  final bool isInsideSchool;
  final List<AttendanceRecordModel> records;
  final AttendancePaginationModel pagination;

  AttendanceResponseModel({
    required this.isInsideSchool,
    required this.records,
    required this.pagination,
  });

  factory AttendanceResponseModel.fromJson(Map<String, dynamic> json) {
    return AttendanceResponseModel(
      isInsideSchool: json['isInsideSchool'] ?? false,
      records: (json['records'] as List<dynamic>?)
              ?.map((e) => AttendanceRecordModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      pagination: AttendancePaginationModel.fromJson(json['pagination'] as Map<String, dynamic>),
    );
  }
}

class AttendanceRecordModel {
  final String id;
  final String studentId;
  final String date;
  final String status;
  final String? remarks;
  final bool gateIn;

  AttendanceRecordModel({
    required this.id,
    required this.studentId,
    required this.date,
    required this.status,
    this.remarks,
    required this.gateIn,
  });

  factory AttendanceRecordModel.fromJson(Map<String, dynamic> json) {
    return AttendanceRecordModel(
      id: json['id'] as String,
      studentId: json['student_id'] as String,
      date: json['date'] as String,
      status: json['status'] as String,
      remarks: json['remarks'] as String?,
      gateIn: json['gateIn'] ?? false,
    );
  }

  bool get isPresent => status == 'present';
}

class AttendancePaginationModel {
  final int page;
  final int limit;
  final int total;
  final bool hasMore;

  AttendancePaginationModel({
    required this.page,
    required this.limit,
    required this.total,
    required this.hasMore,
  });

  factory AttendancePaginationModel.fromJson(Map<String, dynamic> json) {
    return AttendancePaginationModel(
      page: json['page'] as int,
      limit: json['limit'] as int,
      total: json['total'] as int,
      hasMore: json['hasMore'] ?? false,
    );
  }
}
