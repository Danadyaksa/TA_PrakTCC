import 'package:flutter/material.dart';
import '../../data/services/auth_service.dart';
import '../../data/services/notification_service.dart';
import '../../models/user_model.dart';
import '../../core/constants/app_constants.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  User? _user;
  bool _isAuthenticated = false;
  bool _isLoading = true;

  User? get user => _user;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;

  AuthProvider() {
    checkAuthStatus();
  }

  Future<void> checkAuthStatus() async {
    _isLoading = true;
    notifyListeners();

    final token = await _authService.getToken();
    if (token != null) {
      // Coba fetch fresh dari API biar department_name selalu up to date
      try {
        final freshUser = await _authService.fetchProfile();
        if (freshUser != null) {
          _user = freshUser;
          await _authService.saveUser(freshUser);
        } else {
          _user = await _authService.getUser();
        }
      } catch (_) {
        _user = await _authService.getUser();
      }
      _isAuthenticated = _user != null;
      if (_user != null) {
        NotificationService().currentUserId = _user!.id;
      }
    } else {
      _isAuthenticated = false;
      _user = null;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    try {
      print('🔄 Attempting login to: ${AppConstants.baseUrl}/auth/login');
      print('📧 Email: $email');
      
      final result = await _authService.login(email, password);
      
      print('✅ Login response received');
      
      if (result['token'] != null) {
        _user = User.fromJson(result['user']);
        _isAuthenticated = true;
        NotificationService().currentUserId = _user!.id;
        notifyListeners();
        print('✅ Login successful for user: ${_user?.name}');
        return true;
      }
      print('❌ No token in response');
      return false;
    } catch (e) {
      print('❌ Login error: $e');
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _user = null;
    _isAuthenticated = false;
    notifyListeners();
  }
}
