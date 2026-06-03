import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/constants/app_constants.dart';
import '../../models/leave_model.dart';
import 'auth_service.dart';

class LeaveService {
  final String _baseUrl = AppConstants.baseUrl;
  final AuthService _authService = AuthService();

  Future<Map<String, String>> _getHeaders() async {
    final token = await _authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  Future<List<LeaveRequest>> getLeaves() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/leaves'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      List data = jsonDecode(response.body);
      return data.map((item) => LeaveRequest.fromJson(item)).toList();
    }
    return [];
  }

  Future<Map<String, dynamic>> applyLeave(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/leaves'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    return jsonDecode(response.body);
  }
}
