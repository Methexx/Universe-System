import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:universe_app/core/constants/app_colors.dart';

// ─── Model ────────────────────────────────────────────────────────────────────

class NotificationItem {
  NotificationItem({
    required this.id,
    required this.category,
    required this.title,
    required this.body,
    required this.time,
    required this.icon,
    required this.gradientColors,
    this.isRead = false,
  });

  final String id;
  final String category;
  final String title;
  final String body;
  final String time;
  final IconData icon;
  final List<Color> gradientColors;
  bool isRead;
}

List<NotificationItem> kNotifications = [
  NotificationItem(
    id: '1',
    category: 'Payment',
    title: 'Canteen balance low',
    body: 'Your canteen balance is below Rs. 200. Top up now to avoid disruption during lunch.',
    time: '5 min ago',
    icon: Icons.account_balance_wallet_rounded,
    gradientColors: const [Color(0xFF64C4E6), Color(0xFF3EA8D8)],
    isRead: false,
  ),
  NotificationItem(
    id: '2',
    category: 'Academic',
    title: 'Assignment deadline today',
    body: 'SE2045 – Software Architecture assignment is due at 11:59 PM tonight. Submit via the portal.',
    time: '18 min ago',
    icon: Icons.assignment_rounded,
    gradientColors: const [Color(0xFF8CB2FF), Color(0xFF5B82F0)],
    isRead: false,
  ),
  NotificationItem(
    id: '3',
    category: 'Security',
    title: 'New login detected',
    body: "A new login to your account was detected from a new device. If this wasn't you, contact support immediately.",
    time: '52 min ago',
    icon: Icons.security_rounded,
    gradientColors: const [Color(0xFFFF8FAB), Color(0xFFD94F72)],
    isRead: false,
  ),
  NotificationItem(
    id: '4',
    category: 'Gate',
    title: 'Gate out recorded',
    body: 'Your gate-out was recorded at 12:34 PM today. If this is incorrect, please contact the front office.',
    time: '2 h ago',
    icon: Icons.sensor_door_rounded,
    gradientColors: const [Color(0xFF77C8A8), Color(0xFF3DAA82)],
    isRead: false,
  ),
  NotificationItem(
    id: '5',
    category: 'Reminder',
    title: 'Library book due tomorrow',
    body: '"Clean Code" borrowed on 24 Apr is due for return tomorrow. Renew online to avoid fines.',
    time: '3 h ago',
    icon: Icons.menu_book_rounded,
    gradientColors: const [Color(0xFFFFB38A), Color(0xFFE8845A)],
    isRead: true,
  ),
  NotificationItem(
    id: '6',
    category: 'Event',
    title: 'Hackathon registration confirmed',
    body: 'You have successfully registered for Hackathon 2026. Check your email for team details and venue info.',
    time: 'Yesterday',
    icon: Icons.code_rounded,
    gradientColors: const [Color(0xFFD4AAFF), Color(0xFF9067C6)],
    isRead: true,
  ),
  NotificationItem(
    id: '7',
    category: 'Result',
    title: 'Mid-term results published',
    body: 'Your mid-term results for Semester 2 are now available. Log in to the portal to view your grades.',
    time: 'Yesterday',
    icon: Icons.bar_chart_rounded,
    gradientColors: const [Color(0xFF80E8B8), Color(0xFF2EAA75)],
    isRead: true,
  ),
  NotificationItem(
    id: '8',
    category: 'Reminder',
    title: 'Attendance below threshold',
    body: 'Your attendance for SE1095 has dropped to 74%, below the 75% requirement. Please attend upcoming classes.',
    time: '2 days ago',
    icon: Icons.warning_amber_rounded,
    gradientColors: const [Color(0xFFFFCC80), Color(0xFFD47A2E)],
    isRead: true,
  ),
];

