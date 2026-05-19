import 'package:flutter_test/flutter_test.dart';
import 'package:universe_app/features/notifications/models/notification_model.dart';

void main() {
  test('NotificationModel.fromJson maps fields and derives view metadata', () {
    final NotificationModel n = NotificationModel.fromJson(<String, dynamic>{
      'id': 'n1',
      'type': 'gate',
      'title': 'Student Arrived',
      'body': 'Alex has entered the school.',
      'data': <String, dynamic>{'route': '/gate-status'},
      'is_read': false,
      'created_at': DateTime.now().toIso8601String(),
    });

    expect(n.id, 'n1');
    expect(n.isRead, isFalse);
    expect(n.route, '/gate-status');
    expect(n.category, 'Gate');

    expect(n.copyWith(isRead: true).isRead, isTrue);
  });
}
