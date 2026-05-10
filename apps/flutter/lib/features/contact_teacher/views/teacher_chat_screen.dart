import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:universe_app/core/constants/app_colors.dart';
import 'package:universe_app/features/auth/viewmodels/auth_viewmodel.dart';
import 'package:universe_app/features/messages/models/message_models.dart';
import 'package:universe_app/features/messages/viewmodels/messages_viewmodel.dart';
import 'package:universe_app/features/profile/viewmodels/profile_viewmodel.dart';
import 'package:intl/intl.dart';

class TeacherChatScreen extends StatefulWidget {
  final String? targetUserId;
  const TeacherChatScreen({super.key, this.targetUserId});

  @override
  State<TeacherChatScreen> createState() => _TeacherChatScreenState();
}

class _TeacherChatScreenState extends State<TeacherChatScreen>
    with SingleTickerProviderStateMixin {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late final AnimationController _entryCtrl;
  late final Animation<double> _fadeAnim;

  ContactModel? _targetTeacher;
  Timer? _pollingTimer;

  String? get _userId => context.read<AuthViewModel>().currentUser?.id;

  @override
  void initState() {
    super.initState();
    _entryCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    )..forward();
    _fadeAnim = CurvedAnimation(parent: _entryCtrl, curve: Curves.easeOut);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initChat();
    });
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    _inputController.dispose();
    _scrollController.dispose();
    _entryCtrl.dispose();
    super.dispose();
  }

  Future<void> _initChat() async {
    final messagesVm = context.read<MessagesViewModel>();
    await messagesVm.fetchContacts();
    
    if (widget.targetUserId != null) {
      final matches = messagesVm.contacts.where((c) => c.id == widget.targetUserId).toList();
      if (matches.isNotEmpty) {
        setState(() {
          _targetTeacher = matches.first;
        });
      } else {
        final teachers = messagesVm.contacts.where((c) => c.role == 'teacher').toList();
        if (teachers.isNotEmpty) {
          setState(() {
            _targetTeacher = teachers.first;
          });
        }
      }
    } else {
      final teachers = messagesVm.contacts.where((c) => c.role == 'teacher').toList();
      if (teachers.isNotEmpty) {
        setState(() {
          _targetTeacher = teachers.first;
        });
      }
    }

    if (_targetTeacher != null) {
      await messagesVm.fetchThread(_targetTeacher!.id, userId: _userId);
      _scrollToBottom();
      _startPolling();
    }
  }

  void _startPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(const Duration(seconds: 5), (timer) async {
      if (_targetTeacher != null) {
        await context.read<MessagesViewModel>().fetchThread(_targetTeacher!.id, userId: _userId);
      }
    });
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _send() async {
    final String text = _inputController.text.trim();
    if (text.isEmpty || _targetTeacher == null) return;

    final messagesVm = context.read<MessagesViewModel>();
    final profileVm = context.read<ProfileViewModel>();
    
    final success = await messagesVm.sendMessage(
      receiverId: _targetTeacher!.id,
      content: text,
      studentId: profileVm.profile?.student?.id,
      userId: _userId,
    );

    if (success) {
      _inputController.clear();
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    final double topInset = MediaQuery.paddingOf(context).top;
    final double bottomInset = MediaQuery.paddingOf(context).bottom;
    final messagesVm = context.watch<MessagesViewModel>();

    return Scaffold(
      backgroundColor: const Color(0xFFEDF5F8),
      body: Column(
        children: <Widget>[
          _ChatTopBar(
            topInset: topInset,
            teacher: _targetTeacher,
          ),
          Expanded(
            child: FadeTransition(
              opacity: _fadeAnim,
              child: messagesVm.isLoading && messagesVm.messages.isEmpty
                  ? const Center(child: CircularProgressIndicator())
                  : ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                      itemCount: messagesVm.messages.length + 1,
                      itemBuilder: (ctx, i) {
                        if (i == 0) return const _DateChip(label: 'TODAY');
                        return _MessageBubble(message: messagesVm.messages[i - 1]);
                      },
                    ),
            ),
          ),
          _InputBar(
            controller: _inputController,
            bottomInset: bottomInset,
            onSend: _send,
          ),
        ],
      ),
    );
  }
}

// ─── Top bar ──────────────────────────────────────────────────────────────────

class _ChatTopBar extends StatelessWidget {
  const _ChatTopBar({required this.topInset, this.teacher});
  final double topInset;
  final ContactModel? teacher;

  @override
  Widget build(BuildContext context) {
    final initials = teacher?.fullName != null
        ? teacher!.fullName!
            .split(' ')
            .where((e) => e.isNotEmpty)
            .take(2)
            .map((e) => e[0])
            .join()
            .toUpperCase()
        : 'TR';

    return Container(
      color: Colors.white,
      padding: EdgeInsets.fromLTRB(12, topInset + 10, 16, 14),
      child: Row(
        children: <Widget>[
          GestureDetector(
            onTap: () => context.pop(),
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: const Color(0xFFF0FAFB),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                Icons.arrow_back_ios_new_rounded,
                size: 16,
                color: AppColors.primary,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Stack(
            children: <Widget>[
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    initials,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  teacher?.fullName ?? 'Loading...',
                  style: const TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF16212A),
                  ),
                ),
                const SizedBox(height: 2),
                const Text(
                  'Teacher',
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF94A3B0),
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () => _showTeacherInfo(context),
            icon: const Icon(Icons.more_vert_rounded, color: Color(0xFF16212A)),
          ),
        ],
      ),
    );
  }

  void _showTeacherInfo(BuildContext context) {
    if (teacher == null) return;
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => _TeacherInfoSheet(teacher: teacher!),
    );
  }
}

