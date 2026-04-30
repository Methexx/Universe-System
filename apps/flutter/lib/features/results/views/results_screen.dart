import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:universe_app/core/constants/app_colors.dart';

// ─── Data ─────────────────────────────────────────────────────────────────────

class _ModuleResult {
  const _ModuleResult({
    required this.code,
    required this.name,
    required this.credits,
    this.marks,
    this.grade,
    this.isPublished = true,
  });

  final String code;
  final String name;
  final int credits;
  final double? marks;    // null = not published
  final String? grade;
  final bool isPublished;
}

const List<_ModuleResult> _kResults = <_ModuleResult>[
  _ModuleResult(
    code: 'SE1095',
    name: 'Introduction to Software Engineering',
    credits: 3,
    marks: 78.5,
    grade: 'B+',
  ),
  _ModuleResult(
    code: 'SE1083',
    name: 'Fundamentals of Programming',
    credits: 4,
    marks: 85.0,
    grade: 'A',
  ),
  _ModuleResult(
    code: 'SE1072',
    name: 'Mathematics for Computing',
    credits: 3,
    marks: 62.0,
    grade: 'C+',
  ),
  _ModuleResult(
    code: 'SE2101',
    name: 'Data Structures & Algorithms',
    credits: 4,
    isPublished: false,
  ),
  _ModuleResult(
    code: 'SE2114',
    name: 'Database Management Systems',
    credits: 3,
    marks: 91.0,
    grade: 'A+',
  ),
  _ModuleResult(
    code: 'SE2088',
    name: 'Operating Systems',
    credits: 3,
    isPublished: false,
  ),
  _ModuleResult(
    code: 'SE2076',
    name: 'Computer Networks',
    credits: 3,
    marks: 74.0,
    grade: 'B',
  ),
  _ModuleResult(
    code: 'SE3102',
    name: 'Software Architecture',
    credits: 4,
    isPublished: false,
  ),
];

// ─── Screen ───────────────────────────────────────────────────────────────────

class ResultsScreen extends StatefulWidget {
  const ResultsScreen({super.key});

  @override
  State<ResultsScreen> createState() => _ResultsScreenState();
}

