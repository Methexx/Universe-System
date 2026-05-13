import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:universe_app/core/constants/app_colors.dart';
import 'package:universe_app/features/profile/viewmodels/profile_viewmodel.dart';
import 'package:universe_app/features/support/viewmodels/support_viewmodel.dart';

class SubmitComplaintScreen extends StatefulWidget {
  const SubmitComplaintScreen({super.key, this.isSuggestion = false});
  final bool isSuggestion;

  @override
  State<SubmitComplaintScreen> createState() => _SubmitComplaintScreenState();
}

class _SubmitComplaintScreenState extends State<SubmitComplaintScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();
  late String _selectedCategory;
  bool _linkToStudent = false;

  final List<Map<String, String>> _categories = [
    {'value': 'academic', 'label': 'Academic Issue'},
    {'value': 'teacher_conduct', 'label': 'Teacher Conduct'},
    {'value': 'facility', 'label': 'Facility/Maintenance'},
    {'value': 'administrative', 'label': 'Administrative'},
    {'value': 'suggestion', 'label': 'General Suggestion'},
    {'value': 'other', 'label': 'Other'},
  ];

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.isSuggestion ? 'suggestion' : 'academic';
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final vm = context.read<SupportViewModel>();
    final profileVm = context.read<ProfileViewModel>();
    
    final studentId = _linkToStudent ? profileVm.profile?.student?.id : null;

    final success = await vm.submitComplaint(
      category: _selectedCategory,
      description: _descriptionController.text.trim(),
      studentId: studentId,
    );

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Submitted successfully!'),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
          ),
        );
        context.pop();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final double topInset = MediaQuery.paddingOf(context).top;
    final profileVm = context.watch<ProfileViewModel>();
    final hasStudent = profileVm.profile?.student != null;
    final vm = context.watch<SupportViewModel>();

    return Scaffold(
      backgroundColor: const Color(0xFFF4FAFB),
      body: Column(
        children: [
          // ── Header ───────────────────────────────────────────────────────
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(32),
                bottomRight: Radius.circular(32),
              ),
            ),
            padding: EdgeInsets.fromLTRB(20, topInset + 16, 20, 32),
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
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.arrow_back_ios_new_rounded,
                      size: 16,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  widget.isSuggestion ? 'New Suggestion' : 'New Complaint',
                  style: const TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  widget.isSuggestion 
                    ? 'Share your ideas to help us improve.' 
                    : 'Tell us what went wrong, we are here to help.',
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 13,
                    color: Colors.white.withValues(alpha: 0.7),
                  ),
                ),
              ],
            ),
          ),
          
          // ── Form ─────────────────────────────────────────────────────────
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (vm.submitError != null)
                      _ErrorBanner(message: vm.submitError!),

                    _buildSectionLabel('Category'),
                    const SizedBox(height: 10),
                    _buildCard(
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _selectedCategory,
                          isExpanded: true,
                          icon: const Icon(Icons.unfold_more_rounded, color: Color(0xFF5A7A85)),
                          style: const TextStyle(
                            fontFamily: 'Plus Jakarta Sans',
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF16212A),
                          ),
                          items: _categories.map((cat) {
                            return DropdownMenuItem(
                              value: cat['value'],
                              child: Text(cat['label']!),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _selectedCategory = val);
                          },
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),
                    _buildSectionLabel('Description'),
                    const SizedBox(height: 10),
                    _buildCard(
                      padding: EdgeInsets.zero,
                      child: TextFormField(
                        controller: _descriptionController,
                        maxLines: 6,
                        maxLength: 1000,
                        style: const TextStyle(
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: 15,
                          color: Color(0xFF16212A),
                        ),
                        decoration: InputDecoration(
                          hintText: widget.isSuggestion 
                              ? 'Your suggestion...' 
                              : 'Explain the issue in detail...',
                          hintStyle: const TextStyle(color: Color(0xFF94A3B0), fontSize: 14),
                          filled: true,
                          fillColor: Colors.white,
                          contentPadding: const EdgeInsets.all(16),
                          border: InputBorder.none,
                          enabledBorder: InputBorder.none,
                          focusedBorder: InputBorder.none,
                          counterStyle: const TextStyle(fontSize: 10, color: Color(0xFF94A3B0)),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Please enter a description';
                          }
                          if (value.trim().length < 20) {
                            return 'At least 20 characters required';
                          }
                          return null;
                        },
                      ),
                    ),

                    if (hasStudent) ...[
                      const SizedBox(height: 24),
                      _buildCard(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: SwitchListTile.adaptive(
                          contentPadding: EdgeInsets.zero,
                          title: const Text(
                            'Relate to my child',
                            style: TextStyle(
                              fontFamily: 'Plus Jakarta Sans',
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF16212A),
                            ),
                          ),
                          subtitle: Text(
                            'Issue related to ${profileVm.profile?.student?.fullName}',
                            style: const TextStyle(
                              fontFamily: 'Plus Jakarta Sans',
                              fontSize: 12,
                              color: Color(0xFF5A7A85),
                            ),
                          ),
                          value: _linkToStudent,
                          activeThumbColor: Colors.white,
                          activeTrackColor: AppColors.primary,
                          onChanged: (val) => setState(() => _linkToStudent = val),
                        ),
                      ),
                    ],

                    const SizedBox(height: 48),
                    _SubmitButton(
                      isLoading: vm.isSubmitting,
                      onTap: _submit,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionLabel(String label) {
    return Text(
      label.toUpperCase(),
      style: const TextStyle(
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 11,
        fontWeight: FontWeight.w800,
        color: Color(0xFF94A3B0),
        letterSpacing: 1.2,
      ),
    );
  }

  Widget _buildCard({required Widget child, EdgeInsets padding = const EdgeInsets.all(16)}) {
    return Container(
      padding: padding,
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
        border: Border.all(color: const Color(0xFFEBF3F6)),
      ),
      child: child,
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF1F1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFFD1D1)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline_rounded, color: Color(0xFFD32F2F), size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Color(0xFFD32F2F),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SubmitButton extends StatelessWidget {
  const _SubmitButton({required this.isLoading, required this.onTap});
  final bool isLoading;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isLoading ? null : onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        height: 56,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: isLoading 
              ? [const Color(0xFF94A3B0), const Color(0xFF94A3B0)]
              : [const Color(0xFF1A3A44), const Color(0xFF2E6B7F)],
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
          ),
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            if (!isLoading)
              BoxShadow(
                color: const Color(0xFF1A3A44).withValues(alpha: 0.3),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
          ],
        ),
        child: Center(
          child: isLoading
              ? const SizedBox(
                  height: 24,
                  width: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    valueColor: AlwaysStoppedAnimation(Colors.white),
                  ),
                )
              : const Text(
                  'Submit Now',
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
        ),
      ),
    );
  }
}
