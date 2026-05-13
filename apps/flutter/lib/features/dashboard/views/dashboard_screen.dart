import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:universe_app/core/constants/app_routes.dart';
import 'package:universe_app/core/constants/app_colors.dart';
import 'package:universe_app/features/auth/viewmodels/auth_viewmodel.dart';
import 'package:universe_app/features/notifications/views/notifications_screen.dart';
import 'package:universe_app/features/gate/viewmodels/gate_viewmodel.dart';
import 'package:universe_app/features/profile/viewmodels/profile_viewmodel.dart';
import 'package:universe_app/features/notices/models/announcement_model.dart';
import 'package:universe_app/features/notices/viewmodels/notices_viewmodel.dart';
import 'package:universe_app/shared/widgets/action_card.dart';
import 'package:universe_app/shared/widgets/live_clock_widget.dart';

ImageProvider? _resolveImage(String? url) {
  if (url == null) return null;
  if (url.startsWith('data:image')) {
    final int comma = url.indexOf(',');
    if (comma == -1) return null;
    final Uint8List bytes = base64Decode(url.substring(comma + 1));
    return MemoryImage(bytes);
  }
  return NetworkImage(url);
}

// ─── Screen ───────────────────────────────────────────────────────────────────

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _entryController;
  late final Animation<Offset> _slideAnim;
  late final Animation<double> _fadeAnim;

  OverlayEntry? _bellOverlay;

  @override
  void initState() {
    super.initState();
    _entryController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.18),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _entryController,
      curve: Curves.easeOutCubic,
    ));
    _fadeAnim = CurvedAnimation(
      parent: _entryController,
      curve: Curves.easeOut,
    );
    _entryController.forward();

    // Fetch fresh profile data and gate status
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<ProfileViewModel>().loadProfile();
        context.read<GateViewModel>().loadGateStatus();
      }
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
  }

  void _playEntryAnimation() {
    _entryController.forward(from: 0);
  }

  void _showBellPopup() {
    final unread = kNotifications.where((n) => !n.isRead).toList();
    if (unread.isEmpty) {
      context.push(AppRoutes.notifications);
      return;
    }
    if (_bellOverlay != null) {
      _dismissBellPopup();
      return;
    }
    final topInset = MediaQuery.paddingOf(context).top;
    _bellOverlay = OverlayEntry(
      builder: (_) => _BellOverlay(
        topInset: topInset,
        onViewAll: () {
          _dismissBellPopup();
          context.push(AppRoutes.notifications);
        },
        onDismiss: _dismissBellPopup,
        onBarrierTap: _dismissBellPopup,
      ),
    );
    Overlay.of(context).insert(_bellOverlay!);
  }

  void _dismissBellPopup() {
    _bellOverlay?.remove();
    _bellOverlay = null;
  }

  @override
  void dispose() {
    _dismissBellPopup();
    _entryController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final String? studentName = context.select<ProfileViewModel, String?>(
      (ProfileViewModel vm) => vm.profile?.student?.fullName,
    );
    final String? photoUrl = context.select<ProfileViewModel, String?>(
      (ProfileViewModel vm) => vm.profile?.student?.photoUrl,
    );
    final String? userEmail = context.select<AuthViewModel, String?>(
      (AuthViewModel vm) => vm.currentUser?.email,
    );
    final bool? isInsideSchool = context.select<GateViewModel, bool?>(
      (GateViewModel vm) => vm.isInsideSchool,
    );
    final String displayName = studentName ?? _displayNameFromEmail(userEmail);
    final double topInset = MediaQuery.paddingOf(context).top;
    final double bottomInset = MediaQuery.paddingOf(context).bottom;
    const double navBarHeight = 72;

    return Scaffold(
      backgroundColor: AppColors.primary,
      body: Stack(
        children: <Widget>[
          // Scrollable content
          SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              children: <Widget>[
                _TopHeader(
                  displayName: displayName,
                  photoUrl: photoUrl,
                  isInsideSchool: isInsideSchool,
                  topInset: topInset,
                  onBellTap: _showBellPopup,
                ),
                // Slide-up + fade for white card section
                SlideTransition(
                  position: _slideAnim,
                  child: FadeTransition(
                    opacity: _fadeAnim,
                    child: Container(
                      width: double.infinity,
                      clipBehavior: Clip.none,
                      decoration: const BoxDecoration(
                        color: Color(0xFFF4FAFB),
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(32),
                          topRight: Radius.circular(32),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Padding(
                            padding: const EdgeInsets.fromLTRB(18, 24, 18, 0),
                            child: const _NoticesSection(),
                          ),
                          Padding(
                            padding: const EdgeInsets.fromLTRB(18, 28, 18, 24),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                const _SectionLabel('Quick Actions'),
                                const SizedBox(height: 6),
                                _ActionGrid(
                                  onGateTap: () async {
                                    await context.push(AppRoutes.gateStatus);
                                    _playEntryAnimation();
                                  },
                                  onAttendanceTap: () async {
                                    await context.push(AppRoutes.attendance);
                                    _playEntryAnimation();
                                  },
                                ),
                                SizedBox(height: bottomInset + navBarHeight + 16),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Bottom nav — also slides up
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: SlideTransition(
              position: Tween<Offset>(
                begin: const Offset(0, 1.0),
                end: Offset.zero,
              ).animate(CurvedAnimation(
                parent: _entryController,
                curve: const Interval(0.2, 1.0, curve: Curves.easeOutCubic),
              )),
              child: _BottomNavBar(bottomInset: bottomInset),
            ),
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
  const _TopHeader({
    required this.displayName,
    required this.topInset,
    required this.onBellTap,
    this.photoUrl,
    this.isInsideSchool,
  });

  final String displayName;
  final String? photoUrl;
  final bool? isInsideSchool;
  final double topInset;
  final VoidCallback onBellTap;

  @override
  State<_TopHeader> createState() => _TopHeaderState();
}

class _TopHeaderState extends State<_TopHeader> with TickerProviderStateMixin {
  late DateTime _now;
  late Timer _timer;
  late AnimationController _blinkController;
  late Animation<double> _blinkAnim;

  @override
  void initState() {
    super.initState();
    _now = DateTime.now();
    // Tick every minute instead of every second for the greeting 
    // to prevent unnecessary rebuilds that cause avatar flickering.
    _timer = Timer.periodic(const Duration(minutes: 1), (_) {
      if (mounted) setState(() => _now = DateTime.now());
    });

    _blinkController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);

    _blinkAnim = Tween<double>(begin: 0.3, end: 1.0).animate(
      CurvedAnimation(parent: _blinkController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _timer.cancel();
    _blinkController.dispose();
    super.dispose();
  }

  String get _greeting {
    final int h = _now.hour;
    if (h < 12) return 'Good Morning !';
    if (h < 17) return 'Good Afternoon !';
    return 'Good Evening !';
  }

  ImageProvider? _cachedProvider;
  String? _lastUrl;

  ImageProvider? _getProvider(String? url) {
    if (url == null) return null;
    if (url == _lastUrl) return _cachedProvider;
    _lastUrl = url;
    _cachedProvider = _resolveImage(url);
    return _cachedProvider;
  }

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
              GestureDetector(
                onTap: () => context.push(AppRoutes.profile),
                child: Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white24, width: 2),
                  ),
                  child: CircleAvatar(
                    radius: 24,
                    backgroundColor: const Color(0xFFE3C091),
                    backgroundImage: _getProvider(widget.photoUrl),
                    child: widget.photoUrl == null
                        ? const Icon(Icons.person, color: Color(0xFF374151), size: 24)
                        : null,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    widget.displayName,
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
              GestureDetector(
                onTap: widget.onBellTap,
                child: Stack(
                  children: <Widget>[
                    Container(
                      width: 44,
                      height: 44,
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.notifications_rounded,
                        color: AppColors.primary,
                        size: 24,
                      ),
                    ),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          color: const Color(0xFFDF5B6D),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 1.5),
                        ),
                      ),
                    ),
                  ],
                ),
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
                    AnimatedBuilder(
                      animation: _blinkAnim,
                      builder: (context, child) {
                        final bool isInside = widget.isInsideSchool ?? false;
                        final Color baseColor =
                            isInside ? const Color(0xFF4ADE80) : const Color(0xFFDF5B6D);
                        return Opacity(
                          opacity: _blinkAnim.value,
                          child: Container(
                            width: 9,
                            height: 9,
                            decoration: BoxDecoration(
                              color: baseColor,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: baseColor.withValues(alpha: 0.4),
                                  blurRadius: 4,
                                  spreadRadius: 1,
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
              // Live clock — shared component with blinking colon
              const LiveClockWidget(),
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
  static const int _kLargeItemCount = 10000;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(
      viewportFraction: 0.92,
      initialPage: 0,
    );

    _timer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (!_pageController.hasClients) return;
      final List<AnnouncementModel> items =
          context.read<NoticesViewModel>().dashboardAnnouncements;
      if (items.isEmpty) return;
      _pageController.nextPage(
        duration: const Duration(milliseconds: 600),
        curve: Curves.easeInOutCubic,
      );
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<NoticesViewModel>().loadAnnouncements();
      }
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
    final vm = context.watch<NoticesViewModel>();
    final List<AnnouncementModel> announcements = vm.dashboardAnnouncements;

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
            GestureDetector(
              onTap: () => context.push(AppRoutes.notices),
              child: Text(
                'View All',
                style: TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primary.withValues(alpha: 0.55),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 162,
          child: vm.isLoading || announcements.isEmpty
              ? Center(
                  child: vm.error != null
                      ? const Icon(Icons.wifi_off_rounded,
                          color: Color(0xFFCDD9DC), size: 36)
                      : const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                )
              : PageView.builder(
                  controller: _pageController,
                  clipBehavior: Clip.none,
                  itemCount: _kLargeItemCount,
                  onPageChanged: (int v) => setState(
                    () => _active = announcements.isEmpty
                        ? 0
                        : v % announcements.length,
                  ),
                  itemBuilder: (BuildContext ctx, int i) {
                    final int index = i % announcements.length;
                    return Padding(
                      padding: const EdgeInsets.fromLTRB(6, 4, 6, 10),
                      child: _NoticeCard(announcement: announcements[index]),
                    );
                  },
                ),
        ),
        const SizedBox(height: 10),
        if (announcements.isNotEmpty)
          Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children:
                  List<Widget>.generate(announcements.length, (int i) {
                final bool isActive = i == _active;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  width: isActive ? 18 : 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: isActive
                        ? AppColors.primary
                        : const Color(0xFFCDD9DC),
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

  final AnnouncementModel announcement;

  @override
  Widget build(BuildContext context) {
    final String subtitle = announcement.content.length > 50
        ? '${announcement.content.substring(0, 50)}…'
        : announcement.content;

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
                      subtitle,
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
                    'Read More',
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
  const _ActionGrid({this.onGateTap, this.onAttendanceTap});

  final VoidCallback? onGateTap;
  final VoidCallback? onAttendanceTap;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: 14,
      mainAxisSpacing: 14,
      childAspectRatio: 1.05,
      children: <Widget>[
        ActionCard(
          cardIndex: 0,
          label: 'Gate In/Out',
          icon: Icons.sensor_door_rounded,
          gradient: const [Color(0xFF1A3A44), Color(0xFF2E6B7F)],
          accentColor: const Color(0xFF64D4EE),
          badge: _GateBadge(),
          onTap: onGateTap,
        ),
        ActionCard(
          cardIndex: 1,
          label: 'Attendance',
          icon: Icons.qr_code_scanner_rounded,
          gradient: const [Color(0xFF2D5A8E), Color(0xFF4A90D9)],
          accentColor: const Color(0xFF90CAFF),
          badge: _AttendanceBadge(),
          onTap: onAttendanceTap,
        ),
        ActionCard(
          cardIndex: 2,
          label: 'Complain &\nSuggestions',
          icon: Icons.forum_rounded,
          gradient: const [Color(0xFF5C3D8F), Color(0xFF9067C6)],
          accentColor: const Color(0xFFD4AAFF),
          onTap: () => context.push(AppRoutes.support),
        ),
        Builder(
          builder: (context) {
            final role = context.read<AuthViewModel>().currentUser?.role;
            if (role == 'teacher') {
              return ActionCard(
                cardIndex: 3,
                label: 'Messages\nInbox',
                icon: Icons.mark_email_unread_rounded,
                gradient: const [Color(0xFF1A6B4A), Color(0xFF2EAA75)],
                accentColor: const Color(0xFF80E8B8),
                onTap: () => context.push(AppRoutes.teacherInbox),
              );
            }
            return ActionCard(
              cardIndex: 3,
              label: 'Contact\nTeacher',
              icon: Icons.support_agent_rounded,
              gradient: const [Color(0xFF1A6B4A), Color(0xFF2EAA75)],
              accentColor: const Color(0xFF80E8B8),
              onTap: () => context.push(AppRoutes.teacherChat),
            );
          },
        ),
        ActionCard(
          cardIndex: 4,
          label: 'Lost &\nFound',
          icon: Icons.find_in_page_rounded,
          gradient: const [Color(0xFF7A3D1A), Color(0xFFD47A2E)],
          accentColor: const Color(0xFFFFCC80),
          onTap: () => context.push(AppRoutes.lostAndFound),
        ),
        ActionCard(
          cardIndex: 5,
          label: 'Results',
          icon: Icons.bar_chart_rounded,
          gradient: const [Color(0xFF1A4A35), Color(0xFF2E7A58)],
          accentColor: const Color(0xFF80E8B8),
          badge: const _ResultsBadge(),
          onTap: () => context.push(AppRoutes.results),
        ),
      ],
    );
  }
}

class _ResultsBadge extends StatelessWidget {
  const _ResultsBadge();

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List<Widget>.generate(3, (int i) {
        return Container(
          margin: const EdgeInsets.only(left: 3),
          width: 5,
          height: 5,
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: i == 0 ? 0.9 : i == 1 ? 0.55 : 0.25),
            shape: BoxShape.circle,
          ),
        );
      }),
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
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: <Widget>[
            _NavItem(
              icon: Icons.home_filled,
              label: 'Home',
              isActive: true,
              onTap: () {},
            ),
            _NavItem(
              icon: Icons.notifications_rounded,
              label: 'Notifications',
              onTap: () => context.push(AppRoutes.notifications),
            ),
            _NavItem(
              icon: Icons.smart_toy_outlined,
              label: 'Chat Bot',
              onTap: () => context.push(AppRoutes.chatbot),
            ),
            _NavItem(
              icon: Icons.settings_outlined,
              label: 'Settings',
              onTap: () => context.push(AppRoutes.settings),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Bell overlay (blurred backdrop + popup) ──────────────────────────────────

class _BellOverlay extends StatelessWidget {
  const _BellOverlay({
    required this.topInset,
    required this.onViewAll,
    required this.onDismiss,
    required this.onBarrierTap,
  });

  final double topInset;
  final VoidCallback onViewAll;
  final VoidCallback onDismiss;
  final VoidCallback onBarrierTap;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Blurred barrier
        Positioned.fill(
          child: GestureDetector(
            onTap: onBarrierTap,
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 4, sigmaY: 4),
              child: Container(color: Colors.black.withValues(alpha: 0.18)),
            ),
          ),
        ),
        // Popup anchored to top-right
        Positioned(
          top: topInset + 66,
          right: 18,
          child: UnreadNotificationPopup(
            onViewAll: onViewAll,
            onDismiss: onDismiss,
          ),
        ),
      ],
    );
  }
}

// ─── Nav item ─────────────────────────────────────────────────────────────────

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.label,
    this.isActive = false,
    this.onTap,
  });

  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        child: Column(
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
        ),
      ),
    );
  }
}
