import 'dart:convert';
import 'dart:typed_data';
import 'dart:ui';

import 'package:app_settings/app_settings.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:universe_app/core/constants/app_colors.dart';
import 'package:universe_app/core/constants/app_routes.dart';
import 'package:universe_app/core/di/service_locator.dart';
import 'package:universe_app/features/auth/viewmodels/auth_viewmodel.dart';
import 'package:universe_app/features/profile/viewmodels/profile_viewmodel.dart';
import 'package:universe_app/features/settings/viewmodels/settings_viewmodel.dart';

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

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen>
    with SingleTickerProviderStateMixin {
  bool _biometric = false;

  // ── Entry animation ────────────────────────────────────────────────────────
  late final AnimationController _entryCtrl;
  late final Animation<Offset> _slideAnim;
  late final Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _entryCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 620),
    );
    _slideAnim = Tween<Offset>(begin: const Offset(0, 0.1), end: Offset.zero)
        .animate(CurvedAnimation(parent: _entryCtrl, curve: Curves.easeOutCubic));
    _fadeAnim = CurvedAnimation(parent: _entryCtrl, curve: Curves.easeOut);
    _entryCtrl.forward();

    ServiceLocator.instance.secureStorageService.getBiometricEnabled().then((value) {
      if (mounted) setState(() => _biometric = value);
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final profileVm = context.read<ProfileViewModel>();
      if (profileVm.profile == null) profileVm.loadProfile();
      
      context.read<SettingsViewModel>().loadSettings();
    });
  }

  @override
  void dispose() {
    _entryCtrl.dispose();
    super.dispose();
  }


  void _showLogoutSheet() {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black.withValues(alpha: 0.55),
      isScrollControlled: true,
      builder: (_) => const _LogoutSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final double topInset = MediaQuery.paddingOf(context).top;
    final double bottomInset = MediaQuery.paddingOf(context).bottom;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
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
                    child: SingleChildScrollView(
                      physics: const BouncingScrollPhysics(),
                      padding: EdgeInsets.fromLTRB(18, 24, 18, bottomInset + 32),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // ── Account card ─────────────────────────────────
                          _AccountCard(),
                          const SizedBox(height: 24),

                          // ── Notifications ─────────────────────────────────
                          _SectionHeader(
                            icon: Icons.notifications_rounded,
                            iconColor: const Color(0xFF2E6B7F),
                            iconBg: const Color(0xFFE0F4FA),
                            title: 'Notifications',
                          ),
                          const SizedBox(height: 10),
                          _SettingsCard(
                            children: [
                              _ToggleRow(
                                label: 'Push Notifications',
                                subtitle: 'Receive app alerts',
                                icon: Icons.notifications_none_rounded,
                                value: context.watch<SettingsViewModel>().settings?.pushNotifications ?? true,
                                onChanged: (v) async {
                                  final vm = context.read<SettingsViewModel>();
                                  await vm.updatePushNotifications(v);
                                  if (vm.permissionDenied && context.mounted) {
                                    vm.clearPermissionDenied();
                                    await showDialog<void>(
                                      context: context,
                                      builder: (_) => AlertDialog(
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(20),
                                        ),
                                        title: const Text(
                                          'Notifications Blocked',
                                          style: TextStyle(
                                            fontFamily: 'Plus Jakarta Sans',
                                            fontWeight: FontWeight.w800,
                                            fontSize: 16,
                                          ),
                                        ),
                                        content: const Text(
                                          'To receive push notifications, go to your device Settings → App → Notifications and enable them for Universe.',
                                          style: TextStyle(
                                            fontFamily: 'Plus Jakarta Sans',
                                            fontSize: 13,
                                            color: Color(0xFF546E7A),
                                          ),
                                        ),
                                        actions: [
                                          TextButton(
                                            onPressed: () => Navigator.of(context).pop(),
                                            child: const Text(
                                              'Cancel',
                                              style: TextStyle(
                                                fontFamily: 'Plus Jakarta Sans',
                                                color: Color(0xFF90A4AE),
                                              ),
                                            ),
                                          ),
                                          TextButton(
                                            onPressed: () {
                                              Navigator.of(context).pop();
                                              AppSettings.openAppSettings();
                                            },
                                            child: Text(
                                              'Open Settings',
                                              style: TextStyle(
                                                fontFamily: 'Plus Jakarta Sans',
                                                fontWeight: FontWeight.w700,
                                                color: AppColors.primary,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  }
                                },
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),

                          // ── Alert types ───────────────────────────────────
                          _SectionHeader(
                            icon: Icons.tune_rounded,
                            iconColor: const Color(0xFF5C3D8F),
                            iconBg: const Color(0xFFEDE8F8),
                            title: 'Alert Types',
                          ),
                          const SizedBox(height: 10),
                          _SettingsCard(
                            children: [
                              _ToggleRow(
                                label: 'Attendance Alerts',
                                subtitle: 'Absence & late marks',
                                icon: Icons.qr_code_scanner_rounded,
                                value: context.watch<SettingsViewModel>().settings?.attendanceAlerts ?? true,
                                activeColor: const Color(0xFF4A90D9),
                                onChanged: (v) => context.read<SettingsViewModel>().updateAttendanceAlerts(v),
                              ),
                              _Divider(),
                              _ToggleRow(
                                label: 'Gate Alerts',
                                subtitle: 'Entry & exit notifications',
                                icon: Icons.sensor_door_rounded,
                                value: context.watch<SettingsViewModel>().settings?.gateAlerts ?? true,
                                activeColor: const Color(0xFF64C4E6),
                                onChanged: (v) => context.read<SettingsViewModel>().updateGateAlerts(v),
                              ),
                              _Divider(),
                              _ToggleRow(
                                label: 'Result Alerts',
                                subtitle: 'New results published',
                                icon: Icons.bar_chart_rounded,
                                value: context.watch<SettingsViewModel>().settings?.resultAlerts ?? true,
                                activeColor: const Color(0xFF2EAA75),
                                onChanged: (v) => context.read<SettingsViewModel>().updateResultAlerts(v),
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),

                          // ── Security ──────────────────────────────────────
                          _SectionHeader(
                            icon: Icons.shield_rounded,
                            iconColor: const Color(0xFF1A6B4A),
                            iconBg: const Color(0xFFE0F5ED),
                            title: 'Security',
                          ),
                          const SizedBox(height: 10),
                          _SettingsCard(
                            children: [
                              _ToggleRow(
                                label: 'Biometric Login',
                                subtitle: 'Fingerprint / Face ID',
                                icon: Icons.fingerprint_rounded,
                                value: _biometric,
                                activeColor: const Color(0xFF1A6B4A),
                                onChanged: (v) async {
                                  if (!v) {
                                    setState(() => _biometric = false);
                                    await ServiceLocator.instance.secureStorageService
                                        .setBiometricEnabled(false);
                                    return;
                                  }

                                  final sl = ServiceLocator.instance;
                                  final available = await sl.biometricService.isBiometricAvailable();
                                  if (!available) {
                                    if (context.mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                          content: Text('No biometric hardware found on this device.'),
                                        ),
                                      );
                                    }
                                    return;
                                  }

                                  final confirmed = await sl.biometricService.authenticate(
                                    reason: 'Confirm your fingerprint to enable biometric login',
                                  );

                                  if (confirmed) {
                                    setState(() => _biometric = true);
                                    await sl.secureStorageService.setBiometricEnabled(true);
                                  }
                                },
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),

                          // ── General ───────────────────────────────────────
                          _SectionHeader(
                            icon: Icons.info_outline_rounded,
                            iconColor: const Color(0xFF78909C),
                            iconBg: const Color(0xFFECF2F4),
                            title: 'General',
                          ),
                          const SizedBox(height: 10),
                          _SettingsCard(
                            children: [
                              _TapRow(
                                label: 'Privacy Policy',
                                subtitle: 'Read our privacy terms',
                                icon: Icons.policy_outlined,
                                iconColor: const Color(0xFF78909C),
                                onTap: () => context.push(AppRoutes.privacyPolicy),
                              ),
                              _Divider(),
                              _TapRow(
                                label: 'Terms of Service',
                                subtitle: 'Usage terms & conditions',
                                icon: Icons.article_outlined,
                                iconColor: const Color(0xFF78909C),
                                onTap: () => context.push(AppRoutes.termsOfService),
                              ),
                              _Divider(),
                              _TapRow(
                                label: 'App Version',
                                subtitle: 'v1.0.0 (build 1)',
                                icon: Icons.info_rounded,
                                iconColor: const Color(0xFF78909C),
                                showArrow: false,
                                onTap: () {},
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),

                          // ── Logout ────────────────────────────────────────
                          _LogoutButton(onTap: _showLogoutSheet),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
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
            child: Text(
              'Settings',
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: Colors.white,
              ),
            ),
          ),
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.tune_rounded, color: Colors.white, size: 20),
          ),
        ],
      ),
    );
  }
}

// ─── Account card ─────────────────────────────────────────────────────────────

class _AccountCard extends StatefulWidget {
  @override
  State<_AccountCard> createState() => _AccountCardState();
}

class _AccountCardState extends State<_AccountCard> {
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
    final authVm = context.watch<AuthViewModel>();
    final profileVm = context.watch<ProfileViewModel>();
    
    final user = authVm.currentUser;
    final student = profileVm.profile?.student;

    final String name = student?.fullName ?? user?.fullName ?? 'Parent Name';
    final String email = user?.email ?? 'parent@school.lk';
    final String gradeClass = student != null
        ? 'Grade ${student.grade} — ${student.className}'
        : 'No Student Linked';

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1A3A44), Color(0xFF2E6B7F)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.3),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          Stack(
            alignment: Alignment.bottomRight,
            children: [
              CircleAvatar(
                radius: 30,
                backgroundColor: const Color(0xFFE3C091),
                backgroundImage: _getProvider(student?.photoUrl),
                child: student?.photoUrl == null
                    ? const Icon(Icons.person, color: Color(0xFF374151), size: 30)
                    : null,
              ),
              Container(
                width: 18,
                height: 18,
                decoration: BoxDecoration(
                  color: const Color(0xFF4ADE80),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                ),
              ),
            ],
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  email,
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: Colors.white.withValues(alpha: 0.65),
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    gradeClass,
                    style: const TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => context.push(AppRoutes.profile),
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.arrow_forward_ios_rounded,
                  color: Colors.white, size: 14),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Section header ───────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.icon,
    required this.iconColor,
    required this.iconBg,
    required this.title,
  });

  final IconData icon;
  final Color iconColor;
  final Color iconBg;
  final String title;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: iconBg,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: iconColor, size: 16),
        ),
        const SizedBox(width: 10),
        Text(
          title,
          style: const TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 15,
            fontWeight: FontWeight.w800,
            color: Color(0xFF16212A),
          ),
        ),
      ],
    );
  }
}

