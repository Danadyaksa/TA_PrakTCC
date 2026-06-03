import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/constants/app_constants.dart';
import '../../models/schedule_model.dart';
import 'auth_service.dart';

class ScheduleService {
  final String _baseUrl = AppConstants.baseUrl;
  final AuthService _authService = AuthService();

  Future<Map<String, String>> _getHeaders() async {
    final token = await _authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  /// Fetch jadwal karyawan berdasarkan user ID
  Future<List<Schedule>> getMySchedules() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/schedules/my'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        List data = jsonDecode(response.body);
        return data.map((item) => Schedule.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching schedules: $e');
      return [];
    }
  }

  /// Get jadwal untuk hari tertentu (0 = Sunday, 1 = Monday, dst)
  Future<Schedule?> getScheduleByDay(int dayOfWeek) async {
    try {
      final schedules = await getMySchedules();
      return schedules.firstWhere(
        (schedule) => schedule.dayOfWeek == dayOfWeek,
        orElse: () => throw Exception('No schedule found'),
      );
    } catch (e) {
      print('Error getting schedule by day: $e');
      return null;
    }
  }

  /// Get jadwal hari ini
  Future<Schedule?> getTodaySchedule() async {
    final today = DateTime.now().weekday % 7; // Convert to 0-6 format
    return await getScheduleByDay(today);
  }
}
