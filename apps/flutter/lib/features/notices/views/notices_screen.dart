import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:universe_app/core/constants/app_colors.dart';

// ─── Shared model ─────────────────────────────────────────────────────────────

class NoticeItem {
  const NoticeItem({
    required this.title,
    required this.subtitle,
    required this.tag,
    required this.date,
    required this.gradientColors,
    required this.icon,
  });

  final String title;
  final String subtitle;
  final String tag;
  final String date;
  final List<Color> gradientColors;
  final IconData icon;
}

const List<NoticeItem> kAllNotices = <NoticeItem>[
  NoticeItem(
    title: 'We have cancelled today\'s lectures',
    subtitle:
        'All lectures for Module Code SE1095 have been cancelled today due to a staff meeting. Students are advised to self-study.',
    tag: 'Academic',
    date: 'Today · 8:00 AM',
    gradientColors: [Color(0xFF64C4E6), Color(0xFF3EA8D8)],
    icon: Icons.school_rounded,
  ),
  NoticeItem(
    title: 'Library extended opening hours',
    subtitle:
        'The school library will remain open until 10:00 PM this week to support upcoming exams. Please carry your student ID.',
    tag: 'Facility',
    date: 'Today · 9:30 AM',
    gradientColors: [Color(0xFF77C8A8), Color(0xFF3DAA82)],
    icon: Icons.menu_book_rounded,
  ),
  NoticeItem(
    title: 'Hackathon 2026 registration open',
    subtitle:
        'Register now for the annual school Hackathon starting this Friday. Teams of 2–4. Registration closes Thursday midnight.',
    tag: 'Event',
    date: 'Yesterday · 3:00 PM',
    gradientColors: [Color(0xFF8CB2FF), Color(0xFF5B82F0)],
    icon: Icons.code_rounded,
  ),
  NoticeItem(
    title: 'Career fair this Wednesday',
    subtitle:
        'Over 20 companies will attend the Career Fair at Hall B starting 9:00 AM. Smart casual attire is required.',
    tag: 'Event',
    date: 'Yesterday · 11:00 AM',
    gradientColors: [Color(0xFFFFB38A), Color(0xFFE8845A)],
    icon: Icons.work_rounded,
  ),
  NoticeItem(
    title: 'Term exam timetable released',
    subtitle:
        'The term examination timetable for May 2026 has been published. Check the school portal for your individual schedule.',
    tag: 'Exam',
    date: '29 Apr · 2:00 PM',
    gradientColors: [Color(0xFFFF8FAB), Color(0xFFD94F72)],
    icon: Icons.event_note_rounded,
  ),
  NoticeItem(
    title: 'Sports day postponed',
    subtitle:
        'Annual sports day originally scheduled for May 3rd has been postponed to May 17th due to weather forecasts.',
    tag: 'Sports',
    date: '28 Apr · 10:00 AM',
    gradientColors: [Color(0xFFFFCC80), Color(0xFFD47A2E)],
    icon: Icons.sports_soccer_rounded,
  ),
  NoticeItem(
    title: 'New canteen menu available',
    subtitle:
        'The school canteen has updated its weekly menu with healthier options. Vegetarian meals are now available every day.',
    tag: 'General',
    date: '27 Apr · 7:30 AM',
    gradientColors: [Color(0xFF80E8B8), Color(0xFF2EAA75)],
    icon: Icons.restaurant_rounded,
  ),
  NoticeItem(
    title: 'Parent-teacher meeting',
    subtitle:
        'Parent-teacher meetings are scheduled for May 10th from 9:00 AM to 1:00 PM. Appointments can be booked online.',
    tag: 'Meeting',
    date: '26 Apr · 1:00 PM',
    gradientColors: [Color(0xFFD4AAFF), Color(0xFF9067C6)],
    icon: Icons.groups_rounded,
  ),
];

// ─── Screen ───────────────────────────────────────────────────────────────────

