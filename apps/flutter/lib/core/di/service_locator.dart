import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:universe_app/core/api/api_client.dart';
import 'package:universe_app/core/api/api_config.dart';
import 'package:universe_app/core/services/firebase_service.dart';
import 'package:universe_app/core/storage/secure_storage.dart';
import 'package:universe_app/features/auth/repositories/auth_repository.dart';
import 'package:universe_app/features/messages/repositories/messages_repository.dart';

class ServiceLocator {
  ServiceLocator._();

  static final ServiceLocator instance = ServiceLocator._();

  late final ApiClient apiClient;
  late final SecureStorageService secureStorageService;
  late final AuthRepository authRepository;
  late final MessagesRepository messagesRepository;
  late final FirebaseService firebaseService;

  void setup() {
    apiClient = ApiClient(baseUrl: ApiConfig.baseUrl);
    secureStorageService = SecureStorageService(const FlutterSecureStorage());
    authRepository = ApiAuthRepository(
      dio: apiClient.dio,
      secureStorage: secureStorageService,
    );
    messagesRepository = MessagesRepository(apiClient);
    firebaseService = FirebaseService();
    firebaseService.initialize();
  }
}
