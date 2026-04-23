import 'package:flutter_test/flutter_test.dart';
import 'package:universe_app/app.dart';
import 'package:universe_app/core/di/service_locator.dart';

void main() {
  testWidgets('App boots and shows splash', (WidgetTester tester) async {
    ServiceLocator.instance.setup();

    await tester.pumpWidget(const UniverseApp());

    expect(find.text('UniVerse'), findsOneWidget);
  });
}
