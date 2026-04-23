import 'package:universe_app/core/viewmodels/base_viewmodel.dart';
import 'package:universe_app/features/auth/models/user_model.dart';
import 'package:universe_app/features/auth/repositories/auth_repository.dart';

class AuthViewModel extends BaseViewModel {
  AuthViewModel(this._repository);

  final AuthRepository _repository;

  UserModel? _currentUser;
  UserModel? get currentUser => _currentUser;
  String? _pendingRegistrationEmail;
  String? _pendingForgotPasswordEmail;

  bool get isAuthenticated => _currentUser != null;

  Future<bool> restoreSession() async {
    setError(null);

    try {
      _currentUser = await _repository.restoreSession();
      notifyListeners();
      return _currentUser != null;
    } catch (error) {
      setError(error.toString().replaceFirst('Exception: ', ''));
      return false;
    }
  }

  Future<bool> login({required String email, required String password}) async {
    setError(null);
    setLoading(true);

    try {
      _currentUser = await _repository.login(email: email, password: password);
      return true;
    } catch (error) {
      setError(error.toString().replaceFirst('Exception: ', ''));
      return false;
    } finally {
      setLoading(false);
    }
  }

  Future<bool> requestParentRegistrationOtp({
    required String fullName,
    required String email,
    required String password,
    required String studentIdNo,
  }) async {
    setError(null);
    setLoading(true);

    try {
      await _repository.requestParentRegistrationOtp(
        fullName: fullName,
        email: email,
        password: password,
        studentIdNo: studentIdNo,
      );
      _pendingRegistrationEmail = email.trim();
      return true;
    } catch (error) {
      setError(error.toString().replaceFirst('Exception: ', ''));
      return false;
    } finally {
      setLoading(false);
    }
  }

  Future<bool> verifyRegistrationOtp({required String otp}) async {
    final String? email = _pendingRegistrationEmail;
    if (email == null || email.isEmpty) {
      setError('Please submit registration details first.');
      return false;
    }

    setError(null);
    setLoading(true);

    try {
      _currentUser = await _repository.verifyRegistrationOtp(email: email, otp: otp);
      _pendingRegistrationEmail = null;
      return true;
    } catch (error) {
      setError(error.toString().replaceFirst('Exception: ', ''));
      return false;
    } finally {
      setLoading(false);
    }
  }

  Future<bool> requestForgotPasswordOtp({required String email}) async {
    setError(null);
    setLoading(true);

    try {
      await _repository.requestPasswordResetOtp(email: email);
      _pendingForgotPasswordEmail = email.trim();
      return true;
    } catch (error) {
      setError(error.toString().replaceFirst('Exception: ', ''));
      return false;
    } finally {
      setLoading(false);
    }
  }

  Future<bool> resetPassword({required String otp, required String newPassword}) async {
    final String? email = _pendingForgotPasswordEmail;
    if (email == null || email.isEmpty) {
      setError('Please request OTP first.');
      return false;
    }

    setError(null);
    setLoading(true);

    try {
      await _repository.resetPassword(
        email: email,
        otp: otp,
        newPassword: newPassword,
      );
      _pendingForgotPasswordEmail = null;
      return true;
    } catch (error) {
      setError(error.toString().replaceFirst('Exception: ', ''));
      return false;
    } finally {
      setLoading(false);
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    _currentUser = null;
    setError(null);
    notifyListeners();
  }
}
