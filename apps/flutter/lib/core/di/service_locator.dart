import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:universe_app/core/api/api_client.dart';
import 'package:universe_app/core/api/api_config.dart';
import 'package:universe_app/core/services/biometric_service.dart';
import 'package:universe_app/core/services/firebase_service.dart';
import 'package:universe_app/core/storage/local_storage.dart';
import 'package:universe_app/core/storage/secure_storage.dart';
import 'package:universe_app/features/auth/repositories/auth_repository.dart';
import 'package:universe_app/features/chatbot/services/chatbot_service.dart';
import 'package:universe_app/features/gate/repositories/gate_repository.dart';
import 'package:universe_app/features/gate/viewmodels/gate_viewmodel.dart';
import 'package:universe_app/features/messages/repositories/messages_repository.dart';
import 'package:universe_app/features/profile/repositories/profile_repository.dart';
import 'package:universe_app/features/attendance/repositories/attendance_repository.dart';
import 'package:universe_app/features/attendance/viewmodels/attendance_viewmodel.dart';
import 'package:universe_app/features/results/repositories/results_repository.dart';
import 'package:universe_app/features/results/viewmodels/results_viewmodel.dart';
import 'package:universe_app/features/support/repositories/support_repository.dart';
import 'package:universe_app/features/support/viewmodels/support_viewmodel.dart';

class ServiceLocator {
  ServiceLocator._();

  static final ServiceLocator instance = ServiceLocator._();

  late ApiClient apiClient;
  late SecureStorageService secureStorageService;
  late LocalStorageService localStorageService;
  late AuthRepository authRepository;
  late ProfileRepository profileRepository;
  late GateRepository gateRepository;
  late GateViewModel gateViewModel;
  late MessagesRepository messagesRepository;
  late ChatbotService chatbotService;
  late FirebaseService firebaseService;
  late BiometricService biometricService;
  late AttendanceRepository attendanceRepository;
  late AttendanceViewModel attendanceViewModel;
  late ResultsRepository resultsRepository;
  late ResultsViewModel resultsViewModel;
  late SupportRepository supportRepository;
  late SupportViewModel supportViewModel;

  Future<void> setup() async {
    apiClient = ApiClient(baseUrl: ApiConfig.baseUrl);
    secureStorageService = SecureStorageService(const FlutterSecureStorage());
    localStorageService = LocalStorageService();
    authRepository = ApiAuthRepository(
      dio: apiClient.dio,
      secureStorage: secureStorageService,
    );
    profileRepository = ApiProfileRepository(
      dio: apiClient.dio,
      secureStorage: secureStorageService,
    );
    gateRepository = GateRepository(
      dio: apiClient.dio,
      secureStorage: secureStorageService,
    );
    gateViewModel = GateViewModel(repository: gateRepository);
    messagesRepository = MessagesRepository(apiClient, secureStorageService, localStorageService);
    chatbotService = ChatbotService(dio: apiClient.dio, storage: secureStorageService);
    firebaseService = FirebaseService(secureStorage: secureStorageService);
    await firebaseService.initialize();
    biometricService = BiometricService();
    attendanceRepository = AttendanceRepository(
      dio: apiClient.dio,
      secureStorage: secureStorageService,
    );
    attendanceViewModel = AttendanceViewModel(repository: attendanceRepository);
    resultsRepository = ResultsRepository(
      dio: apiClient.dio,
      secureStorage: secureStorageService,
    );
    resultsViewModel = ResultsViewModel(repository: resultsRepository);
    supportRepository = SupportRepository(
      dio: apiClient.dio,
      secureStorage: secureStorageService,
    );
    supportViewModel = SupportViewModel(repository: supportRepository);
  }
}
