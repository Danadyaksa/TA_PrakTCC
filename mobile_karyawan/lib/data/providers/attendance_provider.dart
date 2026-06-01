import 'package:flutter/material.dart';
import '../services/attendance_service.dart';
import '../models/attendance_model.dart';

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
      
      // Cek apakah ada absen hari ini
      final today = DateTime.now().toIso8601String().split('T')[0];
      final found = _history.where((a) => a.checkIn != null && a.checkIn!.startsWith(today));
      if (found.isNotEmpty) {
        _todayAttendance = found.first;
      } else {
        _todayAttendance = null;
      }
    } catch (e) {
      print("Error fetch history: $e");
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> checkIn(Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();

    try {
      final result = await _service.checkIn(data);
      if (result['id'] != null) {
        await fetchHistory();
        return true;
      }
    } catch (e) {
      print("Error check in: $e");
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> checkOut() async {
    if (_todayAttendance == null) return false;
    
    _isLoading = true;
    notifyListeners();

    try {
      final result = await _service.checkOut(_todayAttendance!.id);
      if (result['id'] != null) {
        await fetchHistory();
        return true;
      }
    } catch (e) {
      print("Error check out: $e");
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }
}
