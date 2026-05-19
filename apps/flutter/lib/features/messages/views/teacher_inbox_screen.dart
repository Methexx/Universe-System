import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:universe_app/core/constants/app_colors.dart';
import 'package:universe_app/features/auth/viewmodels/auth_viewmodel.dart';
import 'package:universe_app/features/messages/models/message_models.dart';
import 'package:universe_app/features/messages/viewmodels/messages_viewmodel.dart';

class TeacherInboxScreen extends StatefulWidget {
  final String? initialContactId;
  const TeacherInboxScreen({super.key, this.initialContactId});

  @override
  State<TeacherInboxScreen> createState() => _TeacherInboxScreenState();
}

class _TeacherInboxScreenState extends State<TeacherInboxScreen> {
  ContactModel? _activeContact;
  Timer? _pollTimer;
  final TextEditingController _inputCtrl = TextEditingController();
  final ScrollController _scrollCtrl = ScrollController();
  bool _isSending = false;

  String? get _userId => context.read<AuthViewModel>().currentUser?.id;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _init());
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _inputCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  Future<void> _init() async {
    final vm = context.read<MessagesViewModel>();
    await vm.fetchInbox(userId: _userId);
    await vm.fetchContacts();

    if (widget.initialContactId != null) {
      final match = vm.contacts.where((c) => c.id == widget.initialContactId).toList();
      if (match.isNotEmpty && mounted) {
        _openChat(match.first);
        return;
      }
    }
  }

  void _openChat(ContactModel contact) {
    setState(() => _activeContact = contact);
    _pollTimer?.cancel();
    context.read<MessagesViewModel>().fetchThread(contact.id, userId: _userId);
    _startPolling(contact.id);
    _scrollToBottom();
  }

  void _closeChat() {
    _pollTimer?.cancel();
    context.read<MessagesViewModel>().clearMessages();
    setState(() => _activeContact = null);
  }

  void _startPolling(String contactId) {
    _pollTimer = Timer.periodic(const Duration(seconds: 5), (_) async {
      if (!mounted || _activeContact?.id != contactId) return;
      await context.read<MessagesViewModel>().fetchThread(contactId, userId: _userId);
    });
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _send() async {
    final text = _inputCtrl.text.trim();
    if (text.isEmpty || _activeContact == null || _isSending) return;
    setState(() => _isSending = true);

    _inputCtrl.clear();
    _scrollToBottom();

    final success = await context.read<MessagesViewModel>().sendMessage(
          receiverId: _activeContact!.id,
          content: text,
          studentId: _activeContact!.studentId,
          userId: _userId,
        );

    if (mounted) {
      setState(() => _isSending = false);
      if (!success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(context.read<MessagesViewModel>().error ?? 'Failed to send message')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final topInset = MediaQuery.paddingOf(context).top;
    final bottomInset = MediaQuery.paddingOf(context).bottom;
    final vm = context.watch<MessagesViewModel>();

    return Scaffold(
      backgroundColor: const Color(0xFFF4F6FA),
      body: Column(
        children: [
          _AppBar(
            topInset: topInset,
            activeContact: _activeContact,
            onBack: _activeContact != null ? _closeChat : null,
            onNewMessage: () => _showContactsSheet(context),
          ),
          Expanded(
            child: _activeContact != null
                ? _ChatBody(
                    vm: vm,
                    scrollCtrl: _scrollCtrl,
                    contact: _activeContact!,
                  )
                : _InboxBody(
                    vm: vm,
                    onThreadTap: (contact) => _openChat(contact),
                    onNewMessage: () => _showContactsSheet(context),
                  ),
          ),
          if (_activeContact != null)
            _InputBar(
              controller: _inputCtrl,
              bottomInset: bottomInset,
              isSending: _isSending,
              onSend: _send,
            ),
        ],
      ),
    );
  }

  void _showContactsSheet(BuildContext context) {
    final vm = context.read<MessagesViewModel>();
    final contacts = vm.contacts;

    // Group: admins/security at top, then parents grouped by student
    final staffContacts = contacts.where((c) => c.role == 'admin' || c.role == 'security').toList();
    final parentContacts = contacts.where((c) => c.role == 'parent').toList();

    // Group parents by studentName
    final Map<String, List<ContactModel>> byStudent = {};
    for (final p in parentContacts) {
      final key = p.studentName ?? 'Unknown Student';
      byStudent.putIfAbsent(key, () => []).add(p);
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) {
        return DraggableScrollableSheet(
          initialChildSize: 0.65,
          maxChildSize: 0.92,
          minChildSize: 0.4,
          expand: false,
          builder: (_, scrollCtrl) => Column(
            children: [
              const SizedBox(height: 12),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFE0E0E0),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'New Message',
                style: TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF16212A),
                ),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: ListView(
                  controller: scrollCtrl,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: [
                    if (staffContacts.isNotEmpty) ...[
                      _SectionHeader(label: 'Staff'),
                      ...staffContacts.map((c) => _ContactTile(
                            contact: c,
                            onTap: () {
                              Navigator.pop(context);
                              _openChat(c);
                            },
                          )),
                      const SizedBox(height: 8),
                    ],
                    if (byStudent.isNotEmpty) ...[
                      _SectionHeader(label: 'Students & Parents'),
                      ...byStudent.entries.map((entry) => Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Padding(
                                padding: const EdgeInsets.fromLTRB(4, 12, 4, 6),
                                child: Text(
                                  entry.key,
                                  style: const TextStyle(
                                    fontFamily: 'Plus Jakarta Sans',
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0xFF94A3B0),
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ),
                              ...entry.value.map((c) => _ContactTile(
                                    contact: c,
                                    subtitle: 'Parent',
                                    onTap: () {
                                      Navigator.pop(context);
                                      _openChat(c);
                                    },
                                  )),
                            ],
                          )),
                    ],
                    if (contacts.isEmpty)
                      const Padding(
                        padding: EdgeInsets.all(32),
                        child: Center(
                          child: Text(
                            'No contacts found.\nYou may not have any classes assigned yet.',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Color(0xFF94A3B0)),
                          ),
                        ),
                      ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// ─── App bar ─────────────────────────────────────────────────────────────────

class _AppBar extends StatelessWidget {
  const _AppBar({
    required this.topInset,
    required this.activeContact,
    required this.onBack,
    required this.onNewMessage,
  });

  final double topInset;
  final ContactModel? activeContact;
  final VoidCallback? onBack;
  final VoidCallback onNewMessage;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: EdgeInsets.fromLTRB(12, topInset + 10, 16, 14),
      child: Row(
        children: [
          if (onBack != null)
            GestureDetector(
              onTap: onBack,
              child: Container(
                width: 36,
                height: 36,
                margin: const EdgeInsets.only(right: 10),
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
            )
          else
            const SizedBox(width: 4),
          Expanded(
            child: activeContact != null
                ? Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        activeContact!.fullName ?? 'Contact',
                        style: const TextStyle(
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF16212A),
                        ),
                      ),
                      if (activeContact!.studentName != null)
                        Text(
                          'Parent of ${activeContact!.studentName}',
                          style: const TextStyle(
                            fontFamily: 'Plus Jakarta Sans',
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF94A3B0),
                          ),
                        )
                      else
                        Text(
                          _capitalizeRole(activeContact!.role),
                          style: const TextStyle(
                            fontFamily: 'Plus Jakarta Sans',
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF94A3B0),
                          ),
                        ),
                    ],
                  )
                : const Text(
                    'Messages',
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF16212A),
                    ),
                  ),
          ),
          if (activeContact == null)
            GestureDetector(
              onTap: onNewMessage,
              child: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(Icons.edit_outlined, size: 18, color: AppColors.primary),
              ),
            ),
        ],
      ),
    );
  }

  String _capitalizeRole(String role) {
    if (role.isEmpty) return '';
    return role[0].toUpperCase() + role.substring(1);
  }
}

