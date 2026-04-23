class ApiConfig {
  // Android emulator uses 10.0.2.2 to access host machine localhost.
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:5000',
  );
}
