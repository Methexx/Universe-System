import 'package:flutter_test/flutter_test.dart';
import 'package:universe_app/app.dart';
import 'package:universe_app/core/di/service_locator.dart';
import 'package:universe_app/features/auth/viewmodels/auth_viewmodel.dart';
import 'package:universe_app/features/messages/viewmodels/messages_viewmodel.dart';
import 'package:universe_app/features/profile/viewmodels/profile_viewmodel.dart';

void main() {
  testWidgets('App boots and shows splash', (WidgetTester tester) async {
    final sl = ServiceLocator.instance;
    await sl.setup();

    await tester.pumpWidget(UniverseApp(
      authViewModel: AuthViewModel(
        sl.authRepository,
        sl.localStorageService,
        sl.firebaseService,
        sl.secureStorageService,
        sl.biometricService,
      ),
      messagesViewModel: MessagesViewModel(sl.messagesRepository),
      profileViewModel: ProfileViewModel(
        repository: sl.profileRepository,
        localStorage: sl.localStorageService,
      ),
      gateViewModel: sl.gateViewModel,
      attendanceViewModel: sl.attendanceViewModel,
      resultsViewModel: sl.resultsViewModel,
      supportViewModel: sl.supportViewModel,
    ));

    expect(find.text('UniVerse'), findsOneWidget);
  });
}
