import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:universe_app/core/constants/app_colors.dart';
import 'package:universe_app/shared/widgets/live_clock_widget.dart';

// ─── Dummy data ───────────────────────────────────────────────────────────────

class _GateRecord {
  const _GateRecord({
    required this.date,
    required this.time,
    required this.isIn,
  });
  final String date;
  final String time;
  final bool isIn;
}

const List<_GateRecord> _kRecords = <_GateRecord>[
  _GateRecord(date: '2025–10–12', time: '02:45 PM', isIn: false),
  _GateRecord(date: '2025–10–15', time: '09:45 AM', isIn: true),
  _GateRecord(date: '2025–10–20', time: '09:45 AM', isIn: false),
  _GateRecord(date: '2025–10–12', time: '09:45 AM', isIn: true),
  _GateRecord(date: '2025–10–21', time: '09:45 AM', isIn: false),
  _GateRecord(date: '2025–10–12', time: '09:45 AM', isIn: true),
  _GateRecord(date: '2025–10–12', time: '09:45 AM', isIn: false),
];

// ─── Screen ───────────────────────────────────────────────────────────────────

class GateStatusScreen extends StatefulWidget {
  const GateStatusScreen({super.key});

  @override
  State<GateStatusScreen> createState() => _GateStatusScreenState();
}

class _GateStatusScreenState extends State<GateStatusScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _entryController;
  late final Animation<Offset> _slideAnim;
  late final Animation<double> _fadeAnim;

  // Dummy: student is currently outside
  final bool _isOutside = true;

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

    return Scaffold(
      backgroundColor: const Color(0xFFF0F7FA),
      body: Column(
        children: <Widget>[
          // ── App bar ──────────────────────────────────────────────────────
          Container(
            color: const Color(0xFFF0F7FA),
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
                    'Gate Status',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF1A3A44),
                    ),
                  ),
                ),
                Container(
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
                  child: const Icon(Icons.refresh_rounded,
                      size: 18, color: Color(0xFF1A3A44)),
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
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: EdgeInsets.fromLTRB(16, 8, 16, bottomInset + 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      // ── Status banner ─────────────────────────────────
                      _StatusBanner(isOutside: _isOutside, todayLabel: _todayLabel),
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
                        child: Row(
                          children: <Widget>[
                            Icon(Icons.info_outline_rounded,
                                size: 16,
                                color: AppColors.primary.withValues(alpha: 0.6)),
                            const SizedBox(width: 8),
                            const Expanded(
                              child: Text(
                                '*This may take up to 10 minutes to update!',
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

                      // ── History table ─────────────────────────────────
                      _HistoryTable(records: _kRecords),
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
  const _StatusBanner({required this.isOutside, required this.todayLabel});
  final bool isOutside;
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
        widget.isOutside ? const Color(0xFFE84C2B) : const Color(0xFF1A8C5B);
    final String statusText = widget.isOutside
        ? 'STUDENT IS OUTSIDE THE SCHOOL'
        : 'STUDENT IS INSIDE THE SCHOOL';

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

// ─── History table ────────────────────────────────────────────────────────────

class _HistoryTable extends StatelessWidget {
  const _HistoryTable({required this.records});
  final List<_GateRecord> records;

  @override
  Widget build(BuildContext context) {
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
                    'Time',
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
                  flex: 2,
                  child: Text(
                    'Status',
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
            (MapEntry<int, _GateRecord> entry) => _TableRow(
              record: entry.value,
              isLast: entry.key == records.length - 1,
            ),
          ),

          // Load More
          InkWell(
            onTap: () {},
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: const BoxDecoration(
                border: Border(
                  top: BorderSide(color: Color(0xFFEBF3F6), width: 1),
                ),
              ),
              child: const Text(
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
  final _GateRecord record;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    final Color statusColor = record.isIn
        ? const Color(0xFF16A34A)
        : const Color(0xFFDC2626);
    final String statusText = record.isIn ? 'Gate IN' : 'Gate Out';

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
              record.date,
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
              record.time,
              textAlign: TextAlign.center,
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
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: <Widget>[
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    statusText,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: statusColor,
                    ),
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
