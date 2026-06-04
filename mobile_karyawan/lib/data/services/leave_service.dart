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

  /// Ambil semua leave request milik user
  Future<List<LeaveRequest>> getLeaves() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/leaves'),
        headers: await _getHeaders(),
      );
      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        return data.map((item) => LeaveRequest.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching leaves: $e');
      return [];
    }
  }

  /// Ajukan cuti/izin baru
  Future<Map<String, dynamic>> applyLeave(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/leaves'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    return jsonDecode(response.body);
  }

  /// Cek apakah hari ini user sedang cuti/izin yang sudah diapprove
  Future<LeaveRequest?> getActiveTodayLeave() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/leaves/active-today'),
        headers: await _getHeaders(),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data == null) return null;
        return LeaveRequest.fromJson(data);
      }
      return null;
    } catch (e) {
      print('Error fetching active leave: $e');
      return null;
    }
  }
}