class _ResultsScreenState extends State<ResultsScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _entryController;
  late final Animation<Offset> _slideAnim;
  late final Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _entryController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.12),
      end: Offset.zero,
    ).animate(
        CurvedAnimation(parent: _entryController, curve: Curves.easeOutCubic));
    _fadeAnim =
        CurvedAnimation(parent: _entryController, curve: Curves.easeOut);
    _entryController.forward();
  }

  @override
  void dispose() {
    _entryController.dispose();
    super.dispose();
  }

  int get _publishedCount =>
      _kResults.where((r) => r.isPublished).length;

  double get _gpa {
    final published = _kResults.where((r) => r.isPublished && r.marks != null);
    if (published.isEmpty) return 0;
    double total = 0;
    int count = 0;
    for (final r in published) {
      total += r.marks!;
      count++;
    }
    return total / count;
  }

  @override
  Widget build(BuildContext context) {
    final double topInset = MediaQuery.paddingOf(context).top;
    final double bottomInset = MediaQuery.paddingOf(context).bottom;

    return Scaffold(
      backgroundColor: const Color(0xFFF4FAFB),
      body: Column(
        children: <Widget>[
          // ── Header ─────────────────────────────────────────────────────────
          Container(
            color: AppColors.primary,
            padding: EdgeInsets.fromLTRB(18, 14 + topInset, 18, 28),
            child: Column(
              children: <Widget>[
                Row(
                  children: <Widget>[
                    GestureDetector(
                      onTap: () => context.pop(),
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.arrow_back_ios_new_rounded,
                            color: Colors.white, size: 18),
                      ),
                    ),
                    const SizedBox(width: 14),
                    const Text(
                      'My Results',
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '${_kResults.length} Modules',
                        style: const TextStyle(
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                // Summary row
                Row(
                  children: <Widget>[
                    _SummaryChip(
                      label: 'Average',
                      value: '${_gpa.toStringAsFixed(1)}%',
                      icon: Icons.bar_chart_rounded,
                    ),
                    const SizedBox(width: 10),
                    _SummaryChip(
                      label: 'Published',
                      value: '$_publishedCount/${_kResults.length}',
                      icon: Icons.check_circle_outline_rounded,
                    ),
                    const SizedBox(width: 10),
                    _SummaryChip(
                      label: 'Pending',
                      value:
                          '${_kResults.length - _publishedCount}',
                      icon: Icons.hourglass_top_rounded,
                    ),
                  ],
                ),
              ],
            ),
          ),
          // ── Results list ───────────────────────────────────────────────────
          Expanded(
            child: SlideTransition(
              position: _slideAnim,
              child: FadeTransition(
                opacity: _fadeAnim,
                child: ListView.separated(
                  padding: EdgeInsets.fromLTRB(
                      16, 20, 16, 20 + bottomInset),
                  itemCount: _kResults.length,
                  separatorBuilder: (context, idx) => const SizedBox(height: 10),
                  itemBuilder: (context, index) =>
                      _ResultCard(result: _kResults[index]),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Summary chip ─────────────────────────────────────────────────────────────

class _SummaryChip extends StatelessWidget {
  const _SummaryChip({
    required this.label,
    required this.value,
    required this.icon,
  });

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white.withValues(alpha: 0.18)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Icon(icon, size: 16, color: Colors.white.withValues(alpha: 0.7)),
            const SizedBox(height: 6),
            Text(
              value,
              style: const TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: Colors.white,
              ),
            ),
            Text(
              label,
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 10,
                fontWeight: FontWeight.w500,
                color: Colors.white.withValues(alpha: 0.65),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Result card ──────────────────────────────────────────────────────────────

class _ResultCard extends StatelessWidget {
  const _ResultCard({required this.result});

  final _ModuleResult result;

  Color get _gradeColor {
    if (!result.isPublished || result.grade == null) {
      return const Color(0xFF9CA3AF);
    }
    switch (result.grade) {
      case 'A+':
      case 'A':
        return const Color(0xFF16A34A);
      case 'A-':
      case 'B+':
        return const Color(0xFF2563EB);
      case 'B':
      case 'B-':
        return const Color(0xFF7C3AED);
      case 'C+':
      case 'C':
        return const Color(0xFFD97706);
      default:
        return const Color(0xFFDC2626);
    }
  }

  Color get _gradeBg => _gradeColor.withValues(alpha: 0.10);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: const Color(0xFF1A3A44).withValues(alpha: 0.06),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: <Widget>[
            // Module icon box
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: result.isPublished
                    ? AppColors.primary.withValues(alpha: 0.08)
                    : const Color(0xFFF3F4F6),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                result.isPublished
                    ? Icons.menu_book_rounded
                    : Icons.lock_clock_rounded,
                size: 22,
                color: result.isPublished
                    ? AppColors.primary
                    : const Color(0xFF9CA3AF),
              ),
            ),
            const SizedBox(width: 12),
            // Module info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    result.code,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary.withValues(alpha: 0.6),
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    result.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF16212A),
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: <Widget>[
                      Icon(
                        Icons.stars_rounded,
                        size: 12,
                        color: const Color(0xFF6B7280),
                      ),
                      const SizedBox(width: 3),
                      Text(
                        '${result.credits} Credits',
                        style: const TextStyle(
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF6B7280),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            // Grade / marks or N/A
            if (result.isPublished) ...<Widget>[
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: <Widget>[
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: _gradeBg,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      result.grade ?? '-',
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: _gradeColor,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${result.marks?.toStringAsFixed(1) ?? '-'}%',
                    style: const TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF374151),
                    ),
                  ),
                ],
              ),
            ] else ...<Widget>[
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: <Widget>[
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF3F4F6),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'N/A',
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF9CA3AF),
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Not published',
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF9CA3AF),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