// ─── Screen ───────────────────────────────────────────────────────────────────

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen>
    with TickerProviderStateMixin {
  late final AnimationController _entryCtrl;
  late final Animation<Offset> _slideAnim;
  late final Animation<double> _fadeAnim;
  late final TabController _tabCtrl;

  @override
  void initState() {
    super.initState();
    _entryCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _slideAnim = Tween<Offset>(begin: const Offset(0, 0.12), end: Offset.zero)
        .animate(CurvedAnimation(parent: _entryCtrl, curve: Curves.easeOutCubic));
    _fadeAnim = CurvedAnimation(parent: _entryCtrl, curve: Curves.easeOut);
    _tabCtrl = TabController(length: 2, vsync: this);
    _entryCtrl.forward();
  }

  @override
  void dispose() {
    _entryCtrl.dispose();
    _tabCtrl.dispose();
    super.dispose();
  }

  List<NotificationItem> get _unread =>
      kNotifications.where((n) => !n.isRead).toList();
  List<NotificationItem> get _read =>
      kNotifications.where((n) => n.isRead).toList();

  void _markAllRead() {
    setState(() {
      for (final n in kNotifications) {
        n.isRead = true;
      }
    });
  }

  void _markRead(String id) {
    setState(() {
      kNotifications.firstWhere((n) => n.id == id).isRead = true;
    });
  }

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
                      _buildTabBar(),
                      Expanded(
                        child: TabBarView(
                          controller: _tabCtrl,
                          children: [
                            _NotificationList(
                              items: _unread,
                              emptyMessage: 'You\'re all caught up!',
                              emptyIcon: Icons.done_all_rounded,
                              controller: _entryCtrl,
                              onMarkRead: _markRead,
                              bottomInset: bottomInset,
                            ),
                            _NotificationList(
                              items: _read,
                              emptyMessage: 'No read notifications',
                              emptyIcon: Icons.notifications_off_rounded,
                              controller: _entryCtrl,
                              onMarkRead: _markRead,
                              bottomInset: bottomInset,
                            ),
                          ],
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
    final int unreadCount = _unread.length;
    return Container(
      width: double.infinity,
      padding: EdgeInsets.fromLTRB(18, 14 + topInset, 18, 24),
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
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text(
                      'Notifications',
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                    if (unreadCount > 0) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFDF5B6D),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '$unreadCount',
                          style: const TextStyle(
                            fontFamily: 'Plus Jakarta Sans',
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  unreadCount > 0
                      ? '$unreadCount unread messages'
                      : 'All caught up',
                  style: const TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: Colors.white60,
                  ),
                ),
              ],
            ),
          ),
          if (_unread.isNotEmpty)
            GestureDetector(
              onTap: _markAllRead,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'Mark all read',
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildTabBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 16, 18, 4),
      child: Container(
        height: 44,
        decoration: BoxDecoration(
          color: const Color(0xFFE4EFF2),
          borderRadius: BorderRadius.circular(14),
        ),
        child: TabBar(
          controller: _tabCtrl,
          indicator: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(11),
          ),
          indicatorSize: TabBarIndicatorSize.tab,
          dividerColor: Colors.transparent,
          labelStyle: const TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 13,
            fontWeight: FontWeight.w700,
          ),
          unselectedLabelStyle: const TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
          labelColor: Colors.white,
          unselectedLabelColor: const Color(0xFF90A4AE),
          tabs: [
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Unread'),
                  if (_unread.isNotEmpty) ...[
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 1),
                      decoration: BoxDecoration(
                        color: const Color(0xFFDF5B6D),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '${_unread.length}',
                        style: const TextStyle(
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const Tab(text: 'Read'),
          ],
        ),
      ),
    );
  }
}

// ─── Notification List ────────────────────────────────────────────────────────

class _NotificationList extends StatelessWidget {
  const _NotificationList({
    required this.items,
    required this.emptyMessage,
    required this.emptyIcon,
    required this.controller,
    required this.onMarkRead,
    required this.bottomInset,
  });

  final List<NotificationItem> items;
  final String emptyMessage;
  final IconData emptyIcon;
  final AnimationController controller;
  final ValueChanged<String> onMarkRead;
  final double bottomInset;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(emptyIcon, size: 56, color: const Color(0xFFCDD9DC)),
            const SizedBox(height: 14),
            Text(
              emptyMessage,
              style: const TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: Color(0xFF90A4AE),
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      physics: const BouncingScrollPhysics(),
      padding: EdgeInsets.fromLTRB(18, 10, 18, bottomInset + 100),
      itemCount: items.length,
      itemBuilder: (context, i) => _NotificationCard(
        item: items[i],
        index: i,
        controller: controller,
        onMarkRead: onMarkRead,
      ),
    );
  }
}

// ─── Notification Card ────────────────────────────────────────────────────────

