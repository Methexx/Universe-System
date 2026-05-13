import 'package:dio/dio.dart';
import 'package:universe_app/core/api/api_endpoints.dart';
import 'package:universe_app/core/storage/secure_storage.dart';

class ChatbotQueryResult {
  const ChatbotQueryResult({
    required this.answer,
    required this.sources,
    required this.confidence,
  });

  final String answer;
  final List<String> sources;
  final double confidence;
}

class ChatbotService {
  const ChatbotService({required Dio dio, required SecureStorageService storage})
      : _dio = dio,
        _storage = storage;

  final Dio _dio;
  final SecureStorageService _storage;

  /// Sends a question to the RAG backend and returns the AI-generated answer.
  Future<ChatbotQueryResult> query(String question) async {
    final token = await _storage.getAccessToken();

    final response = await _dio.post<Map<String, dynamic>>(
      ApiEndpoints.ragQuery,
      data: {'question': question, 'top_k': 5},
      options: Options(
        headers: {
          if (token != null) 'Authorization': 'Bearer $token',
        },
      ),
    );

    final data = response.data!;
    final rawSources = data['sources'] as List<dynamic>? ?? [];
    final snippets = rawSources
        .map((s) => (s as Map<String, dynamic>)['snippet'] as String? ?? '')
        .where((s) => s.isNotEmpty)
        .toList();

    return ChatbotQueryResult(
      answer: data['answer'] as String? ?? 'No response received.',
      sources: snippets,
      confidence: (data['confidence'] as num?)?.toDouble() ?? 0.0,
    );
  }
}
