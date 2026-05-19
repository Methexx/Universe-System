import 'package:flutter/material.dart';
import 'package:universe_app/core/services/biometric_service.dart';
import 'package:universe_app/core/services/firebase_service.dart';
import 'package:universe_app/core/storage/secure_storage.dart';
import 'package:universe_app/core/viewmodels/base_viewmodel.dart';
import 'package:universe_app/features/auth/models/user_model.dart';
import 'package:universe_app/features/auth/repositories/auth_repository.dart';
import 'package:universe_app/core/storage/local_storage.dart';

class AuthViewModel extends BaseViewModel {
  AuthViewModel(
    this._repository,
    this._localStorage,
    this._firebaseService,
    this._secureStorage,
    this._biometricService,
  );

  final AuthRepository _repository;
  final FirebaseService _firebaseService;
  final LocalStorageService _localStorage;
  final SecureStorageService _secureStorage;
  final BiometricService _biometricService;

  UserModel? _currentUser;
  UserModel? get currentUser => _currentUser;
  String? _pendingRegistrationEmail;
  String? _pendingForgotPasswordEmail;
  Map<String, dynamic>? _pendingStudentData;

  Map<String, dynamic>? get pendingStudentData => _pendingStudentData;

  bool get isAuthenticated => _currentUser != null;

  Future<bool> restoreSession() async {
    setError(null);

    final bool keepMeSignedIn = await _localStorage.getKeepMeSignedIn();
    if (!keepMeSignedIn) {
      await _repository.logout();
      return false;
    }

    try {
      _currentUser = await _repository.restoreSession();
      notifyListeners();
      return _currentUser != null;
    } catch (error) {
      setError(error.toString().replaceFirst('Exception: ', ''));
      return false;
    }
  }

  Future<bool> isBiometricAvailableAndEnabled() async {
    final enabled = await _secureStorage.getBiometricEnabled();
    if (!enabled) return false;
    final available = await _biometricService.isBiometricAvailable();
    if (!available) return false;
    final creds = await _secureStorage.getBiometricCredentials();
    return creds != null;
  }

  Future<bool> biometricLogin() async {
    final availableAndEnabled = await isBiometricAvailableAndEnabled();
    if (!availableAndEnabled) return false;

    try {
      final authenticated = await _biometricService.authenticate(
        reason: 'Please authenticate to log in automatically',
      );

      if (!authenticated) return false;

      final creds = await _secureStorage.getBiometricCredentials();
      if (creds == null) return false;

      return login(
        email: creds['email']!,
        password: creds['password']!,
        keepMeSignedIn: await _localStorage.getKeepMeSignedIn(),
      );
    } catch (e) {
      setError('Biometric authentication failed or was canceled.');
      return false;
    }
  }

  Future<bool> login({
    required String email,
    required String password,
    bool keepMeSignedIn = false,
  }) async {
    setError(null);
    setLoading(true);

    try {
      _currentUser = await _repository.login(email: email, password: password);
      await _localStorage.setKeepMeSignedIn(keepMeSignedIn);
      await _secureStorage.saveBiometricCredentials(email, password);
      // Upload FCM token now that a valid JWT exists in secure storage
      await _firebaseService.uploadTokenIfLoggedIn();
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
      final result = await _repository.verifyRegistrationOtp(email: email, otp: otp);
      final bool requiresProfileSetup = result['requires_profile_setup'] == true;

      _currentUser = result['user'] as UserModel?;
      _pendingStudentData = result['student'] as Map<String, dynamic>?;

      // Keep email if we need to call completeRegistration next
      if (!requiresProfileSetup) {
        _pendingRegistrationEmail = null;
      }

      notifyListeners();
      return true;
    } catch (error) {
      setError(error.toString().replaceFirst('Exception: ', ''));
      return false;
    } finally {
      setLoading(false);
    }
  }

  Future<bool> completeRegistration({
    required String grade,
    required String className,
    required String admissionYear,
    required String gender,
  }) async {
    final String? email = _pendingRegistrationEmail;
    if (email == null || email.isEmpty) {
      setError('Registration session expired. Please register again.');
      return false;
    }

    setError(null);
    setLoading(true);

    try {
      final result = await (_repository as dynamic).completeRegistration(
        email: email,
        grade: grade,
        className: className,
        admissionYear: admissionYear,
        gender: gender,
      );

      _currentUser = result['user'] as UserModel;
      _pendingRegistrationEmail = null;
      _pendingStudentData = null;
      notifyListeners();
      return true;
    } catch (error) {
      setError(error.toString().replaceFirst('Exception: ', ''));
      return false;
    } finally {
      setLoading(false);
    }
  }

  Future<bool> resendRegistrationOtp() async {
    final String? email = _pendingRegistrationEmail;
    if (email == null || email.isEmpty) {
      setError('Please submit registration details first.');
      return false;
    }

    setError(null);
    setLoading(true);

    try {
      await _repository.resendOtp(email: email);
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
    await _localStorage.clearProfileCache();
    await _localStorage.setKeepMeSignedIn(false);
    _currentUser = null;
    setError(null);
    notifyListeners();
  }

  void onAppLifecycleChanged(AppLifecycleState state) async {
    if (state == AppLifecycleState.paused) {
      // If app goes to background, clear the current user state 
      // only if the user has NOT opted into "keep me signed in".
      // We avoid clearing on 'inactive' because system overlays like 
      // biometric prompts trigger that state.
      final keepSignedIn = await _localStorage.getKeepMeSignedIn();
      if (!keepSignedIn && _currentUser != null) {
        _currentUser = null;
        notifyListeners();
      }
    }
  }
}