class _NotificationCard extends StatefulWidget {
  const _NotificationCard({
    required this.item,
    required this.index,
    required this.controller,
    required this.onMarkRead,
  });

  final NotificationItem item;
  final int index;
  final AnimationController controller;
  final ValueChanged<String> onMarkRead;

  @override
  State<_NotificationCard> createState() => _NotificationCardState();
}

class _NotificationCardState extends State<_NotificationCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final Animation<double> stagger = CurvedAnimation(
      parent: widget.controller,
      curve: Interval(
        (0.08 + widget.index * 0.08).clamp(0.0, 0.9),
        1.0,
        curve: Curves.easeOutCubic,
      ),
    );

    return FadeTransition(
      opacity: stagger,
      child: SlideTransition(
        position: Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero)
            .animate(stagger),
        child: GestureDetector(
          onTap: () {
            setState(() => _expanded = !_expanded);
            if (!widget.item.isRead) {
              widget.onMarkRead(widget.item.id);
            }
          },
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: widget.item.isRead
                  ? Colors.white
                  : Colors.white,
              borderRadius: BorderRadius.circular(22),
              boxShadow: [
                BoxShadow(
                  color: widget.item.isRead
                      ? Colors.black.withValues(alpha: 0.04)
                      : widget.item.gradientColors.last.withValues(alpha: 0.15),
                  blurRadius: widget.item.isRead ? 8 : 16,
                  offset: const Offset(0, 4),
                ),
              ],
              border: widget.item.isRead
                  ? null
                  : Border.all(
                      color: widget.item.gradientColors.first
                          .withValues(alpha: 0.25),
                      width: 1.2,
                    ),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(22),
              child: Column(
                children: [
                  // Unread accent bar
                  if (!widget.item.isRead)
                    Container(
                      height: 3,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: widget.item.gradientColors,
                        ),
                      ),
                    ),
                  Padding(
                    padding: const EdgeInsets.all(14),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Icon
                        Container(
                          width: 46,
                          height: 46,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: widget.item.gradientColors,
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [
                              BoxShadow(
                                color: widget.item.gradientColors.last
                                    .withValues(alpha: 0.35),
                                blurRadius: 8,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Icon(widget.item.icon,
                              color: Colors.white, size: 22),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: widget.item.gradientColors.first
                                          .withValues(alpha: 0.12),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      widget.item.category,
                                      style: TextStyle(
                                        fontFamily: 'Plus Jakarta Sans',
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                        color:
                                            widget.item.gradientColors.last,
                                      ),
                                    ),
                                  ),
                                  const Spacer(),
                                  Text(
                                    widget.item.time,
                                    style: const TextStyle(
                                      fontFamily: 'Plus Jakarta Sans',
                                      fontSize: 10,
                                      fontWeight: FontWeight.w500,
                                      color: Color(0xFFB0BEC5),
                                    ),
                                  ),
                                  if (!widget.item.isRead) ...[
                                    const SizedBox(width: 6),
                                    Container(
                                      width: 7,
                                      height: 7,
                                      decoration: const BoxDecoration(
                                        color: Color(0xFFDF5B6D),
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 5),
                              Text(
                                widget.item.title,
                                style: TextStyle(
                                  fontFamily: 'Plus Jakarta Sans',
                                  fontSize: 13,
                                  fontWeight: widget.item.isRead
                                      ? FontWeight.w600
                                      : FontWeight.w800,
                                  color: const Color(0xFF16212A),
                                  height: 1.3,
                                ),
                              ),
                              if (!_expanded) ...[
                                const SizedBox(height: 3),
                                Text(
                                  widget.item.body,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontFamily: 'Plus Jakarta Sans',
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: Color(0xFF90A4AE),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                        const SizedBox(width: 4),
                        AnimatedRotation(
                          turns: _expanded ? 0.5 : 0,
                          duration: const Duration(milliseconds: 260),
                          child: const Icon(Icons.keyboard_arrow_down_rounded,
                              color: Color(0xFFB0BEC5), size: 20),
                        ),
                      ],
                    ),
                  ),
                  // Expanded body
                  AnimatedCrossFade(
                    firstChild: const SizedBox(width: double.infinity),
                    secondChild: Column(
                      children: [
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 14),
                          child: Divider(height: 1, color: Color(0xFFF0F5F7)),
                        ),
                        Padding(
                          padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 3,
                                height: 52,
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: widget.item.gradientColors,
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                  ),
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  widget.item.body,
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
                    duration: const Duration(milliseconds: 260),
                    sizeCurve: Curves.easeInOut,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Unread Popup (used from dashboard bell) ──────────────────────────────────

class UnreadNotificationPopup extends StatefulWidget {
  const UnreadNotificationPopup({
    super.key,
    required this.onViewAll,
    required this.onDismiss,
  });

  final VoidCallback onViewAll;
  final VoidCallback onDismiss;

  @override
  State<UnreadNotificationPopup> createState() =>
      _UnreadNotificationPopupState();
}

class _UnreadNotificationPopupState extends State<UnreadNotificationPopup>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _scale;
  late final Animation<double> _fade;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 320));
    _scale = CurvedAnimation(parent: _ctrl, curve: Curves.easeOutBack);
    _fade = CurvedAnimation(parent: _ctrl, curve: Curves.easeOut);
    _ctrl.forward();
  }

  Future<void> _dismiss() async {
    await _ctrl.reverse();
    widget.onDismiss();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final unread = kNotifications.where((n) => !n.isRead).toList();
    if (unread.isEmpty) return const SizedBox.shrink();
    final latest = unread.first;

    return FadeTransition(
      opacity: _fade,
      child: ScaleTransition(
        scale: _scale,
        alignment: Alignment.topRight,
        child: GestureDetector(
          onTap: _dismiss,
          child: Container(
            width: 280,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: latest.gradientColors.last.withValues(alpha: 0.22),
                  blurRadius: 24,
                  offset: const Offset(0, 8),
                ),
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.10),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.88),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: latest.gradientColors.first.withValues(alpha: 0.2),
                      width: 1,
                    ),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Top accent
                      Container(
                        height: 3,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: latest.gradientColors,
                          ),
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(20),
                            topRight: Radius.circular(20),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(14, 12, 14, 0),
                        child: Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                    colors: latest.gradientColors,
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight),
                                borderRadius: BorderRadius.circular(11),
                              ),
                              child: Icon(latest.icon,
                                  color: Colors.white, size: 18),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 7, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: latest.gradientColors.first
                                              .withValues(alpha: 0.14),
                                          borderRadius:
                                              BorderRadius.circular(10),
                                        ),
                                        child: Text(
                                          latest.category,
                                          style: TextStyle(
                                            fontFamily: 'Plus Jakarta Sans',
                                            fontSize: 9,
                                            fontWeight: FontWeight.w700,
                                            color: latest.gradientColors.last,
                                          ),
                                        ),
                                      ),
                                      const Spacer(),
                                      Text(
                                        latest.time,
                                        style: const TextStyle(
                                          fontFamily: 'Plus Jakarta Sans',
                                          fontSize: 9,
                                          fontWeight: FontWeight.w500,
                                          color: Color(0xFFB0BEC5),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    latest.title,
                                    style: const TextStyle(
                                      fontFamily: 'Plus Jakarta Sans',
                                      fontSize: 13,
                                      fontWeight: FontWeight.w800,
                                      color: Color(0xFF16212A),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(14, 8, 14, 0),
                        child: Text(
                          latest.body,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontFamily: 'Plus Jakarta Sans',
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF546E7A),
                            height: 1.5,
                          ),
                        ),
                      ),
                      if (unread.length > 1)
                        Padding(
                          padding: const EdgeInsets.fromLTRB(14, 8, 14, 0),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.07),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '+${unread.length - 1} more unread notification${unread.length - 1 > 1 ? 's' : ''}',
                              style: TextStyle(
                                fontFamily: 'Plus Jakarta Sans',
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        ),
                      Padding(
                        padding: const EdgeInsets.all(14),
                        child: Row(
                          children: [
                            Expanded(
                              child: GestureDetector(
                                onTap: _dismiss,
                                child: Container(
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 9),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF0F5F7),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Center(
                                    child: Text(
                                      'Dismiss',
                                      style: TextStyle(
                                        fontFamily: 'Plus Jakarta Sans',
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFF90A4AE),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: GestureDetector(
                                onTap: widget.onViewAll,
                                child: Container(
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 9),
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: latest.gradientColors,
                                    ),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Center(
                                    child: Text(
                                      'View All',
                                      style: TextStyle(
                                        fontFamily: 'Plus Jakarta Sans',
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