// ─── Teacher info bottom sheet ────────────────────────────────────────────────

class _TeacherInfoSheet extends StatelessWidget {
  const _TeacherInfoSheet({required this.teacher});
  final ContactModel teacher;

  @override
  Widget build(BuildContext context) {
    final double bottomInset = MediaQuery.paddingOf(context).bottom;
    final initials = teacher.fullName != null
        ? teacher.fullName!
            .split(' ')
            .where((e) => e.isNotEmpty)
            .take(2)
            .map((e) => e[0])
            .join()
            .toUpperCase()
        : 'TR';

    return Padding(
      padding: EdgeInsets.fromLTRB(24, 20, 24, bottomInset + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: const Color(0xFFE0E0E0),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 24),
          Stack(
            children: <Widget>[
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    initials,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            teacher.fullName ?? 'Teacher Name',
            style: const TextStyle(
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: Color(0xFF16212A),
            ),
          ),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              teacher.className ?? 'Class Teacher',
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
            ),
          ),
          const SizedBox(height: 28),
          const _InfoRow(
            icon: Icons.email_outlined,
            label: 'Role',
            value: 'School Teacher',
            iconColor: Color(0xFF3EA8D8),
          ),
          const SizedBox(height: 14),
          _InfoRow(
            icon: Icons.school_outlined,
            label: 'Class',
            value: teacher.className ?? 'N/A',
            iconColor: const Color(0xFF2E6B7F),
          ),
          const SizedBox(height: 28),
          GestureDetector(
            onTap: () => Navigator.of(context).pop(),
            child: Container(
              height: 48,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: <Color>[Color(0xFF1A3A44), Color(0xFF2E6B7F)],
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                ),
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Center(
                child: Text(
                  'Close',
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
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

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
    required this.iconColor,
  });
  final IconData icon;
  final String label;
  final String value;
  final Color iconColor;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: <Widget>[
        Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            color: iconColor.withValues(alpha: 0.10),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, size: 20, color: iconColor),
        ),
        const SizedBox(width: 14),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              label,
              style: const TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: Color(0xFF94A3B0),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              value,
              style: const TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: Color(0xFF16212A),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

// ─── Date chip ────────────────────────────────────────────────────────────────

class _DateChip extends StatelessWidget {
  const _DateChip({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
          decoration: BoxDecoration(
            color: const Color(0xFFD0E8EF),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            label,
            style: const TextStyle(
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: Color(0xFF4A6D7C),
              letterSpacing: 0.8,
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Message bubble ───────────────────────────────────────────────────────────

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({required this.message});
  final MessageModel message;

  @override
  Widget build(BuildContext context) {
    final authVm = context.read<AuthViewModel>();
    final bool mine = message.senderId == authVm.currentUser?.id;
    final String time = DateFormat('hh:mm a').format(message.createdAt);
    
    final initials = message.sender.fullName != null
        ? message.sender.fullName!
            .split(' ')
            .where((e) => e.isNotEmpty)
            .take(2)
            .map((e) => e[0])
            .join()
            .toUpperCase()
        : 'TR';

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment: mine ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: <Widget>[
          if (!mine) ...<Widget>[
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  initials,
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
          ],
          ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.sizeOf(context).width * 0.72,
            ),
            child: Column(
              crossAxisAlignment:
                  mine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: <Widget>[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: mine ? AppColors.primary : Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(18),
                      topRight: const Radius.circular(18),
                      bottomLeft: Radius.circular(mine ? 18 : 4),
                      bottomRight: Radius.circular(mine ? 4 : 18),
                    ),
                    boxShadow: <BoxShadow>[
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.06),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        message.content,
                        style: TextStyle(
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: mine ? Colors.white : const Color(0xFF16212A),
                          height: 1.45,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    Text(
                      time,
                      style: const TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF94A3B0),
                      ),
                    ),
                    if (mine) ...<Widget>[
                      const SizedBox(width: 4),
                      Icon(
                        Icons.done_all_rounded,
                        size: 14,
                        color: message.isRead ? const Color(0xFF3EA8D8) : const Color(0xFF94A3B0),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Input bar ────────────────────────────────────────────────────────────────

class _InputBar extends StatelessWidget {
  const _InputBar({
    required this.controller,
    required this.bottomInset,
    required this.onSend,
  });
  final TextEditingController controller;
  final double bottomInset;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: EdgeInsets.fromLTRB(12, 10, 12, bottomInset + 10),
      child: Row(
        children: <Widget>[
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: const Color(0xFFF0FAFB),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(Icons.add_rounded, color: AppColors.primary, size: 22),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Container(
              height: 44,
              decoration: BoxDecoration(
                color: const Color(0xFFF4FAFB),
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: const Color(0xFFDDE8ED)),
              ),
              child: TextField(
                controller: controller,
                style: const TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF16212A),
                ),
                decoration: InputDecoration(
                  hintText: 'Type a message…',
                  hintStyle: const TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 14,
                    color: Color(0xFF94A3B0),
                  ),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  suffixIcon: Icon(
                    Icons.mic_none_rounded,
                    color: AppColors.primary.withValues(alpha: 0.6),
                    size: 20,
                  ),
                ),
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => onSend(),
              ),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: onSend,
            child: Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: <Color>[Color(0xFF1A3A44), Color(0xFF2E6B7F)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(14),
                boxShadow: <BoxShadow>[
                  BoxShadow(
                    color: const Color(0xFF1A3A44).withValues(alpha: 0.30),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}
