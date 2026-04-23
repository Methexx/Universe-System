import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:universe_app/features/auth/viewmodels/auth_viewmodel.dart';

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

    return Scaffold(
      backgroundColor: const Color(0xFF63BEDB),
      body: Column(
        children: <Widget>[
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: <Widget>[
                  _TopHeader(displayName: displayName, topInset: topInset),
                  Container(
                    width: double.infinity,
                    color: const Color(0xFFF2F2F2),
                    padding: const EdgeInsets.fromLTRB(18, 22, 18, 24),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        _UpdatesSection(),
                        SizedBox(height: 22),
                        _ActionGrid(),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          _BottomNavBar(bottomInset: bottomInset),
        ],
      ),
    );
  }

  String _displayNameFromEmail(String? email) {
    if (email == null || email.trim().isEmpty) {
      return 'Student';
    }
    final String localPart = email.split('@').first;
    final String cleaned = localPart.replaceAll(RegExp(r'[._-]+'), ' ').trim();
    if (cleaned.isEmpty) {
      return 'Student';
    }
    return cleaned
        .split(' ')
        .where((String part) => part.isNotEmpty)
        .map((String part) =>
            '${part[0].toUpperCase()}${part.substring(1).toLowerCase()}')
        .join(' ');
  }
}

class _TopHeader extends StatelessWidget {
  const _TopHeader({required this.displayName, required this.topInset});

  final String displayName;
  final double topInset;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.fromLTRB(18, 14 + topInset, 18, 18),
      decoration: const BoxDecoration(
        color: Color(0xFF63BEDB),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(34),
          bottomRight: Radius.circular(34),
        ),
      ),
      child: Column(
        children: <Widget>[
          Row(
            children: <Widget>[
              const CircleAvatar(
                radius: 18,
                backgroundColor: Color(0xFFE3C091),
                child: Icon(Icons.person, color: Color(0xFF374151), size: 18),
              ),
              const Spacer(),
              Container(
                width: 38,
                height: 38,
                decoration: const BoxDecoration(
                  color: Color(0xFFF4F7FB),
                  shape: BoxShape.circle,
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: const <Widget>[
                    Icon(
                      Icons.notifications_none_rounded,
                      color: Color(0xFF233047),
                      size: 21,
                    ),
                    Positioned(
                      top: 10,
                      right: 10,
                      child: CircleAvatar(
                        radius: 3,
                        backgroundColor: Color(0xFFDF5B6D),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      'Hi $displayName',
                      style: const TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF133244),
                      ),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'Good Morning !',
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 30,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF0E1A24),
                        height: 1.1,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                width: 78,
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFF5F5F5),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF1F2A37), width: 1.5),
                  boxShadow: const <BoxShadow>[
                    BoxShadow(
                      color: Color(0x33000000),
                      blurRadius: 8,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: const Column(
                  children: <Widget>[
                    Text(
                      'Sept 23',
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    SizedBox(height: 1),
                    Text(
                      '09:48',
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF111827),
                        height: 1,
                      ),
                    ),
                    Text(
                      'AM',
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF111827),
                        height: 1,
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

class _UpdatesSection extends StatefulWidget {
  const _UpdatesSection();

  @override
  State<_UpdatesSection> createState() => _UpdatesSectionState();
}

class _UpdatesSectionState extends State<_UpdatesSection> {
  static const List<_Announcement> _announcements = <_Announcement>[
    _Announcement(
      title: 'We have cancel today\nlectures',
      moduleCode: 'Module Code SE2295',
      buttonText: 'Sign Up',
      backgroundColor: Color(0xFF64C4E6),
    ),
    _Announcement(
      title: 'Library extended\nopening hours',
      moduleCode: 'Open till 10:00 PM',
      buttonText: 'Read More',
      backgroundColor: Color(0xFF77C8A8),
    ),
    _Announcement(
      title: 'Hackathon 2026\nregistration open',
      moduleCode: 'Starts this Friday',
      buttonText: 'Join Now',
      backgroundColor: Color(0xFF8CB2FF),
    ),
    _Announcement(
      title: 'Career fair this\nWednesday',
      moduleCode: 'Hall B - 9:00 AM',
      buttonText: 'Reserve',
      backgroundColor: Color(0xFF90C9DB),
    ),
  ];

  late final PageController _pageController;
  Timer? _autoSlideTimer;
  int _activeIndex = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(viewportFraction: 0.92);
    _autoSlideTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      if (!_pageController.hasClients) {
        return;
      }
      final int next = (_activeIndex + 1) % _announcements.length;
      _pageController.animateToPage(
        next,
        duration: const Duration(milliseconds: 420),
        curve: Curves.easeInOut,
      );
    });
  }

  @override
  void dispose() {
    _autoSlideTimer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Row(
          children: const <Widget>[
            Text(
              'Updates',
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 29,
                fontWeight: FontWeight.w700,
                color: Color(0xFF16212A),
              ),
            ),
            Spacer(),
            Text(
              'View All',
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 15,
                fontWeight: FontWeight.w500,
                color: Color(0xFFB0BEC5),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 132,
          child: PageView.builder(
            controller: _pageController,
            itemCount: _announcements.length,
            onPageChanged: (int value) {
              setState(() {
                _activeIndex = value;
              });
            },
            itemBuilder: (BuildContext context, int index) {
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: _UpdateCard(announcement: _announcements[index]),
              );
            },
          ),
        ),
        const SizedBox(height: 8),
        Center(
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: List<Widget>.generate(_announcements.length, (int index) {
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 2),
                child: _Dot(isActive: index == _activeIndex),
              );
            }),
          ),
        ),
      ],
    );
  }
}

