import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:universe_app/core/constants/app_colors.dart';
import 'package:universe_app/features/results/models/result_model.dart';
import 'package:universe_app/features/results/viewmodels/results_viewmodel.dart';

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

    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ResultsViewModel>().loadResults();
    });
  }

  @override
  void dispose() {
    _entryController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final double topInset = MediaQuery.paddingOf(context).top;
    final double bottomInset = MediaQuery.paddingOf(context).bottom;
    final ResultsViewModel vm = context.watch<ResultsViewModel>();

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
                      'Student Results',
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                    const Spacer(),
                    if (vm.selectedTerm != null)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '${vm.selectedTerm!.modules.length} Modules',
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
                if (vm.selectedTerm != null)
                  Row(
                    children: <Widget>[
                      _SummaryChip(
                        label: 'Average',
                        value: '${vm.selectedTerm!.averageScore.toStringAsFixed(1)}%',
                        icon: Icons.bar_chart_rounded,
                      ),
                      const SizedBox(width: 10),
                      _SummaryChip(
                        label: 'Published',
                        value: '${vm.selectedTerm!.publishedCount}/${vm.selectedTerm!.modules.length}',
                        icon: Icons.check_circle_outline_rounded,
                      ),
                      const SizedBox(width: 10),
                      _SummaryChip(
                        label: 'Pending',
                        value:
                            '${vm.selectedTerm!.modules.length - vm.selectedTerm!.publishedCount}',
                        icon: Icons.hourglass_top_rounded,
                      ),
                    ],
                  )
                else if (vm.isLoading)
                  const SizedBox(
                    height: 60,
                    child: Center(child: CircularProgressIndicator(color: Colors.white)),
                  )
                else
                  const SizedBox(height: 60),
              ],
            ),
          ),

          // ── Results list ───────────────────────────────────────────────────
          Expanded(
            child: RefreshIndicator(
              onRefresh: vm.refresh,
              color: AppColors.primary,
              child: SlideTransition(
                position: _slideAnim,
                child: FadeTransition(
                  opacity: _fadeAnim,
                  child: vm.isLoading
                      ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                      : vm.error != null
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(vm.error!, style: const TextStyle(color: Colors.red)),
                                  const SizedBox(height: 16),
                                  ElevatedButton(
                                    onPressed: () => vm.loadResults(),
                                    child: const Text('Retry'),
                                  ),
                                ],
                              ),
                            )
                          : vm.selectedTerm == null
                              ? const Center(child: Text('No results found.'))
                              : ListView.separated(
                                  physics: const AlwaysScrollableScrollPhysics(),
                                  padding: EdgeInsets.fromLTRB(
                                      16, 20, 16, 20 + bottomInset),
                                  itemCount: vm.selectedTerm!.modules.length,
                                  separatorBuilder: (context, idx) =>
                                      const SizedBox(height: 10),
                                  itemBuilder: (context, index) =>
                                      _ResultCard(module: vm.selectedTerm!.modules[index]),
                                ),
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
  const _ResultCard({required this.module});

  final ResultModuleModel module;

  Color get _gradeColor {
    if (module.score == null) {
      return const Color(0xFF9CA3AF);
    }
    final grade = module.grade;
    switch (grade) {
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
    final isPublished = module.score != null;

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
                color: isPublished
                    ? AppColors.primary.withValues(alpha: 0.08)
                    : const Color(0xFFF3F4F6),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                isPublished
                    ? Icons.menu_book_rounded
                    : Icons.lock_clock_rounded,
                size: 22,
                color: isPublished
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
                    'MODULE',
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
                    module.name,
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
                ],
              ),
            ),
            const SizedBox(width: 12),
            // Grade / marks or N/A
            if (isPublished) ...<Widget>[
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
                      module.grade,
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
                    '${module.score!.toStringAsFixed(1)}%',
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
