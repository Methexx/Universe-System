import 'dart:convert';
import 'dart:typed_data';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:universe_app/core/constants/app_colors.dart';
import 'package:universe_app/core/constants/app_routes.dart';
import 'package:universe_app/features/auth/viewmodels/auth_viewmodel.dart';
import 'package:universe_app/features/profile/models/parent_profile_model.dart';
import 'package:universe_app/features/profile/viewmodels/profile_viewmodel.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen>
    with SingleTickerProviderStateMixin {
  bool _studentExpanded = false;
  bool _teacherExpanded = false;
  bool _parentExpanded = false;

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
      context.read<ProfileViewModel>().loadProfile();
    });
  }

  @override
  void dispose() {
    _entryController.dispose();
    super.dispose();
  }

  void _showLogoutSheet() {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black.withValues(alpha: 0.55),
      isScrollControlled: true,
      builder: (_) => const _LogoutBottomSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final double topInset = MediaQuery.paddingOf(context).top;
    final double bottomInset = MediaQuery.paddingOf(context).bottom;

    return Scaffold(
      backgroundColor: AppColors.primary,
      body: Stack(
        children: [
          Column(
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
                      child: Consumer<ProfileViewModel>(
                        builder: (context, vm, _) {
                          if (vm.isLoading && vm.profile == null) {
                            return const Center(
                              child: CircularProgressIndicator(),
                            );
                          }
                          if (vm.errorMessage != null && vm.profile == null) {
                            return Center(
                              child: Padding(
                                padding: const EdgeInsets.all(24),
                                child: Text(
                                  vm.errorMessage!,
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(
                                    fontFamily: 'Plus Jakarta Sans',
                                    fontSize: 14,
                                    color: Color(0xFF78909C),
                                  ),
                                ),
                              ),
                            );
                          }
                          final ParentProfileModel? profile = vm.profile;
                          return SingleChildScrollView(
                            physics: const BouncingScrollPhysics(),
                            padding: EdgeInsets.fromLTRB(
                                18, 24, 18, bottomInset + 100),
                            child: Column(
                              children: [
                                _buildProfileAvatar(profile),
                                const SizedBox(height: 24),
                                _buildSection(
                                  icon: Icons.school_rounded,
                                  iconColor: const Color(0xFF2E6B7F),
                                  iconBg: const Color(0xFFE0F4FA),
                                  title: 'Student Details',
                                  expanded: _studentExpanded,
                                  onTap: () => setState(
                                      () => _studentExpanded = !_studentExpanded),
                                  rows: _studentRows(profile?.student),
                                ),
                                const SizedBox(height: 14),
                                _buildSection(
                                  icon: Icons.person_rounded,
                                  iconColor: const Color(0xFF5C3D8F),
                                  iconBg: const Color(0xFFEDE8F8),
                                  title: 'Teacher Details',
                                  expanded: _teacherExpanded,
                                  onTap: () => setState(
                                      () => _teacherExpanded = !_teacherExpanded),
                                  rows: _teacherRows(profile?.teacher),
                                ),
                                const SizedBox(height: 14),
                                _buildSection(
                                  icon: Icons.family_restroom_rounded,
                                  iconColor: const Color(0xFF1A6B4A),
                                  iconBg: const Color(0xFFE0F5ED),
                                  title: 'Parent Details',
                                  expanded: _parentExpanded,
                                  onTap: () => setState(
                                      () => _parentExpanded = !_parentExpanded),
                                  rows: _parentRows(profile),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          Positioned(
            left: 18,
            right: 18,
            bottom: bottomInset + 24,
            child: SlideTransition(
              position: Tween<Offset>(
                begin: const Offset(0, 1.5),
                end: Offset.zero,
              ).animate(CurvedAnimation(
                parent: _entryController,
                curve: const Interval(0.4, 1.0, curve: Curves.easeOutCubic),
              )),
              child: _LogoutButton(onTap: _showLogoutSheet),
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
          const Text(
            'Student Profile',
            style: TextStyle(
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileAvatar(ParentProfileModel? profile) {
    final String? photoUrl = profile?.student?.photoUrl;
    final String displayName = profile?.student?.fullName ?? '—';
    final String? grade = profile?.student?.grade;
    final String? className = profile?.student?.className;
    final String gradeBadge = (grade != null && className != null)
        ? '$grade — Class $className'
        : (grade ?? '');

    return Column(
      children: [
        Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 4),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.2),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: CircleAvatar(
            radius: 52,
            backgroundColor: const Color(0xFFE3C091),
            backgroundImage: _resolveImage(photoUrl),
            child: photoUrl == null
                ? const Icon(Icons.person, color: Color(0xFF374151), size: 52)
                : null,
          ),
        ),
        const SizedBox(height: 14),
        Text(
          displayName,
          style: const TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: Color(0xFF16212A),
          ),
        ),
        const SizedBox(height: 4),
        if (gradeBadge.isNotEmpty)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              gradeBadge,
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppColors.primary,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildSection({
    required IconData icon,
    required Color iconColor,
    required Color iconBg,
    required String title,
    required bool expanded,
    required VoidCallback onTap,
    required List<_DetailRow> rows,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
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
          InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(20),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: iconBg,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(icon, color: iconColor, size: 20),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Text(
                      title,
                      style: const TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF16212A),
                      ),
                    ),
                  ),
                  AnimatedRotation(
                    turns: expanded ? 0.5 : 0,
                    duration: const Duration(milliseconds: 280),
                    child: const Icon(
                      Icons.keyboard_arrow_down_rounded,
                      color: Color(0xFF90A4AE),
                      size: 24,
                    ),
                  ),
                ],
              ),
            ),
          ),
          AnimatedCrossFade(
            firstChild: const SizedBox(width: double.infinity),
            secondChild: Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Column(
                children: [
                  const Divider(color: Color(0xFFE8F0F2), height: 1),
                  const SizedBox(height: 12),
                  ...rows.map((r) => _buildDetailRow(r.label, r.value)),
                ],
              ),
            ),
            crossFadeState:
                expanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
            duration: const Duration(milliseconds: 280),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: Color(0xFF78909C),
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: Color(0xFF16212A),
              ),
            ),
          ),
        ],
      ),
    );
  }

  List<_DetailRow> _studentRows(StudentProfile? s) => [
        _DetailRow('Full Name', s?.fullName ?? '—'),
        _DetailRow('Student ID', s?.studentIdNo ?? '—'),
        _DetailRow('Grade', s?.grade ?? '—'),
        _DetailRow('Class', s?.className != null ? 'Class ${s!.className}' : '—'),
        _DetailRow('Gender', s?.gender ?? '—'),
        _DetailRow('Admission Year', s?.admissionYear ?? '—'),
      ];

  List<_DetailRow> _teacherRows(TeacherProfile? t) => [
        _DetailRow('Class Teacher', t?.fullName ?? '—'),
        _DetailRow('Contact', t?.phoneNumber ?? '—'),
        _DetailRow('Email', t?.email ?? '—'),
      ];

  List<_DetailRow> _parentRows(ParentProfileModel? p) => [
        _DetailRow('Parent Name', p?.fullName ?? '—'),
        _DetailRow('Contact', p?.phoneNumber ?? '—'),
        _DetailRow('Email', p?.email ?? '—'),
      ];
}

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

// ─── Data ─────────────────────────────────────────────────────────────────────

class _DetailRow {
  const _DetailRow(this.label, this.value);

  final String label;
  final String value;
}

// ─── Logout button ─────────────────────────────────────────────────────────────

class _LogoutButton extends StatelessWidget {
  const _LogoutButton({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        height: 54,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFFDF5B6D), Color(0xFFB83A4E)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFFDF5B6D).withValues(alpha: 0.35),
              blurRadius: 14,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.logout_rounded, color: Colors.white, size: 20),
            SizedBox(width: 10),
            Text(
              'Logout',
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Logout bottom sheet ───────────────────────────────────────────────────────

class _LogoutBottomSheet extends StatelessWidget {
  const _LogoutBottomSheet();

  @override
  Widget build(BuildContext context) {
    final double bottomInset = MediaQuery.paddingOf(context).bottom;

    return BackdropFilter(
      filter: ImageFilter.blur(sigmaX: 6, sigmaY: 6),
      child: Padding(
        padding: EdgeInsets.fromLTRB(16, 0, 16, bottomInset + 24),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(28),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.18),
                blurRadius: 32,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                margin: const EdgeInsets.only(top: 12),
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFCDD9DC),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 20),
              Container(
                width: 64,
                height: 64,
                decoration: const BoxDecoration(
                  color: Color(0xFFFFF0F2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.logout_rounded,
                    color: Color(0xFFDF5B6D), size: 28),
              ),
              const SizedBox(height: 16),
              const Text(
                'Are u Sure u want to logout?',
                style: TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF16212A),
                ),
              ),
              const SizedBox(height: 8),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 32),
                child: Text(
                  'You will need to sign in again to access your account.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF78909C),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () async {
                          Navigator.of(context).pop();
                          final authVm = context.read<AuthViewModel>();
                          final profileVm = context.read<ProfileViewModel>();
                          await authVm.logout();
                          await profileVm.clearProfile();
                          if (context.mounted) {
                            context.go(AppRoutes.login);
                          }
                        },
                        child: Container(
                          height: 52,
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFE8EA),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Center(
                            child: Text(
                              'Yes',
                              style: TextStyle(
                                fontFamily: 'Plus Jakarta Sans',
                                fontSize: 15,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFFDF5B6D),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => Navigator.of(context).pop(),
                        child: Container(
                          height: 52,
                          decoration: BoxDecoration(
                            color: const Color(0xFF4ADE80),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF4ADE80)
                                    .withValues(alpha: 0.35),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: const Center(
                            child: Text(
                              'No',
                              style: TextStyle(
                                fontFamily: 'Plus Jakarta Sans',
                                fontSize: 15,
                                fontWeight: FontWeight.w800,
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
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