class NoticesScreen extends StatefulWidget {
  const NoticesScreen({super.key});

  @override
  State<NoticesScreen> createState() => _NoticesScreenState();
}

class _NoticesScreenState extends State<NoticesScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _entryCtrl;
  late final Animation<Offset> _slideAnim;
  late final Animation<double> _fadeAnim;

  String _activeFilter = 'All';

  static const List<String> _filters = [
    'All',
    'Academic',
    'Event',
    'Exam',
    'Sports',
    'General',
    'Meeting',
    'Facility',
  ];

  @override
  void initState() {
    super.initState();
    _entryCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 550),
    );
    _slideAnim = Tween<Offset>(begin: const Offset(0, 0.1), end: Offset.zero)
        .animate(
            CurvedAnimation(parent: _entryCtrl, curve: Curves.easeOutCubic));
    _fadeAnim =
        CurvedAnimation(parent: _entryCtrl, curve: Curves.easeOut);
    _entryCtrl.forward();
  }

  @override
  void dispose() {
    _entryCtrl.dispose();
    super.dispose();
  }

  List<NoticeItem> get _filtered => _activeFilter == 'All'
      ? kAllNotices
      : kAllNotices.where((n) => n.tag == _activeFilter).toList();

  @override
  Widget build(BuildContext context) {
    final double topInset = MediaQuery.paddingOf(context).top;
    final double bottomInset = MediaQuery.paddingOf(context).bottom;

    return Scaffold(
      backgroundColor: AppColors.primary,
      body: Column(
        children: [
          _buildHeader(topInset),
          Expanded(
            child: SlideTransition(
              position: _slideAnim,
              child: FadeTransition(
                opacity: _fadeAnim,
                child: Container(
                  decoration: const BoxDecoration(
                    color: Color(0xFFF4FAFB),
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(32),
                      topRight: Radius.circular(32),
                    ),
                  ),
                  child: Column(
                    children: [
                      // ── Filter chips ─────────────────────────────────────
                      _FilterBar(
                        filters: _filters,
                        active: _activeFilter,
                        onSelected: (f) => setState(() => _activeFilter = f),
                      ),
                      // ── Notice list ──────────────────────────────────────
                      Expanded(
                        child: _filtered.isEmpty
                            ? _EmptyState(filter: _activeFilter)
                            : ListView.builder(
                                physics: const BouncingScrollPhysics(),
                                padding: EdgeInsets.fromLTRB(
                                    18, 4, 18, bottomInset + 24),
                                itemCount: _filtered.length,
                                itemBuilder: (context, i) =>
                                    _NoticeListCard(
                                  notice: _filtered[i],
                                  index: i,
                                  controller: _entryCtrl,
                                ),
                              ),
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

  Widget _buildHeader(double topInset) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.fromLTRB(18, 14 + topInset, 18, 28),
      color: AppColors.primary,
      child: Row(
        children: [
          GestureDetector(
            onTap: () => context.pop(),
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.arrow_back_ios_new_rounded,
                  color: Colors.white, size: 18),
            ),
          ),
          const SizedBox(width: 14),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Notices',
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'All school announcements',
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: Colors.white60,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                const Icon(Icons.circle, color: Color(0xFF4ADE80), size: 8),
                const SizedBox(width: 6),
                Text(
                  '${kAllNotices.length} notices',
                  style: const TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
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

// ─── Filter bar ───────────────────────────────────────────────────────────────

class _FilterBar extends StatelessWidget {
  const _FilterBar({
    required this.filters,
    required this.active,
    required this.onSelected,
  });

  final List<String> filters;
  final String active;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 56,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
        itemCount: filters.length,
        itemBuilder: (context, i) {
          final String f = filters[i];
          final bool isActive = f == active;

          return GestureDetector(
            onTap: () => onSelected(f),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              curve: Curves.easeInOut,
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: isActive ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: isActive
                        ? AppColors.primary.withValues(alpha: 0.3)
                        : Colors.black.withValues(alpha: 0.05),
                    blurRadius: isActive ? 8 : 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Center(
                child: AnimatedDefaultTextStyle(
                  duration: const Duration(milliseconds: 200),
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: isActive ? Colors.white : const Color(0xFF78909C),
                  ),
                  child: Text(f),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

// ─── Notice list card ─────────────────────────────────────────────────────────

class _NoticeListCard extends StatefulWidget {
  const _NoticeListCard({
    required this.notice,
    required this.index,
    required this.controller,
  });

  final NoticeItem notice;
  final int index;
  final AnimationController controller;

  @override
  State<_NoticeListCard> createState() => _NoticeListCardState();
}

class _NoticeListCardState extends State<_NoticeListCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    // Stagger each card's entry animation
    final Animation<double> stagger = CurvedAnimation(
      parent: widget.controller,
      curve: Interval(
        (0.1 + widget.index * 0.07).clamp(0.0, 0.85),
        1.0,
        curve: Curves.easeOutCubic,
      ),
    );

    return FadeTransition(
      opacity: stagger,
      child: SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(0, 0.25),
          end: Offset.zero,
        ).animate(stagger),
        child: GestureDetector(
          onTap: () => setState(() => _expanded = !_expanded),
          child: Container(
            margin: const EdgeInsets.only(bottom: 14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(22),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.06),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                // ── Card header ─────────────────────────────────────────
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Gradient icon
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: widget.notice.gradientColors,
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(14),
                          boxShadow: [
                            BoxShadow(
                              color: widget.notice.gradientColors.last
                                  .withValues(alpha: 0.35),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Icon(widget.notice.icon,
                            color: Colors.white, size: 24),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                // Tag chip
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: widget.notice.gradientColors.first
                                        .withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    widget.notice.tag,
                                    style: TextStyle(
                                      fontFamily: 'Plus Jakarta Sans',
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700,
                                      color:
                                          widget.notice.gradientColors.last,
                                    ),
                                  ),
                                ),
                                const Spacer(),
                                Text(
                                  widget.notice.date,
                                  style: const TextStyle(
                                    fontFamily: 'Plus Jakarta Sans',
                                    fontSize: 10,
                                    fontWeight: FontWeight.w500,
                                    color: Color(0xFFB0BEC5),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              widget.notice.title,
                              style: const TextStyle(
                                fontFamily: 'Plus Jakarta Sans',
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF16212A),
                                height: 1.3,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      AnimatedRotation(
                        turns: _expanded ? 0.5 : 0,
                        duration: const Duration(milliseconds: 280),
                        child: const Icon(Icons.keyboard_arrow_down_rounded,
                            color: Color(0xFFB0BEC5), size: 22),
                      ),
                    ],
                  ),
                ),
                // ── Expandable detail ────────────────────────────────────
                AnimatedCrossFade(
                  firstChild: const SizedBox(width: double.infinity),
                  secondChild: Column(
                    children: [
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16),
                        child: Divider(height: 1, color: Color(0xFFF0F5F7)),
                      ),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 3,
                              height: 60,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: widget.notice.gradientColors,
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                ),
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                widget.notice.subtitle,
                                style: const TextStyle(
                                  fontFamily: 'Plus Jakarta Sans',
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                  color: Color(0xFF546E7A),
                                  height: 1.55,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  crossFadeState: _expanded
                      ? CrossFadeState.showSecond
                      : CrossFadeState.showFirst,
                  duration: const Duration(milliseconds: 280),
                  sizeCurve: Curves.easeInOut,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Empty state ──────────────────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.filter});

  final String filter;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.notifications_off_rounded,
              size: 56, color: const Color(0xFFCDD9DC)),
          const SizedBox(height: 14),
          Text(
            'No $filter notices',
            style: const TextStyle(
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: Color(0xFF90A4AE),
            ),
          ),
        ],
      ),
    );
  }
}
