import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:universe_app/core/constants/app_colors.dart';
import 'package:universe_app/features/support/viewmodels/support_viewmodel.dart';

class ComplaintDetailScreen extends StatefulWidget {
  const ComplaintDetailScreen({super.key, required this.complaintId});
  final String complaintId;

  @override
  State<ComplaintDetailScreen> createState() => _ComplaintDetailScreenState();
}

class _ComplaintDetailScreenState extends State<ComplaintDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<SupportViewModel>().loadComplaintDetail(widget.complaintId);
    });
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'pending': return Colors.amber;
      case 'assigned': return Colors.blue;
      case 'in_progress': return Colors.purple;
      case 'resolved': return Colors.green;
      case 'rejected': return Colors.red;
      default: return Colors.grey;
    }
  }

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
    final double topInset = MediaQuery.paddingOf(context).top;
    final vm = context.watch<SupportViewModel>();

    return Scaffold(
      backgroundColor: const Color(0xFFF4FAFB),
      body: Column(
        children: [
          // Header
          Container(
            color: AppColors.primary,
            padding: EdgeInsets.fromLTRB(20, topInset + 16, 20, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
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
                  'Details',
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),

          Expanded(
            child: _buildBody(vm),
          ),
        ],
      ),
    );
  }

  Widget _buildBody(SupportViewModel vm) {
    if (vm.isLoadingDetail) {
      return const Center(child: CircularProgressIndicator());
    }

    if (vm.detailError != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(vm.detailError!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => vm.loadComplaintDetail(widget.complaintId),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    final complaint = vm.selectedComplaint;
    if (complaint == null) return const SizedBox.shrink();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Meta Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: _getCategoryColor(complaint.category).withValues(alpha: 0.10),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        _getCategoryLabel(complaint.category),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: _getCategoryColor(complaint.category),
                          letterSpacing: 0.6,
                        ),
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: _getStatusColor(complaint.status).withValues(alpha: 0.10),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        complaint.status.toUpperCase(),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: _getStatusColor(complaint.status),
                          letterSpacing: 0.6,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _InfoRow(label: 'Submitted on', value: complaint.formattedDate),
                if (complaint.studentFullName != null) ...[
                  const SizedBox(height: 8),
                  _InfoRow(label: 'Related to', value: complaint.studentFullName!),
                ],
                if (complaint.assignedToFullName != null) ...[
                  const SizedBox(height: 8),
                  _InfoRow(label: 'Assigned to', value: complaint.assignedToFullName!),
                ],
              ],
            ),
          ),

          const SizedBox(height: 20),
          // Description Card
          const Text(
            'Description',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF16212A)),
          ),
          const SizedBox(height: 10),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFEBF3F6)),
            ),
            child: Text(
              complaint.description,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w400,
                color: Color(0xFF5A7A85),
                height: 1.6,
              ),
            ),
          ),

          if (complaint.replyNote != null && complaint.replyNote!.isNotEmpty) ...[
            const SizedBox(height: 24),
            const Text(
              'Response from School',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF16212A)),
            ),
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFE3F2FD),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.blue.shade100),
              ),
              child: Text(
                complaint.replyNote!,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF1A3A44),
                  height: 1.6,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFF94A3B0)),
        ),
        Text(
          value,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF16212A)),
        ),
      ],
    );
  }
}
