class GateEventModel {
  const GateEventModel({
    required this.id,
    required this.direction,
    required this.method,
    required this.timestamp,
  });

  final String id;
  final String direction; // 'IN' | 'OUT'
  final String method;    // 'qr' | 'manual'
  final DateTime timestamp;

  bool get isIn => direction == 'IN';

  String get formattedDate {
    final d = timestamp.toLocal();
    return '${d.year}–${d.month.toString().padLeft(2, '0')}–${d.day.toString().padLeft(2, '0')}';
  }

  String get formattedTime {
    final d = timestamp.toLocal();
    final hour = d.hour % 12 == 0 ? 12 : d.hour % 12;
    final minute = d.minute.toString().padLeft(2, '0');
    final period = d.hour < 12 ? 'AM' : 'PM';
    return '${hour.toString().padLeft(2, '0')}:$minute $period';
  }

  factory GateEventModel.fromJson(Map<String, dynamic> json) {
    return GateEventModel(
      id: json['id'] as String,
      direction: json['direction'] as String,
      method: json['method'] as String? ?? 'qr',
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }
}

class GateStatusModel {
  const GateStatusModel({
    required this.isInsideSchool,
    required this.events,
    required this.hasMore,
    required this.total,
    required this.page,
  });

  final bool isInsideSchool;
  final List<GateEventModel> events;
  final bool hasMore;
  final int total;
  final int page;

  factory GateStatusModel.fromJson(Map<String, dynamic> json) {
    final pagination = json['pagination'] as Map<String, dynamic>? ?? {};
    final rawEvents = json['events'] as List<dynamic>? ?? [];

    return GateStatusModel(
      isInsideSchool: json['is_inside_school'] as bool? ?? false,
      events: rawEvents
          .map((e) => GateEventModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      hasMore: pagination['has_more'] as bool? ?? false,
      total: pagination['total'] as int? ?? 0,
      page: pagination['page'] as int? ?? 1,
    );
  }
}
