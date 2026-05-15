import 'package:flutter/material.dart';
import 'package:universe_app/core/constants/app_colors.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4FAFB),
      appBar: AppBar(
        title: const Text('Privacy Policy', style: TextStyle(fontWeight: FontWeight.w800, color: Colors.white)),
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
              'Privacy Policy Statement',
              'Last Updated: May 2026',
              isHeader: true,
            ),
            const SizedBox(height: 24),
            _buildSection(
              '1. Data Collection',
              'We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This includes your name, email, and student-related information.',
            ),
            _buildSection(
              '2. Use of Information',
              'We use the information we collect to provide, maintain, and improve our services, including facilitating communication between parents and teachers and providing school notifications.',
            ),
            _buildSection(
              '3. Data Security',
              'We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.',
            ),
            _buildSection(
              '4. Contact Us',
              'If you have any questions about this Privacy Policy, please contact us at support@school.lk.',
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
