import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:universe_app/features/attendance/models/attendance_model.dart';
import 'package:universe_app/features/attendance/viewmodels/attendance_viewmodel.dart';
import 'package:universe_app/shared/widgets/live_clock_widget.dart';

// ─── Screen ───────────────────────────────────────────────────────────────────

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _entryController;
  late final Animation<Offset> _slideAnim;
  late final Animation<double> _fadeAnim;

  final bool _isInside = true;

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
    ).animate(CurvedAnimation(parent: _entryController, curve: Curves.easeOutCubic));
    _fadeAnim = CurvedAnimation(parent: _entryController, curve: Curves.easeOut);
    _entryController.forward();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AttendanceViewModel>().loadAttendance();
    });
  }

  @override
  void dispose() {
    _entryController.dispose();
    super.dispose();
  }

  String get _todayLabel {
    final DateTime now = DateTime.now();
    return '${now.year} – ${now.month.toString().padLeft(2, '0')} – ${now.day.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final double topInset = MediaQuery.paddingOf(context).top;
    final double bottomInset = MediaQuery.paddingOf(context).bottom;
    final AttendanceViewModel vm = context.watch<AttendanceViewModel>();

    return Scaffold(
      backgroundColor: const Color(0xFFF4FAFB),
      body: Column(
        children: <Widget>[
          // ── App bar ──────────────────────────────────────────────────────
          Container(
            color: const Color(0xFFF4FAFB),
            padding: EdgeInsets.fromLTRB(8, topInset + 8, 16, 8),
            child: Row(
              children: <Widget>[
                IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new_rounded,
                      size: 20, color: Color(0xFF1A3A44)),
                  onPressed: () => context.pop(),
                ),
                const Expanded(
                  child: Text(
                    'Classroom Attendance',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF1A3A44),
                    ),
                  ),
                ),
                InkWell(
                  onTap: () => vm.refresh(),
                  borderRadius: BorderRadius.circular(18),
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: <BoxShadow>[
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.07),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: vm.isRefreshing
                        ? const Padding(
                            padding: EdgeInsets.all(10),
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Color(0xFF1A3A44),
                            ),
                          )
                        : const Icon(Icons.refresh_rounded,
                            size: 18, color: Color(0xFF1A3A44)),
                  ),
                ),
              ],
            ),
          ),

          // ── Animated content ─────────────────────────────────────────────
          Expanded(
            child: FadeTransition(
              opacity: _fadeAnim,
              child: SlideTransition(
                position: _slideAnim,
                child: vm.isLoading
                    ? const Center(
                        child: CircularProgressIndicator(color: Color(0xFF1A3A44)))
                    : vm.error != null
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(vm.error!,
                                    style: const TextStyle(color: Colors.red)),
                                const SizedBox(height: 16),
                                ElevatedButton(
                                  onPressed: () => vm.loadAttendance(),
                                  child: const Text('Retry'),
                                ),
                              ],
                            ),
                          )
                        : SingleChildScrollView(
                            physics: const BouncingScrollPhysics(),
                            padding: EdgeInsets.fromLTRB(16, 8, 16, bottomInset + 24),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                // ── Status banner ─────────────────────────────────
                                _StatusBanner(
                                    isInside: vm.isInsideSchool ?? false,
                                    todayLabel: _todayLabel),
                                const SizedBox(height: 12),

                                // ── Disclaimer ────────────────────────────────────
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 14, vertical: 10),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                        color: const Color(0xFFE2EDF2), width: 1),
                                  ),
                                  child: const Row(
                                    children: <Widget>[
                                      Icon(Icons.info_outline_rounded,
                                          size: 16, color: Color(0xFF5A7A85)),
                                      SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          '*This may takes up to 10 minutes to update!',
                                          style: TextStyle(
                                            fontFamily: 'Plus Jakarta Sans',
                                            fontSize: 12,
                                            fontWeight: FontWeight.w500,
                                            color: Color(0xFF5A7A85),
                                            fontStyle: FontStyle.italic,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 20),

                                // ── Attendance table ──────────────────────────────
                                _AttendanceTable(
                                  records: vm.records,
                                  hasMore: vm.hasMore,
                                  isLoadingMore: vm.isLoadingMore,
                                  onLoadMore: () => vm.loadMore(),
                                ),
                              ],
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

// ─── Status banner ────────────────────────────────────────────────────────────

class _StatusBanner extends StatefulWidget {
  const _StatusBanner({required this.isInside, required this.todayLabel});
  final bool isInside;
  final String todayLabel;

  @override
  State<_StatusBanner> createState() => _StatusBannerState();
}

class _StatusBannerState extends State<_StatusBanner>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulseController;
  late final Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
    _pulseAnim = Tween<double>(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final Color bannerColor =
        widget.isInside ? const Color(0xFF22C55E) : const Color(0xFFE84C2B);
    final String statusText = widget.isInside
        ? 'STUDUENT IS INSIDE THE SCHOOL'
        : 'STUDENT IS OUTSIDE THE SCHOOL';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bannerColor,
        borderRadius: BorderRadius.circular(18),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: bannerColor.withValues(alpha: 0.4),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  children: <Widget>[
                    AnimatedBuilder(
                      animation: _pulseAnim,
                      builder: (BuildContext ctx, Widget? child) => Opacity(
                        opacity: _pulseAnim.value,
                        child: Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      widget.todayLabel,
                      style: const TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  statusText,
                  style: const TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          LiveClockWidget(
            backgroundColor: Colors.white,
            textColor: const Color(0xFF111827),
            dateColor: const Color(0xFF1F2937),
            amPmColor: const Color(0xFF6B7280),
            dotColor: bannerColor,
          ),
        ],
      ),
    );
  }
}