// ─── Inbox body (thread list) ─────────────────────────────────────────────────

class _InboxBody extends StatelessWidget {
  const _InboxBody({
    required this.vm,
    required this.onThreadTap,
    required this.onNewMessage,
  });

  final MessagesViewModel vm;
  final void Function(ContactModel) onThreadTap;
  final VoidCallback onNewMessage;

  @override
  Widget build(BuildContext context) {
    if (vm.isLoading && vm.threads.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (vm.threads.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.inbox_rounded, size: 56, color: AppColors.primary.withValues(alpha: 0.3)),
            const SizedBox(height: 16),
            const Text(
              'No messages yet',
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: Color(0xFF94A3B0),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Tap the pencil icon to start a conversation',
              style: TextStyle(fontSize: 13, color: Color(0xFFB0BEC5)),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => vm.fetchInbox(userId: context.read<AuthViewModel>().currentUser?.id),
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: vm.threads.length,
        separatorBuilder: (_, __) => const Divider(height: 1, indent: 72),
        itemBuilder: (context, index) {
          final thread = vm.threads[index];
          // Find the contact matching this thread user to get studentName
          final contact = vm.contacts.where((c) => c.id == thread.user.id).toList();
          final studentName = contact.isNotEmpty ? contact.first.studentName : null;
          final studentId = contact.isNotEmpty ? contact.first.studentId : null;

          final contactModel = ContactModel(
            id: thread.user.id,
            fullName: thread.user.fullName,
            role: thread.user.role,
            avatarUrl: thread.user.avatarUrl,
            studentName: studentName,
            studentId: studentId,
          );

          return _ThreadTile(
            thread: thread,
            studentName: studentName,
            onTap: () => onThreadTap(contactModel),
          );
        },
      ),
    );
  }
}

