import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../models/user_model.dart';

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
      _user = await _authService.getUser();
      _isAuthenticated = true;
    } else {
      _isAuthenticated = false;
      _user = null;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    try {
      final result = await _authService.login(email, password);
      if (result['token'] != null) {
        _user = User.fromJson(result['user']);
        _isAuthenticated = true;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
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
