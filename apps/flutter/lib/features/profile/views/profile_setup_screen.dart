import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:universe_app/core/constants/app_colors.dart';
import 'package:universe_app/core/constants/app_routes.dart';
import 'package:universe_app/features/auth/viewmodels/auth_viewmodel.dart';
import 'package:universe_app/shared/widgets/app_button.dart';

class ProfileSetupScreen extends StatefulWidget {
  const ProfileSetupScreen({super.key});

  @override
  State<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends State<ProfileSetupScreen> {
  String? _selectedGrade;
  String? _selectedClass;
  String? _selectedAdmissionYear;
  String? _selectedGender;

  final List<String> _grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13'];
  final List<String> _classes = ['Class A', 'Class B', 'Class C', 'Class D', 'Class E', 'Class F', 'Class G', 'Class H', 'Class I', 'Class J'];
  final List<String> _admissionYears = ['2021', '2022', '2023', '2024', '2025', '2026'];
  final List<String> _genders = ['Male', 'Female'];

  void _onContinuePressed() async {
    final viewModel = context.read<AuthViewModel>();
    final student = viewModel.pendingStudentData;

    if (student == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Student data not found. Please try again.')),
      );
      return;
    }

    if (_selectedGrade == null || _selectedClass == null || _selectedAdmissionYear == null || _selectedGender == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select all fields.')),
      );
      return;
    }

    // Call backend to verify answers and create account
    final bool success = await viewModel.completeRegistration(
      grade: _selectedGrade!,
      className: _selectedClass!,
      admissionYear: _selectedAdmissionYear!,
      gender: _selectedGender!,
    );

    if (success) {
      if (mounted) context.go(AppRoutes.dashboard);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(viewModel.errorMessage ?? 'Verification failed. Information does not match school records.'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

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
                decoration: BoxDecoration(
                  color: const Color(0xFF1A3A44),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black12,
                      blurRadius: 10,
                      offset: const Offset(0, 5),
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
              Text(
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
              Text(
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
                  shadows: [
                    BoxShadow(
                      color: Colors.black12,
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    _buildDropdown(
                      label: 'Grade',
                      value: _selectedGrade,
                      items: _grades,
                      onChanged: (val) => setState(() => _selectedGrade = val),
                      hint: 'Select your Grade',
                    ),
                    const SizedBox(height: 20),
                    _buildDropdown(
                      label: 'Class',
                      value: _selectedClass,
                      items: _classes,
                      onChanged: (val) => setState(() => _selectedClass = val),
                      hint: 'Select your Class',
                    ),
                    const SizedBox(height: 20),
                    _buildDropdown(
                      label: 'Admission Year',
                      value: _selectedAdmissionYear,
                      items: _admissionYears,
                      onChanged: (val) => setState(() => _selectedAdmissionYear = val),
                      hint: 'Select your Admission Year',
                    ),
                    const SizedBox(height: 20),
                    _buildDropdown(
                      label: 'Gender',
                      value: _selectedGender,
                      items: _genders,
                      onChanged: (val) => setState(() => _selectedGender = val),
                      hint: 'Select Gender',
                    ),
                    const SizedBox(height: 32),
                    AppButton(
                      text: 'Continue',
                      onPressed: _onContinuePressed,
                      width: double.infinity,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              Text(
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