class _UpdateCard extends StatelessWidget {
  const _UpdateCard({required this.announcement});

  final _Announcement announcement;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 264,
      padding: const EdgeInsets.fromLTRB(16, 14, 12, 12),
      decoration: BoxDecoration(
        color: announcement.backgroundColor,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  announcement.title,
                  style: const TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 23,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF0F172A),
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  announcement.moduleCode,
                  style: const TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF1F3B4D),
                  ),
                ),
                const Spacer(),
                Container(
                  width: 94,
                  height: 32,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF6F6F6),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Center(
                    child: Text(
                      announcement.buttonText,
                      style: const TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF1B2732),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          const SizedBox(
            width: 84,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              children: <Widget>[
                Icon(Icons.school_rounded, size: 52, color: Color(0xFFF2EEF5)),
                SizedBox(height: 2),
                Icon(
                  Icons.people_alt_rounded,
                  size: 42,
                  color: Color(0xFFF8F2F2),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionGrid extends StatelessWidget {
  const _ActionGrid();

  @override
  Widget build(BuildContext context) {
    return const Column(
      children: <Widget>[
        Row(
          children: <Widget>[
            Expanded(
              child: _ActionTile(
                icon: Icons.person_outline_rounded,
                title: 'Ask Questions',
              ),
            ),
            SizedBox(width: 16),
            Expanded(
              child: _ActionTile(
                icon: Icons.qr_code_scanner_rounded,
                title: 'Scan Attendence',
              ),
            ),
          ],
        ),
        SizedBox(height: 16),
        Row(
          children: <Widget>[
            Expanded(
              child: _ActionTile(
                icon: Icons.forum_outlined,
                title: 'Complain &\nSugestions',
              ),
            ),
            SizedBox(width: 16),
            Expanded(
              child: _ActionTile(
                icon: Icons.more_horiz,
                title: '',
                hideLabel: true,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _ActionTile extends StatelessWidget {
  const _ActionTile({
    required this.icon,
    required this.title,
    this.hideLabel = false,
  });

  final IconData icon;
  final String title;
  final bool hideLabel;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 124,
      decoration: BoxDecoration(
        color: const Color(0xFFF2D5D8),
        borderRadius: BorderRadius.circular(20),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x12000000),
            blurRadius: 8,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: hideLabel
          ? const SizedBox.expand()
          : Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Icon(icon, size: 36, color: const Color(0xFF253047)),
                const SizedBox(height: 10),
                Text(
                  title,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF141C29),
                    height: 1.05,
                  ),
                ),
              ],
            ),
    );
  }
}

class _BottomNavBar extends StatelessWidget {
  const _BottomNavBar({required this.bottomInset});

  final double bottomInset;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 96 + bottomInset,
      padding: EdgeInsets.only(bottom: bottomInset),
      decoration: const BoxDecoration(
        color: Color(0xFF63BEDB),
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(34),
          topRight: Radius.circular(34),
        ),
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: <Widget>[
          _NavItem(icon: Icons.home_filled, label: 'Home', isActive: true),
          _NavItem(
            icon: Icons.notifications_none_rounded,
            label: 'Nottfications',
          ),
          _NavItem(icon: Icons.smart_toy_outlined, label: 'Chat Bot'),
          _NavItem(icon: Icons.settings_outlined, label: 'Settings'),
        ],
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
        Icon(icon, size: 22, color: const Color(0xFF111827)),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 12,
            fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
            color: const Color(0xFF111827),
          ),
        ),
      ],
    );
  }
}

class _Dot extends StatelessWidget {
  const _Dot({this.isActive = false});

  final bool isActive;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: isActive ? 7 : 6,
      height: isActive ? 7 : 6,
      decoration: BoxDecoration(
        color: isActive ? const Color(0xFF9E9E9E) : const Color(0xFFD2D2D2),
        shape: BoxShape.circle,
      ),
    );
  }
}

class _Announcement {
  const _Announcement({
    required this.title,
    required this.moduleCode,
    required this.buttonText,
    required this.backgroundColor,
  });

  final String title;
  final String moduleCode;
  final String buttonText;
  final Color backgroundColor;
}
