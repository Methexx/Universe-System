import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:universe_app/core/constants/app_colors.dart';
import 'package:universe_app/core/constants/app_routes.dart';
import 'package:universe_app/features/support/models/complaint_model.dart';
import 'package:universe_app/features/support/viewmodels/support_viewmodel.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _entryController;
  late final Animation<Offset> _slideAnim;
  late final Animation<double> _fadeAnim;

  bool _isSuggestionTab = false;

  @override
  void initState() {
    super.initState();
    _entryController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _entryController, curve: Curves.easeOutCubic));
    _fadeAnim = CurvedAnimation(parent: _entryController, curve: Curves.easeOut);
    
    _entryController.forward();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<SupportViewModel>().loadComplaints();
    });
  }

  @override
  void dispose() {
    _entryController.dispose();
    super.dispose();
  }

  void _switchTab(bool isSuggestion) {
    if (_isSuggestionTab == isSuggestion) return;
    setState(() => _isSuggestionTab = isSuggestion);
    _entryController.forward(from: 0);
  }

  @override
  Widget build(BuildContext context) {
    final double topInset = MediaQuery.paddingOf(context).top;
    final double bottomInset = MediaQuery.paddingOf(context).bottom;
    final vm = context.watch<SupportViewModel>();

    final List<ComplaintModel> items = _isSuggestionTab ? vm.suggestionsTab : vm.complaintsTab;

    return Scaffold(
      backgroundColor: const Color(0xFFF4FAFB),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          // Header
          Container(
            color: AppColors.primary,
            padding: EdgeInsets.fromLTRB(20, topInset + 16, 20, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                GestureDetector(
                  onTap: () => context.pop(),
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.arrow_back_ios_new_rounded,
                      size: 16,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Support',
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'How can we help you today?',
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: Colors.white.withValues(alpha: 0.65),
                  ),
                ),
                const SizedBox(height: 20),
                _TabSwitcher(
                  isSuggestion: _isSuggestionTab,
                  onChanged: _switchTab,
                ),
              ],
            ),
          ),

          // List Body
          Expanded(
            child: _buildList(vm, items, bottomInset),
          ),
        ],
      ),

      // FAB
      floatingActionButton: Padding(
        padding: EdgeInsets.only(bottom: bottomInset > 0 ? 0 : 8),
        child: SizedBox(
          width: double.infinity,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: _SubmitButton(
              isSuggestion: _isSuggestionTab,
              onTap: () => context.push(AppRoutes.submitComplaint, extra: _isSuggestionTab),
            ),
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  Widget _buildList(SupportViewModel vm, List<ComplaintModel> items, double bottomInset) {
    if (vm.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (vm.error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(vm.error!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => vm.loadComplaints(),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (items.isEmpty) {
      return _EmptyState(isSuggestion: _isSuggestionTab);
    }

    return FadeTransition(
      opacity: _fadeAnim,
      child: SlideTransition(
        position: _slideAnim,
        child: RefreshIndicator(
          onRefresh: vm.refresh,
          child: ListView.separated(
            padding: EdgeInsets.fromLTRB(16, 20, 16, bottomInset + 100),
            itemCount: items.length,
            separatorBuilder: (BuildContext c, int idx) => const SizedBox(height: 14),
            itemBuilder: (BuildContext ctx, int i) => _SupportCard(item: items[i]),
          ),
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.isSuggestion});
  final bool isSuggestion;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            isSuggestion ? Icons.lightbulb_outline_rounded : Icons.assignment_late_outlined,
            size: 64,
            color: const Color(0xFF94A3B0),
          ),
          const SizedBox(height: 16),
          Text(
            isSuggestion ? 'No suggestions yet' : 'No complaints yet',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: Color(0xFF16212A),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            isSuggestion 
                ? 'Your ideas help us improve our school.' 
                : 'Any issues you raise will appear here.',
            style: const TextStyle(fontSize: 13, color: Color(0xFF5A7A85)),
          ),
        ],
      ),
    );
  }
}

class _TabSwitcher extends StatelessWidget {
  const _TabSwitcher({required this.isSuggestion, required this.onChanged});
  final bool isSuggestion;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 44,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(14),
      ),
      padding: const EdgeInsets.all(4),
      child: Row(
        children: <Widget>[
          _Tab(
            label: 'Complaints',
            isActive: !isSuggestion,
            onTap: () => onChanged(false),
          ),
          _Tab(
            label: 'Suggestions',
            isActive: isSuggestion,
            onTap: () => onChanged(true),
          ),
        ],
      ),
    );
  }
}

class _Tab extends StatelessWidget {
  const _Tab({required this.label, required this.isActive, required this.onTap});
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeOutCubic,
          decoration: BoxDecoration(
            color: isActive ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: isActive ? AppColors.primary : Colors.white.withValues(alpha: 0.75),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _SupportCard extends StatelessWidget {
  const _SupportCard({required this.item});
  final ComplaintModel item;

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'academic': return const Color(0xFF2E6B7F);
      case 'teacher_conduct': return const Color(0xFF1A3A44);
      case 'facility': return const Color(0xFF4A90E2);
      case 'administrative': return const Color(0xFF5C6AC4);
      case 'suggestion': return const Color(0xFF27AE60);
      default: return const Color(0xFF94A3B0);
    }
  }

  String _getCategoryLabel(String category) {
    return category.split('_').map((e) => e[0].toUpperCase() + e.substring(1)).join(' ');
  }

  @override
  Widget build(BuildContext context) {
    final Color tagColor = _getCategoryColor(item.category);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: tagColor.withValues(alpha: 0.10),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _getCategoryLabel(item.category),
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: tagColor,
                    letterSpacing: 0.6,
                  ),
                ),
              ),
              const Spacer(),
              _StatusBadge(status: item.status),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            item.descriptionPreview,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Color(0xFF16212A),
              height: 1.5,
            ),
          ),
          const SizedBox(height: 14),
          Container(height: 1, color: const Color(0xFFEBF3F6)),
          const SizedBox(height: 12),
          Row(
            children: <Widget>[
              Text(
                'Submitted on ${item.formattedDate}',
                style: const TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF94A3B0),
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: () => context.push(AppRoutes.complaintDetail, extra: item.id),
                child: Row(
                  children: <Widget>[
                    Text(
                      'View Details',
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(width: 2),
                    Icon(Icons.arrow_forward_ios_rounded, size: 11, color: AppColors.primary),
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

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});
  final String status;

  Color _getStatusColor() {
    switch (status) {
      case 'pending': return Colors.amber;
      case 'assigned': return Colors.blue;
      case 'in_progress': return Colors.purple;
      case 'resolved': return Colors.green;
      case 'rejected': return Colors.red;
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _getStatusColor();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          fontSize: 9,
          fontWeight: FontWeight.w800,
          color: color,
        ),
      ),
    );
  }
}

class _SubmitButton extends StatelessWidget {
  const _SubmitButton({required this.isSuggestion, required this.onTap});
  final bool isSuggestion;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final String label = isSuggestion ? 'Submit New Suggestion' : 'Submit New Complaint';

    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 52,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF1A3A44), Color(0xFF2E6B7F)],
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: <BoxShadow>[
            BoxShadow(
              color: const Color(0xFF1A3A44).withValues(alpha: 0.35),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Icon(Icons.add_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
