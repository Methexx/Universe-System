import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:universe_app/core/constants/app_colors.dart';
import 'package:universe_app/core/constants/app_routes.dart';
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
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
          child: Column(
            children: [
              // Logo section
              Container(
                width: 100,
                height: 100,
                decoration: const BoxDecoration(
                  color: Color(0xFF1A3A44),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black12,
                      blurRadius: 10,
                      offset: Offset(0, 5),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(20),
                child: Image.asset(
                  'Assets/logo.png',
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(height: 32),
              const Text(
                'Set up your parent\nprofile',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'This information is used to determine your enrolled\nmodules, assigned lecturers, and relevant content',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 32),
              // White container
              Container(
                width: double.infinity,
                decoration: ShapeDecoration(
                  color: Colors.white,
                  shape: ContinuousRectangleBorder(
                    borderRadius: BorderRadius.circular(42), // Large radius for 100% smoothing feel
                  ),
                  shadows: const [
                    BoxShadow(
                      color: Colors.black12,
                      blurRadius: 20,
                      offset: Offset(0, 10),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    _buildDropdown(
                      label: 'Grade',
                      value: _selectedGender, // Placeholder mapping
                      items: ['Grade 1', 'Grade 2', 'Grade 3'],
                      onChanged: (val) => setState(() => _selectedGender = val),
                      hint: 'Select your Grade',
                    ),
                    const SizedBox(height: 20),
                    _buildDropdown(
                      label: 'Class',
                      value: _selectedRole,
                      items: ['Class A', 'Class B', 'Class C'],
                      onChanged: (val) => setState(() => _selectedRole = val),
                      hint: 'Select your Class',
                    ),
                    const SizedBox(height: 20),
                    _buildDropdown(
                      label: 'Admission Year',
                      value: _selectedInterest,
                      items: ['2023', '2024', '2025'],
                      onChanged: (val) => setState(() => _selectedInterest = val),
                      hint: 'Select your Admission Year',
                    ),
                    const SizedBox(height: 20),
                    _buildDropdown(
                      label: 'Current Academic Year',
                      value: null,
                      items: ['2023/24', '2024/25'],
                      onChanged: (val) {},
                      hint: 'Select academic year',
                    ),
                    const SizedBox(height: 32),
                    AppButton(
                      text: 'Continue',
                      onPressed: () => context.go(AppRoutes.dashboard),
                      width: double.infinity,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              const Text(
                'Your academic profile verification act like your data\nwith two factor authentication',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                  height: 1.5,
                ),
              ),
            ],
          ),
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
            fontWeight: FontWeight.w700,
            fontSize: 14,
            color: Colors.black,
          ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: value,
          hint: Text(
            hint,
            style: TextStyle(
              color: Colors.black.withValues(alpha: 0.55),
              fontSize: 14,
              fontWeight: FontWeight.w400,
            ),
          ),
          items: items.map((String item) {
            return DropdownMenuItem(
              value: item,
              child: Text(item),
            );
          }).toList(),
          onChanged: onChanged,
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: Colors.black.withValues(alpha: 0.1)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: Colors.black.withValues(alpha: 0.1)),
            ),
          ),
          icon: Icon(Icons.keyboard_arrow_down_rounded, color: Colors.black.withValues(alpha: 0.55)),
          dropdownColor: Colors.white,
          borderRadius: BorderRadius.circular(12),
        ),
      ],
    );
  }
}
