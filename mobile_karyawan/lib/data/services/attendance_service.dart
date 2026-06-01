import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/constants/app_constants.dart';
import '../models/attendance_model.dart';
import 'auth_service.dart';

class AttendanceService {
  final String _baseUrl = AppConstants.baseUrl;
  final AuthService _authService = AuthService();

  Future<Map<String, String>> _getHeaders() async {
    final token = await _authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  Future<List<Attendance>> getHistory() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/attendance/history'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      List data = jsonDecode(response.body);
      return data.map((item) => Attendance.fromJson(item)).toList();
    }
    return [];
  }

  Future<Map<String, dynamic>> checkIn(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/attendance/check-in'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> checkOut(int attendanceId) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/attendance/check-out'),
      headers: await _getHeaders(),
      body: jsonEncode({'attendance_id': attendanceId}),
    );
    return jsonDecode(response.body);
  }
}
