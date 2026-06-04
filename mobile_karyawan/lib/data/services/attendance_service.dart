import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/constants/app_constants.dart';
import '../../models/attendance_model.dart';
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
    final body = jsonDecode(response.body);
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception(body['message'] ?? 'Check-in gagal');
    }
    return body;
  }

  Future<Map<String, dynamic>> checkOut(int attendanceId, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/attendance/check-out'),
      headers: await _getHeaders(),
      body: jsonEncode({
        'attendance_id': attendanceId,
        ...data,
      }),
    );
    return jsonDecode(response.body);
  }

  /// HRD: daily summary — semua karyawan berjadwal pada tanggal tertentu
  /// [date] format: 'YYYY-MM-DD', null = hari ini
  Future<Map<String, dynamic>?> getDailySummary({String? date}) async {
    final uri = Uri.parse(
      date != null
          ? '$_baseUrl/attendance/daily-summary?date=$date'
          : '$_baseUrl/attendance/daily-summary',
    );
    final response = await http.get(uri, headers: await _getHeaders());
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    return null;
  }
}
