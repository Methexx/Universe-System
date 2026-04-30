import 'package:flutter/material.dart';
import 'package:universe_app/core/constants/app_colors.dart';
import 'package:universe_app/shared/widgets/app_button.dart';

class ProfileSetupScreen extends StatefulWidget {
  const ProfileSetupScreen({super.key});

  @override
  State<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends State<ProfileSetupScreen> {
  String? _selectedGender;
  String? _selectedRole;
  String? _selectedInterest;

  final List<String> _genders = ['Male', 'Female', 'Other'];
  final List<String> _roles = ['Student', 'Teacher', 'Parent'];
  final List<String> _interests = ['Programming', 'Design', 'Marketing', 'Business', 'Music'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Fill Your Profile',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            Stack(
              children: [
                CircleAvatar(
                  radius: 60,
                  backgroundColor: Colors.grey[200],
                  backgroundImage: const AssetImage('Assets/welcome2.png'), // Placeholder
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.edit,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
            _buildDropdown(
              label: 'Gender',
              value: _selectedGender,
              items: _genders,
              onChanged: (val) => setState(() => _selectedGender = val),
              hint: 'Select Gender',
            ),
            const SizedBox(height: 20),
            _buildDropdown(
              label: 'Role',
              value: _selectedRole,
              items: _roles,
              onChanged: (val) => setState(() => _selectedRole = val),
              hint: 'Select Role',
            ),
            const SizedBox(height: 20),
            _buildDropdown(
              label: 'Primary Interest',
              value: _selectedInterest,
              items: _interests,
              onChanged: (val) => setState(() => _selectedInterest = val),
              hint: 'Select Interest',
            ),
            const SizedBox(height: 40),
            AppButton(
              text: 'Continue',
              onPressed: () {
                // Navigate to dashboard or next step
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDropdown({
    required String label,
    required String? value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
    required String hint,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 14,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: value,
          hint: Text(hint),
          items: items.map((String item) {
            return DropdownMenuItem(
              value: item,
              child: Text(item),
            );
          }).toList(),
          onChanged: onChanged,
          decoration: const InputDecoration(),
          icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.primary),
          dropdownColor: Colors.white,
          borderRadius: BorderRadius.circular(12),
        ),
      ],
    );
  }
}
