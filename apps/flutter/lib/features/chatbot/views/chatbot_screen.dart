import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:universe_app/core/constants/app_colors.dart';
import 'package:universe_app/core/constants/app_routes.dart';
import 'package:universe_app/core/di/service_locator.dart';

// ─── Bot Constants ───────────────────────────────────────────────────────────

const _kBotName = 'Universe AI';
const _kBotRole = 'Virtual Assistant';
const _kBotInitials = 'AI';
const _kBotOnline = true;
const _kBotColor = Color(0xFF2E6B7F);

// ─── Models ───────────────────────────────────────────────────────────────────

class _ChatMessage {
  const _ChatMessage({
    required this.text,
    required this.isMine,
    required this.time,
    this.isBot = false,
  });
  final String text;
  final bool isMine;
  final String time;
  final bool isBot;
}

const List<_ChatMessage> _kInitialMessages = <_ChatMessage>[
  _ChatMessage(
    text: 'Hello! I am Universe AI, your virtual assistant. How can I help you today?',
    isMine: false,
    time: '09:00 AM',
    isBot: true,
  ),
  _ChatMessage(
    text: 'Can you tell me about the upcoming events?',
    isMine: true,
    time: '09:01 AM',
  ),
  _ChatMessage(
    text: 'Certainly! We have a Hackathon starting this Friday and a Career Fair on Wednesday. Would you like more details on either of these?',
    isMine: false,
    time: '09:01 AM',
    isBot: true,
  ),
];

// ─── Screen ───────────────────────────────────────────────────────────────────

class ChatBotScreen extends StatefulWidget {
  const ChatBotScreen({super.key});

  @override
  State<ChatBotScreen> createState() => _ChatBotScreenState();
}

class _ChatBotScreenState extends State<ChatBotScreen>
    with SingleTickerProviderStateMixin {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late List<_ChatMessage> _messages;
  late final AnimationController _entryCtrl;
  late final Animation<double> _fadeAnim;
  bool _isLoading = false;

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

  String _formatTime() {
    final now = TimeOfDay.now();
    final h = now.hourOfPeriod == 0 ? 12 : now.hourOfPeriod;
    final m = now.minute.toString().padLeft(2, '0');
    final period = now.period == DayPeriod.am ? 'AM' : 'PM';
    return '$h:$m $period';
  }

  Future<void> _send() async {
    final String text = _inputController.text.trim();
    if (text.isEmpty || _isLoading) return;
    final String time = _formatTime();

    setState(() {
      _isLoading = true;
      _messages = List<_ChatMessage>.from(_messages)
        ..add(_ChatMessage(text: text, isMine: true, time: time));
    });
    _inputController.clear();
    _scrollToBottom();

    try {
      final result = await ServiceLocator.instance.chatbotService.query(text);
      if (!mounted) return;

      // Build reply text — append source snippets if available
      String replyText = result.answer;
      if (result.sources.isNotEmpty && result.confidence > 0.3) {
        final preview = result.sources.first;
        replyText += '\n\n_Source: "$preview"_';
      }

      setState(() {
        _messages = List<_ChatMessage>.from(_messages)
          ..add(_ChatMessage(text: replyText, isMine: false, time: _formatTime(), isBot: true));
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _messages = List<_ChatMessage>.from(_messages)
          ..add(_ChatMessage(
            text: 'Sorry, I couldn\'t reach the server. Please check your connection and try again.',
            isMine: false,
            time: _formatTime(),
            isBot: true,
          ));
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
      _scrollToBottom();
    }
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

  @override
  Widget build(BuildContext context) {
    final double topInset = MediaQuery.paddingOf(context).top;
    final double bottomInset = MediaQuery.paddingOf(context).bottom;

    return Scaffold(
      backgroundColor: const Color(0xFFF4FAFB),
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
            isLoading: _isLoading,
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
      padding: EdgeInsets.fromLTRB(12, topInset + 10, 16, 14),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
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
          const SizedBox(width: 12),
          Stack(
            children: <Widget>[
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1A3A44), Color(0xFF2E6B7F)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                ),
                child: const Center(
                  child: Icon(
                    Icons.smart_toy_rounded,
                    color: Colors.white,
                    size: 24,
                  ),
                ),
              ),
              if (_kBotOnline)
                Positioned(
                  bottom: 1,
                  right: 1,
                  child: Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: const Color(0xFF4ADE80),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                const Text(
                  _kBotName,
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF16212A),
                  ),
                ),
                const SizedBox(height: 2),
                Row(
                  children: <Widget>[
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: Color(0xFF4ADE80),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Text(
                      'AI Assistant Online',
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
            onPressed: () {},
            icon: const Icon(Icons.info_outline_rounded, color: Color(0xFF16212A)),
          ),
        ],
      ),
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
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          decoration: BoxDecoration(
            color: const Color(0xFFE0F2F5),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            label,
            style: const TextStyle(
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: Color(0xFF2E6B7F),
              letterSpacing: 1.0,
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
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: mine ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          if (!mine) ...<Widget>[
            Container(
              width: 36,
              height: 36,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF1A3A44), Color(0xFF2E6B7F)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: Icon(
                  Icons.smart_toy_rounded,
                  color: Colors.white,
                  size: 18,
                ),
              ),
            ),
            const SizedBox(width: 10),
          ],
          ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.sizeOf(context).width * 0.75,
            ),
            child: Column(
              crossAxisAlignment:
                  mine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: <Widget>[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: mine ? const Color(0xFF1A3A44) : Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(20),
                      topRight: const Radius.circular(20),
                      bottomLeft: Radius.circular(mine ? 20 : 4),
                      bottomRight: Radius.circular(mine ? 4 : 20),
                    ),
                    boxShadow: <BoxShadow>[
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Text(
                    message.text,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: mine ? Colors.white : const Color(0xFF16212A),
                      height: 1.5,
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  message.time,
                  style: const TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 10,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF94A3B0),
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

// ─── Input bar ────────────────────────────────────────────────────────────────

class _InputBar extends StatelessWidget {
  const _InputBar({
    required this.controller,
    required this.bottomInset,
    required this.onSend,
    this.isLoading = false,
  });
  final TextEditingController controller;
  final double bottomInset;
  final VoidCallback onSend;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      padding: EdgeInsets.fromLTRB(16, 12, 16, bottomInset + 12),
      child: Row(
        children: <Widget>[
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFFF0FAFB),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(Icons.add_rounded, color: AppColors.primary, size: 24),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Container(
              height: 48,
              decoration: BoxDecoration(
                color: const Color(0xFFF4FAFB),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFFE5EEF0)),
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
                  hintText: 'Ask me anything…',
                  hintStyle: const TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 14,
                    color: Color(0xFF94A3B0),
                  ),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 14,
                  ),
                  suffixIcon: Icon(
                    Icons.mic_none_rounded,
                    color: AppColors.primary.withValues(alpha: 0.6),
                    size: 22,
                  ),
                ),
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => onSend(),
              ),
            ),
          ),
          const SizedBox(width: 10),
          GestureDetector(
            onTap: onSend,
            child: Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: <Color>[Color(0xFF1A3A44), Color(0xFF2E6B7F)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: <BoxShadow>[
                  BoxShadow(
                    color: const Color(0xFF1A3A44).withValues(alpha: 0.30),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: isLoading
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.send_rounded, color: Colors.white, size: 22),
            ),
          ),
        ],
      ),
    );
  }
}
