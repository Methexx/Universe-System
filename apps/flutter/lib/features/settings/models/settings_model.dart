class UserSettingsModel {
  final String id;
  final String userId;
  final bool pushNotifications;
  final bool attendanceAlerts;
  final bool gateAlerts;
  final bool resultAlerts;

  UserSettingsModel({
    required this.id,
    required this.userId,
    required this.pushNotifications,
    required this.attendanceAlerts,
    required this.gateAlerts,
    required this.resultAlerts,
  });

  factory UserSettingsModel.fromJson(Map<String, dynamic> json) {
    return UserSettingsModel(
      id: (json['id'] ?? '').toString(),
      userId: (json['userId'] ?? json['user_id'] ?? '').toString(),
      pushNotifications: (json['pushNotifications'] ?? json['push_notifications'] ?? true) == true,
      attendanceAlerts: (json['attendanceAlerts'] ?? json['attendance_alerts'] ?? true) == true,
      gateAlerts: (json['gateAlerts'] ?? json['gate_alerts'] ?? true) == true,
      resultAlerts: (json['resultAlerts'] ?? json['result_alerts'] ?? true) == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'pushNotifications': pushNotifications,
      'attendanceAlerts': attendanceAlerts,
      'gateAlerts': gateAlerts,
      'resultAlerts': resultAlerts,
    };
  }

  UserSettingsModel copyWith({
    bool? pushNotifications,
    bool? attendanceAlerts,
    bool? gateAlerts,
    bool? resultAlerts,
  }) {
    return UserSettingsModel(
      id: id,
      userId: userId,
      pushNotifications: pushNotifications ?? this.pushNotifications,
      attendanceAlerts: attendanceAlerts ?? this.attendanceAlerts,
      gateAlerts: gateAlerts ?? this.gateAlerts,
      resultAlerts: resultAlerts ?? this.resultAlerts,
    );
  }
}
