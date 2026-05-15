import 'package:flutter/material.dart';
import 'package:universe_app/core/constants/app_colors.dart';

class TermsOfServiceScreen extends StatelessWidget {
  const TermsOfServiceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4FAFB),
      appBar: AppBar(
        title: const Text('Terms of Service', style: TextStyle(fontWeight: FontWeight.w800, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSection(
              'Terms of Service',
              'Last Updated: May 2026',
              isHeader: true,
            ),
            const SizedBox(height: 24),
            _buildSection(
              '1. Acceptance of Terms',
              'By accessing or using our application, you agree to be bound by these terms of service and all applicable laws and regulations.',
            ),
            _buildSection(
              '2. Use License',
              'Permission is granted to temporarily use this application for personal, non-commercial school-related communication only.',
            ),
            _buildSection(
              '3. User Responsibilities',
              'Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.',
            ),
            _buildSection(
              '4. Limitations',
              'In no event shall the school or its developers be liable for any damages arising out of the use or inability to use the application.',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(String title, String content, {bool isHeader = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: isHeader ? 22 : 16,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF16212A),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF78909C),
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }
}