class _ThreadTile extends StatelessWidget {
  const _ThreadTile({
    required this.thread,
    required this.onTap,
    this.studentName,
  });

  final ThreadModel thread;
  final String? studentName;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final initials = thread.user.fullName != null
        ? thread.user.fullName!
            .split(' ')
            .where((e) => e.isNotEmpty)
            .take(2)
            .map((e) => e[0])
            .join()
            .toUpperCase()
        : '?';

    final now = DateTime.now();
    final created = thread.lastMessage.createdAt;
    final isToday = created.year == now.year && created.month == now.month && created.day == now.day;
    final timeLabel = isToday
        ? DateFormat('hh:mm a').format(created)
        : DateFormat('dd/MM').format(created);

    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      leading: CircleAvatar(
        radius: 22,
        backgroundColor: AppColors.primary.withValues(alpha: 0.12),
        backgroundImage:
            thread.user.avatarUrl != null ? NetworkImage(thread.user.avatarUrl!) : null,
        child: thread.user.avatarUrl == null
            ? Text(
                initials,
                style: TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primary,
                ),
              )
            : null,
      ),
      title: Text(
        thread.user.fullName ?? 'Unknown',
        style: const TextStyle(
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: FontWeight.w700,
          fontSize: 14,
          color: Color(0xFF16212A),
        ),
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (studentName != null)
            Text(
              'Parent of $studentName',
              style: const TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 11,
                color: Color(0xFF94A3B0),
                fontWeight: FontWeight.w500,
              ),
            ),
          Text(
            thread.lastMessage.content,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 12,
              color: thread.unreadCount > 0
                  ? const Color(0xFF16212A)
                  : const Color(0xFF94A3B0),
              fontWeight: thread.unreadCount > 0 ? FontWeight.w600 : FontWeight.w400,
            ),
          ),
        ],
      ),
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            timeLabel,
            style: const TextStyle(
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 11,
              color: Color(0xFF94A3B0),
            ),
          ),
          if (thread.unreadCount > 0) ...[
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
              ),
              child: Text(
                '${thread.unreadCount}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ],
      ),
      onTap: onTap,
    );
  }
}

// ─── Chat body (message list) ─────────────────────────────────────────────────

class _ChatBody extends StatelessWidget {
  const _ChatBody({
    required this.vm,
    required this.scrollCtrl,
    required this.contact,
  });

  final MessagesViewModel vm;
  final ScrollController scrollCtrl;
  final ContactModel contact;