// ─── Settings card container ──────────────────────────────────────────────────

class _SettingsCard extends StatelessWidget {
  const _SettingsCard({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(children: children),
    );
  }
}

// ─── Divider ──────────────────────────────────────────────────────────────────

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(horizontal: 16),
      child: Divider(height: 1, color: Color(0xFFF0F5F7)),
    );
  }
}

// ─── Animated toggle row ──────────────────────────────────────────────────────

class _ToggleRow extends StatelessWidget {
  const _ToggleRow({
    required this.label,
    required this.subtitle,
    required this.icon,
    required this.value,
    required this.onChanged,
    this.activeColor,
  });

  final String label;
  final String subtitle;
  final IconData icon;
  final bool value;
  final Function(bool) onChanged;
  final Color? activeColor;

  @override
  Widget build(BuildContext context) {
    final Color active = activeColor ?? AppColors.primary;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOut,
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: value
                  ? active.withValues(alpha: 0.12)
                  : const Color(0xFFF0F5F7),
              borderRadius: BorderRadius.circular(12),
            ),
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 250),
              child: Icon(
                icon,
                key: ValueKey(value),
                color: value ? active : const Color(0xFFB0BEC5),
                size: 20,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF16212A),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF90A4AE),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          _AnimatedToggle(
            value: value,
            activeColor: active,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}

