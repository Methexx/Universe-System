import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:universe_app/core/constants/app_colors.dart';

// ─── Teacher constant ─────────────────────────────────────────────────────────

const _kTeacherName = 'Mrs. Silva';
const _kTeacherSubject = 'Class Teacher';
const _kTeacherInitials = 'MS';
const _kTeacherEmail = 'silva@universe.edu.lk';
const _kTeacherPhone = '+94 71 234 5678';
const _kTeacherOnline = true;
const _kTeacherColor = Color(0xFF6C5CE7);

// ─── Models ───────────────────────────────────────────────────────────────────

class _ChatMessage {
  const _ChatMessage({
    required this.text,
    required this.isMine,
    required this.time,
    this.attachment,
  });
  final String text;
  final bool isMine;
  final String time;
  final _Attachment? attachment;
}

class _Attachment {
  const _Attachment({required this.name, required this.size});
  final String name;
  final String size;
}

const List<_ChatMessage> _kInitialMessages = <_ChatMessage>[
  _ChatMessage(
    text: 'Hello Mrs. Silva, I was wondering if Alex had any homework for the weekend?',
    isMine: true,
    time: '08:30 AM',
  ),
  _ChatMessage(
    text: 'Hi! Yes, he needs to complete the algebra practice on page 42.',
    isMine: false,
    time: '08:45 AM',
    attachment: _Attachment(name: 'Algebra Practice 8A.pdf', size: '2.4 MB'),
  ),
  _ChatMessage(
    text: 'Thank you, we will get that done!',
    isMine: true,
    time: '08:47 AM',
  ),
];

// ─── Screen ───────────────────────────────────────────────────────────────────

class TeacherChatScreen extends StatefulWidget {
  const TeacherChatScreen({super.key});

  @override
  State<TeacherChatScreen> createState() => _TeacherChatScreenState();
}

class _TeacherChatScreenState extends State<TeacherChatScreen>
    with SingleTickerProviderStateMixin {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late List<_ChatMessage> _messages;
  late final AnimationController _entryCtrl;
  late final Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _messages = List<_ChatMessage>.from(_kInitialMessages);
    _entryCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    )..forward();
    _fadeAnim = CurvedAnimation(parent: _entryCtrl, curve: Curves.easeOut);
  }

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    _entryCtrl.dispose();
    super.dispose();
  }

  void _send() {
    final String text = _inputController.text.trim();
    if (text.isEmpty) return;
    final now = TimeOfDay.now();
    final String time =
        '${now.hourOfPeriod == 0 ? 12 : now.hourOfPeriod}:${now.minute.toString().padLeft(2, '0')} ${now.period == DayPeriod.am ? 'AM' : 'PM'}';
    setState(() {
      _messages = List<_ChatMessage>.from(_messages)
        ..add(_ChatMessage(text: text, isMine: true, time: time));
    });
    _inputController.clear();
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

  @override
  Widget build(BuildContext context) {
    final double topInset = MediaQuery.paddingOf(context).top;
    final double bottomInset = MediaQuery.paddingOf(context).bottom;

    return Scaffold(
      backgroundColor: const Color(0xFFEDF5F8),
      body: Column(
        children: <Widget>[
          _ChatTopBar(topInset: topInset),
          Expanded(
            child: FadeTransition(
              opacity: _fadeAnim,
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                itemCount: _messages.length + 1,
                itemBuilder: (ctx, i) {
                  if (i == 0) return const _DateChip(label: 'TODAY');
                  return _MessageBubble(message: _messages[i - 1]);
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
  const _ChatTopBar({required this.topInset});
  final double topInset;

  @override
  Widget build(BuildContext context) {
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
                  color: _kTeacherColor.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Center(
                  child: Text(
                    _kTeacherInitials,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: _kTeacherColor,
                    ),
                  ),
                ),
              ),
              if (_kTeacherOnline)
                Positioned(
                  bottom: 1,
                  right: 1,
                  child: Container(
                    width: 11,
                    height: 11,
                    decoration: BoxDecoration(
                      color: const Color(0xFF4ADE80),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
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
                const Text(
                  _kTeacherName,
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF16212A),
                  ),
                ),
                const SizedBox(height: 2),
                Row(
                  children: <Widget>[
                    Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                        color: Color(0xFF4ADE80),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Text(
                      'Online',
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF16A34A),
                      ),
                    ),
                  ],
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
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => const _TeacherInfoSheet(),
    );
  }
}

// ─── Teacher info bottom sheet ────────────────────────────────────────────────

class _TeacherInfoSheet extends StatelessWidget {
  const _TeacherInfoSheet();

  @override
  Widget build(BuildContext context) {
    final double bottomInset = MediaQuery.paddingOf(context).bottom;
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
                  color: _kTeacherColor.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Center(
                  child: Text(
                    _kTeacherInitials,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: _kTeacherColor,
                    ),
                  ),
                ),
              ),
              Positioned(
                bottom: 4,
                right: 4,
                child: Container(
                  width: 14,
                  height: 14,
                  decoration: BoxDecoration(
                    color: const Color(0xFF4ADE80),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2.5),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            _kTeacherName,
            style: TextStyle(
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
              _kTeacherSubject,
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
            label: 'Email',
            value: _kTeacherEmail,
            iconColor: Color(0xFF3EA8D8),
          ),
          const SizedBox(height: 14),
          const _InfoRow(
            icon: Icons.phone_outlined,
            label: 'Phone',
            value: _kTeacherPhone,
            iconColor: Color(0xFF2E6B7F),
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
  final _ChatMessage message;

  @override
  Widget build(BuildContext context) {
    final bool mine = message.isMine;
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
                color: _kTeacherColor.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: Text(
                  _kTeacherInitials,
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: _kTeacherColor,
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
                        message.text,
                        style: TextStyle(
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: mine ? Colors.white : const Color(0xFF16212A),
                          height: 1.45,
                        ),
                      ),
                      if (message.attachment != null) ...<Widget>[
                        const SizedBox(height: 10),
                        _AttachmentChip(attachment: message.attachment!),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    Text(
                      message.time,
                      style: const TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF94A3B0),
                      ),
                    ),
                    if (mine) ...<Widget>[
                      const SizedBox(width: 4),
                      const Icon(
                        Icons.done_all_rounded,
                        size: 14,
                        color: Color(0xFF3EA8D8),
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

// ─── Attachment chip ──────────────────────────────────────────────────────────

class _AttachmentChip extends StatelessWidget {
  const _AttachmentChip({required this.attachment});
  final _Attachment attachment;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withValues(alpha: 0.30)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.20),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.picture_as_pdf_rounded,
              size: 18,
              color: Colors.white,
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                attachment.name,
                style: const TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              Text(
                attachment.size,
                style: TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                  color: Colors.white.withValues(alpha: 0.70),
                ),
              ),
            ],
          ),
          const SizedBox(width: 10),
          Icon(
            Icons.download_rounded,
            size: 18,
            color: Colors.white.withValues(alpha: 0.80),
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
