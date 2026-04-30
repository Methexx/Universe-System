import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:universe_app/core/constants/app_routes.dart';
import 'package:universe_app/core/constants/app_colors.dart';
import 'package:universe_app/features/auth/viewmodels/auth_viewmodel.dart';

// ─── Data ────────────────────────────────────────────────────────────────────

class _Announcement {
  const _Announcement({
    required this.title,
    required this.subtitle,
    required this.buttonText,
    required this.gradientColors,
    required this.icon,
  });

  final String title;
  final String subtitle;
  final String buttonText;
  final List<Color> gradientColors;
  final IconData icon;
}

const List<_Announcement> _kAnnouncements = <_Announcement>[
  _Announcement(
    title: 'We have cancel today\nlectures',
    subtitle: 'Module Code SE1095',
    buttonText: 'Sign Up',
    gradientColors: [Color(0xFF64C4E6), Color(0xFF3EA8D8)],
    icon: Icons.school_rounded,
  ),
  _Announcement(
    title: 'Library extended\nopening hours',
    subtitle: 'Open till 10:00 PM',
    buttonText: 'Read More',
    gradientColors: [Color(0xFF77C8A8), Color(0xFF3DAA82)],
    icon: Icons.menu_book_rounded,
  ),
  _Announcement(
    title: 'Hackathon 2026\nregistration open',
    subtitle: 'Starts this Friday',
    buttonText: 'Join Now',
    gradientColors: [Color(0xFF8CB2FF), Color(0xFF5B82F0)],
    icon: Icons.code_rounded,
  ),
  _Announcement(
    title: 'Career fair this\nWednesday',
    subtitle: 'Hall B – 9:00 AM',
    buttonText: 'Reserve',
    gradientColors: [Color(0xFFFFB38A), Color(0xFFE8845A)],
    icon: Icons.work_rounded,
  ),
];

// ─── Screen ───────────────────────────────────────────────────────────────────

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final String? userEmail = context.select<AuthViewModel, String?>(
      (AuthViewModel vm) => vm.currentUser?.email,
    );
    final String displayName = _displayNameFromEmail(userEmail);
    final double topInset = MediaQuery.paddingOf(context).top;
    final double bottomInset = MediaQuery.paddingOf(context).bottom;

    const double navBarHeight = 72;

    return Scaffold(
      backgroundColor: AppColors.primary,
      body: Stack(
        children: <Widget>[
          // Scrollable content — bottom padding reserves space for the nav bar
          SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              children: <Widget>[
                _TopHeader(displayName: displayName, topInset: topInset),
                Container(
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    color: Color(0xFFF4FAFB),
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(32),
                      topRight: Radius.circular(32),
                    ),
                  ),
                  padding: const EdgeInsets.fromLTRB(18, 24, 18, 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const _NoticesSection(),
                      const SizedBox(height: 28),
                      const _SectionLabel('Quick Actions'),
                      const SizedBox(height: 14),
                      const _ActionGrid(),
                      SizedBox(height: bottomInset + navBarHeight + 16),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Nav bar pinned at the bottom, overlapping the light content
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: _BottomNavBar(bottomInset: bottomInset),
          ),
        ],
      ),
    );
  }

  String _displayNameFromEmail(String? email) {
    if (email == null || email.trim().isEmpty) return 'Student';
    final String local = email.split('@').first;
    final String cleaned = local.replaceAll(RegExp(r'[._-]+'), ' ').trim();
    if (cleaned.isEmpty) return 'Student';
    return cleaned
        .split(' ')
        .where((String p) => p.isNotEmpty)
        .map((String p) => '${p[0].toUpperCase()}${p.substring(1).toLowerCase()}')
        .join(' ');
  }
}

// ─── Header ───────────────────────────────────────────────────────────────────

class _TopHeader extends StatefulWidget {
  const _TopHeader({required this.displayName, required this.topInset});

  final String displayName;
  final double topInset;

  @override
  State<_TopHeader> createState() => _TopHeaderState();
}

