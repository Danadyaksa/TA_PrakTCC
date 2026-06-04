import 'package:flutter/material.dart';
import '../../data/services/schedule_service.dart';
import '../../data/services/notification_service.dart';
import '../../data/services/rule_service.dart';
import '../../models/schedule_model.dart';

class ScheduleProvider extends ChangeNotifier {
  final ScheduleService _scheduleService = ScheduleService();
  final NotificationService _notificationService = NotificationService();
  final RuleService _ruleService = RuleService();
  
  List<Schedule> _schedules = [];
  Schedule? _todaySchedule;
  bool _isLoading = false;
  int _absentAfterMinutes = 60; // default fallback

  List<Schedule> get schedules => _schedules;
  Schedule? get todaySchedule => _todaySchedule;
  bool get isLoading => _isLoading;
  int get absentAfterMinutes => _absentAfterMinutes;

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

  /// Fetch jadwal hari ini + jadwalkan notifikasi
  Future<void> fetchTodaySchedule() async {
    try {
      _todaySchedule = await _scheduleService.getTodaySchedule();
      notifyListeners();

      // Jadwalkan notifikasi berdasarkan shift hari ini
      if (_todaySchedule != null) {
        // Ambil alphaMinutes dari rules API, fallback 45 menit
        final rules = await _ruleService.getRules();
        final alphaMinutes = rules?['absent_after_minutes'] as int? ?? 45;
        _absentAfterMinutes = alphaMinutes;
        notifyListeners();

        _notificationService.scheduleShiftNotifications(
          shiftStart: _todaySchedule!.shiftStart,
          shiftEnd: _todaySchedule!.shiftEnd,
          alphaMinutes: alphaMinutes,
        );
      }
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