// ─── Attendance table ─────────────────────────────────────────────────────────

class _AttendanceTable extends StatelessWidget {
  const _AttendanceTable({
    required this.records,
    required this.hasMore,
    required this.isLoadingMore,
    required this.onLoadMore,
  });
  final List<AttendanceRecordModel> records;
  final bool hasMore;
  final bool isLoadingMore;
  final VoidCallback onLoadMore;

  @override
  Widget build(BuildContext context) {
    if (records.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
        ),
        child: const Text(
          'No attendance records found.',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            color: Color(0xFF94A3B0),
          ),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: <Widget>[
          // Header row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: Color(0xFFEBF3F6), width: 1.5),
              ),
            ),
            child: const Row(
              children: <Widget>[
                Expanded(
                  flex: 3,
                  child: Text(
                    'Date',
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF94A3B0),
                    ),
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Text(
                    'Status',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF94A3B0),
                    ),
                  ),
                ),
                Expanded(
                  flex: 1,
                  child: Text(
                    'Gate',
                    textAlign: TextAlign.end,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF94A3B0),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Data rows
          ...records.asMap().entries.map(
            (MapEntry<int, AttendanceRecordModel> entry) => _TableRow(
              record: entry.value,
              isLast: entry.key == records.length - 1 && !hasMore,
            ),
          ),

          // Load More
          if (hasMore)
            InkWell(
              onTap: isLoadingMore ? null : onLoadMore,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: const BoxDecoration(
                  border: Border(
                    top: BorderSide(color: Color(0xFFEBF3F6), width: 1),
                  ),
                ),
                child: isLoadingMore
                    ? const Center(
                        child: SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Color(0xFF94A3B0)),
                        ),
                      )
                    : const Text(
                        'Load More',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF94A3B0),
                        ),
                      ),
              ),
            ),
        ],
      ),
    );
  }
}

class _TableRow extends StatelessWidget {
  const _TableRow({required this.record, required this.isLast});
  final AttendanceRecordModel record;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    final String normalizedStatus = record.status.toLowerCase();
    
    Color statusColor;
    if (normalizedStatus == 'present') {
      statusColor = const Color(0xFF16A34A);
    } else if (normalizedStatus == 'absent') {
      statusColor = const Color(0xFFDC2626);
    } else if (normalizedStatus == 'late') {
      statusColor = const Color(0xFFF59E0B);
    } else {
      statusColor = const Color(0xFF94A3B8); // unmarked / pending
    }

    final String statusText = record.status[0].toUpperCase() + record.status.substring(1);
    final Color dotColor = record.gateIn
        ? const Color(0xFF22C55E)
        : const Color(0xFFEF4444);

    // Simple date formatting
    final String displayDate = record.date.split('T')[0].replaceAll('-', ' – ');

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        border: isLast
            ? null
            : const Border(
                bottom: BorderSide(color: Color(0xFFF1F8FB), width: 1),
              ),
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            flex: 3,
            child: Text(
              displayDate,
              style: const TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: Color(0xFF374151),
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              statusText,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: statusColor,
              ),
            ),
          ),
          Expanded(
            flex: 1,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: <Widget>[
                Container(
                  width: 14,
                  height: 14,
                  decoration: BoxDecoration(
                    color: dotColor,
                    shape: BoxShape.circle,
                    boxShadow: <BoxShadow>[
                      BoxShadow(
                        color: dotColor.withValues(alpha: 0.4),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