class _TopHeaderState extends State<_TopHeader> {
  late Timer _timer;
  late DateTime _now;

  @override
  void initState() {
    super.initState();
    _now = DateTime.now();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _now = DateTime.now());
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  String get _greeting {
    final int h = _now.hour;
    if (h < 12) return 'Good Morning !';
    if (h < 17) return 'Good Afternoon !';
    return 'Good Evening !';
  }

  String get _dateLabel {
    const List<String> months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${months[_now.month - 1]} ${_now.day}';
  }

  String get _timeHHMM {
    final int h = _now.hour % 12 == 0 ? 12 : _now.hour % 12;
    final String m = _now.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }

  String get _amPm => _now.hour < 12 ? 'AM' : 'PM';

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.fromLTRB(18, 14 + widget.topInset, 18, 28),
      color: AppColors.primary,
      child: Column(
        children: <Widget>[
          // Row: avatar + greeting | notification bell
          Row(
            children: <Widget>[
              Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white24, width: 2),
                ),
                child: const CircleAvatar(
                  radius: 24,
                  backgroundColor: Color(0xFFE3C091),
                  child: Icon(Icons.person, color: Color(0xFF374151), size: 24),
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    'Mr. Pathirana',
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: Colors.white.withValues(alpha: 0.65),
                    ),
                  ),
                  Text(
                    _greeting,
                    style: const TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              const Spacer(),
              // Notification bell
              Stack(
                children: <Widget>[
                  Container(
                    width: 44,
                    height: 44,
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.notifications_none_rounded,
                      color: AppColors.primary,
                      size: 24,
                    ),
                  ),
                  Positioned(
                    top: 10,
                    right: 10,
                    child: Container(
                      width: 9,
                      height: 9,
                      decoration: BoxDecoration(
                        color: const Color(0xFFDF5B6D),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 1.5),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),
          // Row: student name + online dot | date-time widget
          Row(
            children: <Widget>[
              // Name + online status
              Expanded(
                child: Row(
                  children: <Widget>[
                    Text(
                      widget.displayName,
                      style: const TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      width: 9,
                      height: 9,
                      decoration: const BoxDecoration(
                        color: Color(0xFF4ADE80),
                        shape: BoxShape.circle,
                      ),
                    ),
                  ],
                ),
              ),
              // Date-time pill
              Container(
                width: 88,
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: ShapeDecoration(
                  color: Colors.white,
                  shape: ContinuousRectangleBorder(
                    borderRadius: BorderRadius.circular(24),
                  ),
                ),
                child: Column(
                  children: <Widget>[
                    Text(
                      _dateLabel,
                      style: const TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    const SizedBox(height: 1),
                    Text(
                      _timeHHMM,
                      style: const TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF111827),
                        height: 1,
                      ),
                    ),
                    Text(
                      _amPm,
                      style: const TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF6B7280),
                        height: 1.1,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ─── Notices section ──────────────────────────────────────────────────────────

class _NoticesSection extends StatefulWidget {
  const _NoticesSection();

  @override
  State<_NoticesSection> createState() => _NoticesSectionState();
}

class _NoticesSectionState extends State<_NoticesSection> {
  late final PageController _pageController;
  Timer? _timer;
  int _active = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(viewportFraction: 0.92);
    _timer = Timer.periodic(const Duration(seconds: 3), (_) {
      if (!_pageController.hasClients) return;
      final int next = (_active + 1) % _kAnnouncements.length;
      _pageController.animateToPage(
        next,
        duration: const Duration(milliseconds: 420),
        curve: Curves.easeInOut,
      );
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Row(
          children: <Widget>[
            const Text(
              'Notices',
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: Color(0xFF16212A),
              ),
            ),
            const Spacer(),
            Text(
              'View All',
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.primary.withValues(alpha: 0.55),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 150,
          child: PageView.builder(
            controller: _pageController,
            itemCount: _kAnnouncements.length,
            onPageChanged: (int v) => setState(() => _active = v),
            itemBuilder: (BuildContext ctx, int i) => Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: _NoticeCard(announcement: _kAnnouncements[i]),
            ),
          ),
        ),
        const SizedBox(height: 10),
        Center(
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: List<Widget>.generate(_kAnnouncements.length, (int i) {
              final bool isActive = i == _active;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: isActive ? 18 : 6,
                height: 6,
                decoration: BoxDecoration(
                  color: isActive ? AppColors.primary : const Color(0xFFCDD9DC),
                  borderRadius: BorderRadius.circular(3),
                ),
              );
            }),
          ),
        ),
      ],
    );
  }
}

class _NoticeCard extends StatelessWidget {
  const _NoticeCard({required this.announcement});

  final _Announcement announcement;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 14, 14, 14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: announcement.gradientColors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: announcement.gradientColors.last.withValues(alpha: 0.35),
            blurRadius: 14,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      announcement.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        height: 1.25,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      announcement.subtitle,
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: Colors.white.withValues(alpha: 0.8),
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    announcement.buttonText,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: announcement.gradientColors.last,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Opacity(
            opacity: 0.25,
            child: Icon(
              announcement.icon,
              size: 72,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Section label ────────────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 20,
        fontWeight: FontWeight.w800,
        color: Color(0xFF16212A),
      ),
    );
  }
}

// ─── Action grid ──────────────────────────────────────────────────────────────

class _ActionGrid extends StatelessWidget {
  const _ActionGrid();

  @override
  Widget build(BuildContext context) {
    final List<_TileData> tiles = <_TileData>[
      _TileData(
        label: 'Gate In/Out',
        icon: Icons.sensor_door_rounded,
        gradient: const [Color(0xFF1A3A44), Color(0xFF2E6B7F)],
        accentColor: const Color(0xFF64D4EE),
        badge: _GateBadge(),
      ),
      _TileData(
        label: 'Attendance',
        icon: Icons.qr_code_scanner_rounded,
        gradient: const [Color(0xFF2D5A8E), Color(0xFF4A90D9)],
        accentColor: const Color(0xFF90CAFF),
        badge: _AttendanceBadge(),
      ),
      _TileData(
        label: 'Complain &\nSuggestions',
        icon: Icons.forum_rounded,
        gradient: const [Color(0xFF5C3D8F), Color(0xFF9067C6)],
        accentColor: const Color(0xFFD4AAFF),
      ),
      _TileData(
        label: 'Contact\nTeacher',
        icon: Icons.support_agent_rounded,
        gradient: const [Color(0xFF1A6B4A), Color(0xFF2EAA75)],
        accentColor: const Color(0xFF80E8B8),
        onTap: (BuildContext ctx) => ctx.push(AppRoutes.messages),
      ),
      _TileData(
        label: 'Lost &\nFound',
        icon: Icons.find_in_page_rounded,
        gradient: const [Color(0xFF7A3D1A), Color(0xFFD47A2E)],
        accentColor: const Color(0xFFFFCC80),
      ),
      _TileData(
        label: 'More',
        icon: Icons.apps_rounded,
        gradient: const [Color(0xFF2E3A4A), Color(0xFF4A5D72)],
        accentColor: const Color(0xFFB0C4D8),
        isMore: true,
      ),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: tiles.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
        childAspectRatio: 1.05,
      ),
      itemBuilder: (BuildContext context, int index) =>
          _ActionTile(data: tiles[index]),
    );
  }
}

class _TileData {
  const _TileData({
    required this.label,
    required this.icon,
    required this.gradient,
    required this.accentColor,
    this.badge,
    this.onTap,
    this.isMore = false,
  });

  final String label;
  final IconData icon;
  final List<Color> gradient;
  final Color accentColor;
  final Widget? badge;
  final void Function(BuildContext)? onTap;
  final bool isMore;
}

class _ActionTile extends StatelessWidget {
  const _ActionTile({required this.data});

  final _TileData data;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: data.onTap != null ? () => data.onTap!(context) : null,
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: data.gradient,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(22),
          boxShadow: [
            BoxShadow(
              color: data.gradient.last.withValues(alpha: 0.35),
              blurRadius: 12,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Stack(
          children: <Widget>[
            // Decorative circle
            Positioned(
              right: -18,
              top: -18,
              child: Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.06),
                ),
              ),
            ),
            Positioned(
              right: 10,
              bottom: -10,
              child: Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.05),
                ),
              ),
            ),
            // Content
            Padding(
              padding: const EdgeInsets.all(16),
              child: data.isMore
                  ? _MoreContent(accentColor: data.accentColor)
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Row(
                          children: <Widget>[
                            Container(
                              width: 42,
                              height: 42,
                              decoration: BoxDecoration(
                                color: data.accentColor.withValues(alpha: 0.18),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(
                                data.icon,
                                size: 22,
                                color: data.accentColor,
                              ),
                            ),
                            if (data.badge != null) ...<Widget>[
                              const Spacer(),
                              data.badge!,
                            ],
                          ],
                        ),
                        const Spacer(),
                        Text(
                          data.label,
                          maxLines: 2,
                          style: const TextStyle(
                            fontFamily: 'Plus Jakarta Sans',
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                            height: 1.25,
                          ),
                        ),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MoreContent extends StatelessWidget {
  const _MoreContent({required this.accentColor});

  final Color accentColor;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: List<Widget>.generate(9, (int i) {
            return Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: accentColor.withValues(alpha: i < 3 ? 0.9 : i < 6 ? 0.5 : 0.25),
                shape: BoxShape.circle,
              ),
            );
          }),
        ),
        const Spacer(),
        const Text(
          'More',
          style: TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
      ],
    );
  }
}

