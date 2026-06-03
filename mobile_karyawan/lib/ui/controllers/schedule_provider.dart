import 'package:flutter/material.dart';
import '../../data/services/schedule_service.dart';
import '../../models/schedule_model.dart';

class ScheduleProvider extends ChangeNotifier {
  final ScheduleService _scheduleService = ScheduleService();
  
  List<Schedule> _schedules = [];
  Schedule? _todaySchedule;
  bool _isLoading = false;

  List<Schedule> get schedules => _schedules;
  Schedule? get todaySchedule => _todaySchedule;
  bool get isLoading => _isLoading;

  /// Fetch semua jadwal karyawan
  Future<void> fetchSchedules() async {
    _isLoading = true;
    notifyListeners();

    try {
      _schedules = await _scheduleService.getMySchedules();
      await fetchTodaySchedule();
    } catch (e) {
      print('Error fetching schedules: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Fetch jadwal hari ini
  Future<void> fetchTodaySchedule() async {
    try {
      _todaySchedule = await _scheduleService.getTodaySchedule();
      notifyListeners();
    } catch (e) {
      print('Error fetching today schedule: $e');
    }
  }

  /// Get jadwal berdasarkan hari
  Schedule? getScheduleByDay(int dayOfWeek) {
    try {
      return _schedules.firstWhere((s) => s.dayOfWeek == dayOfWeek);
    } catch (e) {
      return null;
    }
  }
}
