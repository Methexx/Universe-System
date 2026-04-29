import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../viewmodels/messages_viewmodel.dart';
import '../models/message_models.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MessagesViewModel>().fetchInbox();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Messages',
          style: TextStyle(
            color: Color(0xFF16212A),
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFF16212A)),
        actions: [
          IconButton(
            onPressed: () {
              context.read<MessagesViewModel>().fetchContacts();
              _showContactsBottomSheet(context);
            },
            icon: const Icon(Icons.add_comment_outlined),
          ),
        ],
      ),
      body: Consumer<MessagesViewModel>(
        builder: (context, viewModel, child) {
          if (viewModel.isLoading && viewModel.threads.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (viewModel.error != null && viewModel.threads.isEmpty) {
            return Center(child: Text('Error: ${viewModel.error}'));
          }

          if (viewModel.threads.isEmpty) {
            return const Center(
              child: Text(
                'No conversations yet.',
                style: TextStyle(color: Colors.grey),
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: viewModel.fetchInbox,
            child: ListView.separated(
              itemCount: viewModel.threads.length,
              separatorBuilder: (context, index) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final thread = viewModel.threads[index];
                return ListTile(
                  leading: CircleAvatar(
                    backgroundColor: const Color(0xFF63BEDB).withOpacity(0.2),
                    backgroundImage: thread.user.avatarUrl != null
                        ? NetworkImage(thread.user.avatarUrl!)
                        : null,
                    child: thread.user.avatarUrl == null
                        ? Text(
                            thread.user.fullName?.substring(0, 1).toUpperCase() ?? '?',
                            style: const TextStyle(
                              color: Color(0xFF16212A),
                              fontWeight: FontWeight.bold,
                            ),
                          )
                        : null,
                  ),
                  title: Text(
                    thread.user.fullName ?? 'Unknown',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text(
                    thread.lastMessage.content,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        _formatTime(thread.lastMessage.createdAt),
                        style: const TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                      if (thread.unreadCount > 0)
                        Container(
                          margin: const EdgeInsets.only(top: 4),
                          padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(
                            color: Color(0xFF63BEDB),
                            shape: BoxShape.circle,
                          ),
                          child: Text(
                            '${thread.unreadCount}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                    ],
                  ),
                  onTap: () {
                    // Navigate to individual chat screen (to be implemented)
                  },
                );
              },
            ),
          );
        },
      ),
    );
  }

  String _formatTime(DateTime date) {
    final now = DateTime.now();
    if (date.year == now.year && date.month == now.month && date.day == now.day) {
      return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    }
    return '${date.day}/${date.month}';
  }

  void _showContactsBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Consumer<MessagesViewModel>(
          builder: (context, viewModel, child) {
            return Container(
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Select Contact',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 10),
                  if (viewModel.isLoading)
                    const Center(child: CircularProgressIndicator())
                  else if (viewModel.contacts.isEmpty)
                    const Padding(
                      padding: EdgeInsets.all(20.0),
                      child: Text('No contacts available.'),
                    )
                  else
                    Expanded(
                      child: ListView.builder(
                        itemCount: viewModel.contacts.length,
                        itemBuilder: (context, index) {
                          final contact = viewModel.contacts[index];
                          return ListTile(
                            leading: CircleAvatar(
                              backgroundColor: const Color(0xFF63BEDB).withOpacity(0.2),
                              child: Text(contact.fullName?.substring(0, 1).toUpperCase() ?? '?'),
                            ),
                            title: Text(contact.fullName ?? 'Unknown'),
                            subtitle: Text(contact.role),
                            onTap: () {
                              Navigator.pop(context);
                              // Navigate to individual chat screen
                            },
                          );
                        },
                      ),
                    ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