// ─── Live badge widgets ───────────────────────────────────────────────────────

class _GateBadge extends StatefulWidget {
  @override
  State<_GateBadge> createState() => _GateBadgeState();
}

class _GateBadgeState extends State<_GateBadge>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulse;

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: Tween<double>(begin: 0.4, end: 1).animate(_pulse),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
        decoration: BoxDecoration(
          color: const Color(0xFF4ADE80).withValues(alpha: 0.2),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: const Color(0xFF4ADE80).withValues(alpha: 0.5),
          ),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            CircleAvatar(
              radius: 3,
              backgroundColor: Color(0xFF4ADE80),
            ),
            SizedBox(width: 4),
            Text(
              'LIVE',
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 9,
                fontWeight: FontWeight.w800,
                color: Color(0xFF4ADE80),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AttendanceBadge extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Text(
        '85%',
        style: TextStyle(
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 11,
          fontWeight: FontWeight.w800,
          color: Colors.white,
        ),
      ),
    );
  }
}

// ─── Bottom nav ───────────────────────────────────────────────────────────────

class _BottomNavBar extends StatelessWidget {
  const _BottomNavBar({required this.bottomInset});

  final double bottomInset;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: const BorderRadius.only(
        topLeft: Radius.circular(36),
        topRight: Radius.circular(36),
      ),
      child: Container(
        height: 72 + bottomInset,
        padding: EdgeInsets.only(bottom: bottomInset),
        color: const Color(0xFF1A3A44),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: <Widget>[
            _NavItem(icon: Icons.home_filled, label: 'Home', isActive: true),
            _NavItem(icon: Icons.notifications_none_rounded, label: 'Notifications'),
            _NavItem(icon: Icons.smart_toy_outlined, label: 'Chat Bot'),
            _NavItem(icon: Icons.settings_outlined, label: 'Settings'),
          ],
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.label,
    this.isActive = false,
  });

  final IconData icon;
  final String label;
  final bool isActive;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        if (isActive)
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 22, color: Colors.white),
          )
        else
          Icon(icon, size: 22, color: Colors.white.withValues(alpha: 0.55)),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 10,
            fontWeight: isActive ? FontWeight.w800 : FontWeight.w500,
            color: Colors.white.withValues(alpha: isActive ? 1.0 : 0.55),
          ),
        ),
      ],
    );
  }
}