// ─── Custom animated toggle switch ───────────────────────────────────────────

class _AnimatedToggle extends StatefulWidget {
  const _AnimatedToggle({
    required this.value,
    required this.onChanged,
    this.activeColor,
  });

  final bool value;
  final Function(bool) onChanged;
  final Color? activeColor;

  @override
  State<_AnimatedToggle> createState() => _AnimatedToggleState();
}

class _AnimatedToggleState extends State<_AnimatedToggle>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _slideAnim;
  late final Animation<double> _scaleAnim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 280),
      value: widget.value ? 1.0 : 0.0,
    );
    _slideAnim = CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut);
    _scaleAnim = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 0.85), weight: 40),
      TweenSequenceItem(tween: Tween(begin: 0.85, end: 1.0), weight: 60),
    ]).animate(_ctrl);
  }

  @override
  void didUpdateWidget(_AnimatedToggle old) {
    super.didUpdateWidget(old);
    if (old.value != widget.value) {
      widget.value ? _ctrl.forward() : _ctrl.reverse();
    }
    if (old.activeColor != widget.activeColor) {
      // rebuild color tween
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _handleTap() {
    HapticFeedback.lightImpact();
    widget.onChanged(!widget.value);
  }

  @override
  Widget build(BuildContext context) {
    final Color active = widget.activeColor ?? AppColors.primary;

    return GestureDetector(
      onTap: _handleTap,
      child: AnimatedBuilder(
        animation: _ctrl,
        builder: (context, _) {
          final Color trackColor = ColorTween(
            begin: const Color(0xFFCDD9DC),
            end: active,
          ).evaluate(CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut))!;

          return Container(
            width: 52,
            height: 28,
            decoration: BoxDecoration(
              color: trackColor,
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(
                  color: (widget.value ? active : Colors.black)
                      .withValues(alpha: widget.value ? 0.25 : 0.08),
                  blurRadius: widget.value ? 8 : 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Track icons
                Positioned(
                  left: 7,
                  child: AnimatedOpacity(
                    duration: const Duration(milliseconds: 200),
                    opacity: widget.value ? 1.0 : 0.0,
                    child: Icon(Icons.check_rounded,
                        size: 11, color: Colors.white.withValues(alpha: 0.9)),
                  ),
                ),
                Positioned(
                  right: 7,
                  child: AnimatedOpacity(
                    duration: const Duration(milliseconds: 200),
                    opacity: widget.value ? 0.0 : 1.0,
                    child: Icon(Icons.close_rounded,
                        size: 11,
                        color: Colors.white.withValues(alpha: 0.7)),
                  ),
                ),
                // Thumb
                Positioned(
                  left: 2 + (_slideAnim.value * 24),
                  child: ScaleTransition(
                    scale: _scaleAnim,
                    child: Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.18),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ─── Tap row (navigate / info) ────────────────────────────────────────────────

class _TapRow extends StatelessWidget {
  const _TapRow({
    required this.label,
    required this.subtitle,
    required this.icon,
    required this.iconColor,
    required this.onTap,
    this.trailing,
    this.showArrow = true,
  });

  final String label;
  final String subtitle;
  final IconData icon;
  final Color iconColor;
  final VoidCallback onTap;
  final Widget? trailing;
  final bool showArrow;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: const TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF16212A),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF90A4AE),
                    ),
                  ),
                ],
              ),
            ),
            if (trailing != null) ...[
              trailing!,
              const SizedBox(width: 8),
            ],
            if (showArrow)
              const Icon(Icons.chevron_right_rounded,
                  color: Color(0xFFB0BEC5), size: 22),
          ],
        ),
      ),
    );
  }
}

// ─── Chip label ───────────────────────────────────────────────────────────────

class _ChipLabel extends StatelessWidget {
  const _ChipLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFE0F4FA),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: const TextStyle(
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: Color(0xFF2E6B7F),
        ),
      ),
    );
  }
}

// ─── Logout button ────────────────────────────────────────────────────────────

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

// ─── Logout bottom sheet ──────────────────────────────────────────────────────

class _LogoutSheet extends StatelessWidget {
  const _LogoutSheet();

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
                          final vm = context.read<AuthViewModel>();
                          await vm.logout();
                          if (context.mounted) context.go(AppRoutes.login);
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

class _ColorDot extends StatelessWidget {
  const _ColorDot({required this.color, this.isSelected = false});
  final Color color;
  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 14,
      height: 14,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: isSelected ? Border.all(color: Colors.white, width: 2) : null,
        boxShadow: isSelected
            ? [
                BoxShadow(
                  color: color.withValues(alpha: 0.4),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                )
              ]
            : null,
      ),
    );
  }
}


