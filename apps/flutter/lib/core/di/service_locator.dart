import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:universe_app/core/api/api_client.dart';
import 'package:universe_app/core/api/api_config.dart';
import 'package:universe_app/core/services/firebase_service.dart';
import 'package:universe_app/core/storage/local_storage.dart';
import 'package:universe_app/core/storage/secure_storage.dart';
import 'package:universe_app/features/auth/repositories/auth_repository.dart';
import 'package:universe_app/features/chatbot/services/chatbot_service.dart';
import 'package:universe_app/features/messages/repositories/messages_repository.dart';
import 'package:universe_app/features/profile/repositories/profile_repository.dart';

class ServiceLocator {
  ServiceLocator._();

  static final ServiceLocator instance = ServiceLocator._();

  late ApiClient apiClient;
  late SecureStorageService secureStorageService;
  late LocalStorageService localStorageService;
  late AuthRepository authRepository;
  late ProfileRepository profileRepository;
  late MessagesRepository messagesRepository;
  late ChatbotService chatbotService;
  late FirebaseService firebaseService;

  void setup() {
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
    messagesRepository = MessagesRepository(apiClient);
    chatbotService = ChatbotService(dio: apiClient.dio, storage: secureStorageService);
    firebaseService = FirebaseService();
    firebaseService.initialize();
  }
}