  @override
  Widget build(BuildContext context) {
    if (vm.isLoading && vm.messages.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (vm.messages.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.chat_bubble_outline_rounded,
                size: 48, color: AppColors.primary.withValues(alpha: 0.3)),
            const SizedBox(height: 12),
            const Text(
              'No messages yet.\nSay hello!',
              textAlign: TextAlign.center,
              style: TextStyle(color: Color(0xFF94A3B0), fontSize: 14),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      controller: scrollCtrl,
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      itemCount: vm.messages.length + 1,
      itemBuilder: (ctx, i) {
        if (i == 0) {
          return const _DateChip(label: 'TODAY');
        }
        return _MessageBubble(message: vm.messages[i - 1]);
      },
    );
  }
}

// ─── Shared widgets ───────────────────────────────────────────────────────────

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
        : '?';

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment: mine ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!mine) ...[
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
              crossAxisAlignment: mine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
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
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.06),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Text(
                    message.content,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: mine ? Colors.white : const Color(0xFF16212A),
                      height: 1.45,
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      time,
                      style: const TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF94A3B0),
                      ),
                    ),
                    if (mine) ...[
                      const SizedBox(width: 4),
                      if (message.isPending)
                        const Icon(
                          Icons.schedule_rounded,
                          size: 12,
                          color: Color(0xFF94A3B0),
                        )
                      else
                        Icon(
                          Icons.done_all_rounded,
                          size: 14,
                          color: message.isRead
                              ? const Color(0xFF3EA8D8)
                              : const Color(0xFF94A3B0),
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

class _InputBar extends StatelessWidget {
  const _InputBar({
    required this.controller,
    required this.bottomInset,
    required this.isSending,
    required this.onSend,
  });

  final TextEditingController controller;
  final double bottomInset;
  final bool isSending;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: EdgeInsets.fromLTRB(12, 10, 12, bottomInset + 10),
      child: Row(
        children: [
          Expanded(
            child: Container(
              constraints: const BoxConstraints(minHeight: 44, maxHeight: 120),
              decoration: BoxDecoration(
                color: const Color(0xFFF4FAFB),
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: const Color(0xFFDDE8ED)),
              ),
              child: TextField(
                controller: controller,
                maxLines: null,
                style: const TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF16212A),
                ),
                decoration: const InputDecoration(
                  hintText: 'Type a message…',
                  hintStyle: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 14,
                    color: Color(0xFF94A3B0),
                  ),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => onSend(),
              ),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: isSending ? null : onSend,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isSending
                      ? [const Color(0xFFB0BEC5), const Color(0xFF90A4AE)]
                      : [const Color(0xFF1A3A44), const Color(0xFF2E6B7F)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF1A3A44).withValues(alpha: 0.30),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: isSending
                  ? const Padding(
                      padding: EdgeInsets.all(12),
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : const Icon(Icons.send_rounded, color: Colors.white, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Contact tile ─────────────────────────────────────────────────────────────

class _ContactTile extends StatelessWidget {
  const _ContactTile({
    required this.contact,
    required this.onTap,
    this.subtitle,
  });

  final ContactModel contact;
  final VoidCallback onTap;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    final initials = contact.fullName != null
        ? contact.fullName!
            .split(' ')
            .where((e) => e.isNotEmpty)
            .take(2)
            .map((e) => e[0])
            .join()
            .toUpperCase()
        : '?';

    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
      leading: CircleAvatar(
        radius: 20,
        backgroundColor: AppColors.primary.withValues(alpha: 0.12),
        child: Text(
          initials,
          style: TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 12,
            fontWeight: FontWeight.w800,
            color: AppColors.primary,
          ),
        ),
      ),
      title: Text(
        contact.fullName ?? 'Unknown',
        style: const TextStyle(
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: Color(0xFF16212A),
        ),
      ),
      subtitle: subtitle != null
          ? Text(
              subtitle!,
              style: const TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 12,
                color: Color(0xFF94A3B0),
              ),
            )
          : null,
      onTap: onTap,
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 8, 4, 4),
      child: Text(
        label.toUpperCase(),
        style: const TextStyle(
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 11,
          fontWeight: FontWeight.w800,
          color: Color(0xFF94A3B0),
          letterSpacing: 1.0,
        ),
      ),
    );
  }
}
