import 'package:flutter/material.dart';
import '../../data/services/attendance_service.dart';
import '../../models/attendance_model.dart';

class AttendanceProvider extends ChangeNotifier {
  final AttendanceService _service = AttendanceService();
  List<Attendance> _history = [];
  Attendance? _todayAttendance;
  bool _isLoading = false;

  List<Attendance> get history => _history;
  Attendance? get todayAttendance => _todayAttendance;
  bool get isLoading => _isLoading;

  Future<void> fetchHistory() async {
    _isLoading = true;
    notifyListeners();

    try {
      _history = await _service.getHistory();
      print('📊 Fetched ${_history.length} attendance records');
      
      final now = DateTime.now();
      final todayStr = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
      print('📅 Today: $todayStr');
      
      _todayAttendance = null;
      for (var attendance in _history) {
        if (attendance.checkIn != null) {
          try {
            // Parse ke local time dulu sebelum ambil tanggalnya
            final checkInDate = DateTime.parse(attendance.checkIn!).toLocal();
            final checkInStr = '${checkInDate.year}-${checkInDate.month.toString().padLeft(2, '0')}-${checkInDate.day.toString().padLeft(2, '0')}';
            
            print('  - ID ${attendance.id}: checkIn=$checkInStr, checkOut=${attendance.checkOut}');
            
            if (checkInStr == todayStr) {
              _todayAttendance = attendance;
              print('✅ Found today attendance: ID=${attendance.id}, status=${attendance.status}, checkOut=${attendance.checkOut}');
              break;
            }
          } catch (e) {
            print('⚠️ Failed to parse date for attendance ID ${attendance.id}: $e');
          }
        }
      }
      
      if (_todayAttendance == null) {
        print('❌ No attendance for today');
      }
    } catch (e) {
      print("❌ Error fetch history: $e");
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> checkIn(Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();

    try {
      final result = await _service.checkIn(data);
      print('📥 checkIn response: $result');
      // Anggap berhasil kalau ada field 'id' atau tidak ada field 'message' error
      if (result['id'] != null) {
        // Set langsung dari response biar gak perlu tunggu fetch
        _todayAttendance = Attendance(
          id: result['id'],
          checkIn: result['check_in'],
          checkOut: result['check_out'],
          status: result['status'] ?? 'hadir',
          lateMinutes: result['late_minutes'] ?? 0,
        );
        notifyListeners();
        // Fetch ulang untuk sinkronisasi
        await fetchHistory();
        return true;
      } else {
        print('❌ checkIn gagal: ${result['message']}');
      }
    } catch (e) {
      print("Error check in: $e");
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> checkOut(Map<String, dynamic> data) async {
    if (_todayAttendance == null) return false;
    
    _isLoading = true;
    notifyListeners();

    try {
      final result = await _service.checkOut(_todayAttendance!.id, data);
      print('📥 checkOut response: $result');
      if (result['id'] != null) {
        // Update langsung dari response
        _todayAttendance = Attendance(
          id: result['id'],
          checkIn: result['check_in'],
          checkOut: result['check_out'],
          status: result['status'] ?? _todayAttendance!.status,
          lateMinutes: result['late_minutes'] ?? _todayAttendance!.lateMinutes,
        );
        notifyListeners();
        await fetchHistory();
        return true;
      } else {
        print('❌ checkOut gagal: ${result['message']}');
      }
    } catch (e) {
      print("Error check out: $e");
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }
}
