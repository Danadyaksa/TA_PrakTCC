import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/constants/app_constants.dart';
import 'auth_service.dart';

class RuleService {
  final String _baseUrl = AppConstants.baseUrl;
  final AuthService _authService = AuthService();

  Future<Map<String, String>> _getHeaders() async {
    final token = await _authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  /// Fetch attendance rules dari backend
  /// Returns: { tolerance_minutes: int, absent_after_minutes: int }
  Future<Map<String, dynamic>?> getRules() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/rules'),
        headers: await _getHeaders(),
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      }
    } catch (e) {
      print('Error fetching rules: $e');
    }
    return null;
  }
}
