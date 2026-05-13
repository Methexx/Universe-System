class ResultTermModel {
  final String id;
  final String term;
  final DateTime? publishedAt;
  final List<ResultModuleModel> modules;

  ResultTermModel({
    required this.id,
    required this.term,
    this.publishedAt,
    required this.modules,
  });

  factory ResultTermModel.fromJson(Map<String, dynamic> json) {
    return ResultTermModel(
      id: json['id'] as String,
      term: json['term'] as String,
      publishedAt: json['published_at'] != null ? DateTime.parse(json['published_at']) : null,
      modules: (json['modules'] as List<dynamic>)
          .map((e) => ResultModuleModel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  double get averageScore {
    if (modules.isEmpty) return 0;
    final scores = modules.where((m) => m.score != null).map((m) => m.score!);
    if (scores.isEmpty) return 0;
    return scores.reduce((a, b) => a + b) / scores.length;
  }

  int get publishedCount => modules.where((m) => m.score != null).length;
}

class ResultModuleModel {
  final String id;
  final String name;
  final double? score;

  ResultModuleModel({
    required this.id,
    required this.name,
    this.score,
  });

  factory ResultModuleModel.fromJson(Map<String, dynamic> json) {
    return ResultModuleModel(
      id: json['id'] as String,
      name: json['name'] as String,
      score: json['score'] != null ? (json['score'] as num).toDouble() : null,
    );
  }

  String get grade {
    if (score == null) return 'N/A';
    if (score! >= 90) return 'A+';
    if (score! >= 80) return 'A';
    if (score! >= 75) return 'A-';
    if (score! >= 70) return 'B+';
    if (score! >= 65) return 'B';
    if (score! >= 60) return 'B-';
    if (score! >= 55) return 'C+';
    if (score! >= 50) return 'C';
    if (score! >= 45) return 'C-';
    if (score! >= 40) return 'D';
    return 'F';
  }
}
