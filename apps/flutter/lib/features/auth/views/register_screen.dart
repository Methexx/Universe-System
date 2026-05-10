import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:universe_app/core/constants/app_routes.dart';
import 'package:universe_app/features/auth/viewmodels/auth_viewmodel.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _studentIdController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController =
      TextEditingController();

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _studentIdController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _onRegisterPressed() async {
    final String fullName = 'Parent';
    final String email = _emailController.text.trim();
    final String rawStudentId = _studentIdController.text.trim();
    final String studentId = rawStudentId.isNotEmpty ? 'S-$rawStudentId' : '';
    final String password = _passwordController.text;
    final String confirmPassword = _confirmPasswordController.text;

    if (fullName.isEmpty || email.isEmpty || studentId.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all required fields.')),
      );
      return;
    }

    if (password != confirmPassword) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Passwords do not match.')),
      );
      return;
    }

    final AuthViewModel viewModel = context.read<AuthViewModel>();
    final bool requested = await viewModel.requestParentRegistrationOtp(
      fullName: fullName,
      email: email,
      password: password,
      studentIdNo: studentId,
    );

    if (!mounted) {
      return;
    }

    if (!requested) {
      final String message = viewModel.errorMessage ?? 'Registration failed.';
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('OTP sent. Please check your email.')),
    );
    context.go(AppRoutes.registerOtp);
  }

  InputDecoration _fieldDecoration(String hintText, {String? prefixText, Widget? prefixIcon, Widget? suffixIcon}) {
    const BorderSide borderSide = BorderSide(color: Color(0xFFE5E7EB));
    return InputDecoration(
      hintText: hintText,
      prefixText: prefixText,
      prefixIcon: prefixIcon,
      suffixIcon: suffixIcon,
      prefixStyle: const TextStyle(
        color: Color(0xFF111827),
        fontSize: 15,
        fontWeight: FontWeight.w600,
        fontFamily: 'Plus Jakarta Sans',
      ),
      hintStyle: const TextStyle(
        color: Color(0xFF94A3B8),
        fontSize: 15,
        fontWeight: FontWeight.w500,
        fontFamily: 'Plus Jakarta Sans',
      ),
      filled: true,
      fillColor: const Color(0xFFF8FAFC),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: borderSide,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Color(0xFF3C4CF4), width: 1.2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFFFFFF),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverFillRemaining(
              hasScrollBody: false,
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: <Widget>[
                    Align(
                      alignment: Alignment.centerLeft,
                      child: InkWell(
                        onTap: () {
                          if (context.canPop()) {
                            context.pop();
                            return;
                          }
                          context.go(AppRoutes.login);
                        },
                        borderRadius: BorderRadius.circular(12),
                        child: Ink(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFE5E7EB)),
                          ),
                          child: const Icon(
                            Icons.chevron_left_rounded,
                            color: Color(0xFF111827),
                            size: 24,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Hello! Register to get\nstarted',
                      style: TextStyle(
                        fontSize: 42,
                        fontWeight: FontWeight.w800,
                        height: 1.2,
                        color: Color(0xFF111827),
                        fontFamily: 'Plus Jakarta Sans',
                      ),
                    ),
                    const SizedBox(height: 26),
                    TextField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.next,
                      decoration: _fieldDecoration('Email'),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _studentIdController,
                      textInputAction: TextInputAction.next,
                      keyboardType: TextInputType.number,
                      decoration: _fieldDecoration(
                        '000025',
                        prefixIcon: const Padding(
                          padding: EdgeInsets.only(left: 14, right: 4, top: 16),
                          child: Text(
                            'S-',
                            style: TextStyle(
                              color: Color(0xFF111827),
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              fontFamily: 'Plus Jakarta Sans',
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      textInputAction: TextInputAction.next,
                      decoration: _fieldDecoration(
                        'Password',
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword ? Icons.visibility_off : Icons.visibility,
                            color: const Color(0xFF94A3B8),
                          ),
                          onPressed: () {
                            setState(() {
                              _obscurePassword = !_obscurePassword;
                            });
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _confirmPasswordController,
                      obscureText: _obscureConfirmPassword,
                      textInputAction: TextInputAction.done,
                      onSubmitted: (_) => _onRegisterPressed(),
                      decoration: _fieldDecoration(
                        'Confirm password',
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscureConfirmPassword ? Icons.visibility_off : Icons.visibility,
                            color: const Color(0xFF94A3B8),
                          ),
                          onPressed: () {
                            setState(() {
                              _obscureConfirmPassword = !_obscureConfirmPassword;
                            });
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      height: 56,
                      child: Consumer<AuthViewModel>(
                        builder: (context, viewModel, child) {
                          return ElevatedButton(
                            onPressed: viewModel.isLoading ? null : _onRegisterPressed,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF3C4CF4),
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(28),
                              ),
                            ),
                            child: viewModel.isLoading
                                ? const SizedBox(
                                    width: 22,
                                    height: 22,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Text(
                                    'Register',
                                    style: TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.w700,
                                      fontFamily: 'Plus Jakarta Sans',
                                    ),
                                  ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 22),
                    Row(
                      children: const <Widget>[
                        Expanded(child: Divider(color: Color(0xFFE5E7EB))),
                        Padding(
                          padding: EdgeInsets.symmetric(horizontal: 10),
                          child: Text(
                            'Or Register with',
                            style: TextStyle(
                              color: Color(0xFF6B7280),
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              fontFamily: 'Plus Jakarta Sans',
                            ),
                          ),
                        ),
                        Expanded(child: Divider(color: Color(0xFFE5E7EB))),
                      ],
                    ),
                    const SizedBox(height: 18),
                    Row(
                      children: [
                        Expanded(
                          child: _SocialButton(
                            icon: Icons.facebook,
                            iconColor: const Color(0xFF1877F2),
                            onTap: () {},
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _SocialGoogleButton(onTap: () {}),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _SocialButton(
                            icon: Icons.apple,
                            iconColor: const Color(0xFF111827),
                            onTap: () {},
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    Center(
                      child: RichText(
                        text: TextSpan(
                          text: 'Already have an account? ',
                          style: const TextStyle(
                            color: Color(0xFF374151),
                            fontSize: 15,
                            fontWeight: FontWeight.w500,
                            fontFamily: 'Plus Jakarta Sans',
                          ),
                          children: [
                            WidgetSpan(
                              child: GestureDetector(
                                onTap: () => context.go(AppRoutes.login),
                                child: const Text(
                                  'Login Now',
                                  style: TextStyle(
                                    color: Color(0xFF3C4CF4),
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                    fontFamily: 'Plus Jakarta Sans',
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SocialButton extends StatelessWidget {
  const _SocialButton({
    required this.icon,
    required this.iconColor,
    required this.onTap,
  });

  final IconData icon;
  final Color iconColor;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 50,
      child: OutlinedButton(
        onPressed: onTap,
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: Color(0xFFE5E7EB)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          backgroundColor: Colors.white,
          padding: EdgeInsets.zero,
        ),
        child: Icon(icon, color: iconColor, size: 24),
      ),
    );
  }
}

class _SocialGoogleButton extends StatelessWidget {
  const _SocialGoogleButton({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 50,
      child: OutlinedButton(
        onPressed: onTap,
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: Color(0xFFE5E7EB)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          backgroundColor: Colors.white,
          padding: EdgeInsets.zero,
        ),
        child: const Text(
          'G',
          style: TextStyle(
            color: Color(0xFFEA4335),
            fontSize: 24,
            fontWeight: FontWeight.w700,
            fontFamily: 'Plus Jakarta Sans',
          ),
        ),
      ),
    );
  }
}
