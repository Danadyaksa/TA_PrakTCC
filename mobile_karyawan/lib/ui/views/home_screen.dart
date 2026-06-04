import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:mobile_karyawan/ui/controllers/auth_provider.dart';
import 'package:mobile_karyawan/ui/controllers/attendance_provider.dart';
import 'package:mobile_karyawan/ui/controllers/schedule_provider.dart';
import 'package:mobile_karyawan/ui/controllers/notification_provider.dart';
import 'package:mobile_karyawan/ui/views/attendance_camera_screen.dart';
import 'package:mobile_karyawan/ui/views/profile_screen.dart';
import 'package:mobile_karyawan/ui/views/notification_screen.dart';
import 'package:mobile_karyawan/core/constants/app_colors.dart';
import 'package:mobile_karyawan/data/services/leave_service.dart';
import 'package:mobile_karyawan/models/leave_model.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with WidgetsBindingObserver {
  final LeaveService _leaveService = LeaveService();
  LeaveRequest? _activeLeave;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _refreshData();
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      // Refresh data setiap kali app di-resume
      _refreshData();
    }
  }

  void _refreshData() {
    context.read<AttendanceProvider>().fetchHistory();
    context.read<ScheduleProvider>().fetchTodaySchedule();
    _fetchActiveLeave();
  }

  Future<void> _fetchActiveLeave() async {
    final leave = await _leaveService.getActiveTodayLeave();
    if (mounted) setState(() => _activeLeave = leave);
  }

  Future<void> _refreshDataAsync() async {
    await Future.wait([
      context.read<AttendanceProvider>().fetchHistory(),
      context.read<ScheduleProvider>().fetchTodaySchedule(),
      _fetchActiveLeave(),
    ]);
  }

  // Helper: parse "HH:mm:ss" atau "HH:mm" ke DateTime hari ini
  DateTime _parseShiftTime(String timeStr, DateTime now) {
    final parts = timeStr.split(':');
    final hour = int.parse(parts[0]);
    final minute = int.parse(parts[1]);
    return DateTime(now.year, now.month, now.day, hour, minute);
  }

  // Helper: Cek apakah sudah waktunya check-in
  // Bisa check-in mulai TEPAT jam shift mulai
  bool _canCheckIn(String shiftStart, DateTime now) {
    try {
      final shiftStartTime = _parseShiftTime(shiftStart, now);
      // now >= shiftStartTime
      return !now.isBefore(shiftStartTime);
    } catch (e) {
      return false;
    }
  }

  // Helper: Cek apakah sudah melewati batas alpha (absent_after_minutes)
  bool _isAlpha(String shiftStart, DateTime now, int absentAfterMinutes) {
    try {
      final shiftStartTime = _parseShiftTime(shiftStart, now);
      final diff = now.difference(shiftStartTime).inMinutes;
      return diff > absentAfterMinutes;
    } catch (e) {
      return false;
    }
  }

  // Bisa check-out mulai TEPAT jam shift selesai
  bool _canCheckOut(String shiftEnd, DateTime now) {
    try {
      final shiftEndTime = _parseShiftTime(shiftEnd, now);
      // now >= shiftEndTime
      return !now.isBefore(shiftEndTime);
    } catch (e) {
      return false;
    }
  }

  void _handleAttendanceAction(BuildContext context, bool isCheckIn) {
    // Buka camera screen untuk check-in atau check-out
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AttendanceCameraScreen(isCheckIn: isCheckIn),
      ),
    ).then((_) {
      // Refresh data setelah kembali dari camera
      context.read<AttendanceProvider>().fetchHistory();
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final attendanceProv = context.watch<AttendanceProvider>();
    final scheduleProv = context.watch<ScheduleProvider>();
    final notificationProv = context.watch<NotificationProvider>();
    final todayAtt = attendanceProv.todayAttendance;
    final todaySchedule = scheduleProv.todaySchedule;

    // Logika waktu check-in/check-out
    final now = DateTime.now();
    final canCheckIn = todaySchedule != null && _canCheckIn(todaySchedule.shiftStart, now);
    final isAlpha = todaySchedule != null && todayAtt == null && _isAlpha(todaySchedule.shiftStart, now, scheduleProv.absentAfterMinutes);
    final canCheckOut = todaySchedule != null && todayAtt != null && todayAtt.checkOut == null && _canCheckOut(todaySchedule.shiftEnd, now);
    final isCompleted = todayAtt?.checkOut != null;
    final isWaitingCheckOut = todayAtt != null && todayAtt.checkOut == null && todaySchedule != null && !_canCheckOut(todaySchedule.shiftEnd, now);
    final isOnLeave = _activeLeave != null;

    // Button state
    String buttonText;
    Color buttonColor;
    bool isEnabled;
    IconData buttonIcon;

    if (isOnLeave) {
      // Sedang cuti/izin yang diapprove
      buttonText = _activeLeave!.typeLabel.toUpperCase();
      buttonColor = Colors.indigo.shade300;
      isEnabled = false;
      buttonIcon = Icons.event_busy_rounded;
    } else if (isCompleted) {
      buttonText = 'SELESAI';
      buttonColor = Colors.grey.shade400;
      isEnabled = false;
      buttonIcon = Icons.check_circle;
    } else if (todayAtt == null) {
      // Belum check-in
      if (isAlpha) {
        // Sudah melewati batas alpha — tidak bisa check-in
        buttonText = 'ALPHA';
        buttonColor = Colors.red.shade800;
        isEnabled = false;
        buttonIcon = Icons.block_rounded;
      } else if (canCheckIn) {
        buttonText = 'CHECK IN';
        buttonColor = AppColors.primary;
        isEnabled = true;
        buttonIcon = Icons.login_rounded;
      } else {
        buttonText = 'CHECK IN';
        buttonColor = Colors.grey.shade400;
        isEnabled = false;
        buttonIcon = Icons.lock_clock;
      }
    } else if (isWaitingCheckOut) {
      // Sudah check-in, tapi belum waktunya check-out
      buttonText = 'CHECK OUT';
      buttonColor = Colors.grey.shade400;
      isEnabled = false;
      buttonIcon = Icons.lock_clock;
    } else {
      // Sudah check-in, dan sudah waktunya check-out
      buttonText = 'CHECK OUT';
      buttonColor = const Color(0xFFEF4444); // Red
      isEnabled = true;
      buttonIcon = Icons.logout_rounded;
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => _refreshDataAsync(),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Halo, ${user?.name.split(' ')[0] ?? 'Karyawan'}!',
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(DateTime.now()),
                        style: const TextStyle(color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                  // Bell icon notifikasi
                  GestureDetector(
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const NotificationScreen()),
                    ),
                    child: Stack(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.08),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Icon(
                            notificationProv.unreadCount > 0
                                ? Icons.notifications_active_rounded
                                : Icons.notifications_outlined,
                            color: notificationProv.unreadCount > 0
                                ? AppColors.primary
                                : AppColors.textSecondary,
                            size: 22,
                          ),
                        ),
                        if (notificationProv.unreadCount > 0)
                          Positioned(
                            right: 0,
                            top: 0,
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(
                                color: Colors.red,
                                shape: BoxShape.circle,
                              ),
                              child: Text(
                                '${notificationProv.unreadCount > 9 ? '9+' : notificationProv.unreadCount}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // Shift Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primary, Color(0xFF3B82F6)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.access_time_filled, color: Colors.white, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Jadwal Hari Ini',
                          style: TextStyle(color: Colors.white70, fontSize: 14),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      todaySchedule?.formattedShift ?? 'Tidak ada jadwal hari ini',
                      style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      todayAtt == null 
                        ? (todaySchedule == null ? 'Tidak ada jadwal hari ini' : 'Belum melakukan presensi')
                        : todayAtt.checkOut == null 
                          ? 'Sudah Check-In pada ${DateFormat('HH:mm').format(DateTime.parse(todayAtt.checkIn!).toLocal())}'
                          : 'Sudah Check-Out pada ${DateFormat('HH:mm').format(DateTime.parse(todayAtt.checkOut!).toLocal())}',
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 48),

              // Attendance Button
              Center(
                child: Column(
                  children: [
                    GestureDetector(
                      onTap: isEnabled ? () {
                        if (todayAtt == null) {
                          // Check-in
                          _handleAttendanceAction(context, true);
                        } else {
                          // Check-out
                          _handleAttendanceAction(context, false);
                        }
                      } : null,
                      child: Container(
                        width: 200,
                        height: 200,
                        decoration: BoxDecoration(
                          color: buttonColor,
                          shape: BoxShape.circle,
                          boxShadow: isEnabled ? [
                            BoxShadow(
                              color: buttonColor.withOpacity(0.4),
                              blurRadius: 20,
                              spreadRadius: 5,
                            ),
                          ] : [],
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              buttonIcon,
                              size: 60,
                              color: Colors.white,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              buttonText,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Status text
                    if (isOnLeave && _activeLeave != null)
                      Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.info_outline, color: Colors.indigo, size: 18),
                              const SizedBox(width: 8),
                              Flexible(
                                child: Text(
                                  'Sedang ${_activeLeave!.typeLabel} s.d. ${_activeLeave!.formattedEndDate}',
                                  style: const TextStyle(
                                    color: Colors.indigo,
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ],
                          ),
                          if (_activeLeave!.reason != null && _activeLeave!.reason!.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(
                              '"${_activeLeave!.reason}"',
                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ],
                      )
                    else if (isAlpha && todaySchedule != null)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.block_rounded, color: Colors.red.shade800, size: 18),
                          const SizedBox(width: 8),
                          Flexible(
                            child: Text(
                              'Batas check-in terlewat. Status hari ini: Alpha',
                              style: TextStyle(
                                color: Colors.red.shade800,
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ],
                      )
                    else if (!canCheckIn && todayAtt == null && todaySchedule != null)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.schedule, color: AppColors.textSecondary, size: 18),
                          const SizedBox(width: 8),
                          Flexible(
                            child: Text(
                              'Check-in mulai jam ${todaySchedule.shiftStart.substring(0, 5)}',
                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ],
                      )
                    else if (isCompleted)
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.check_circle, color: AppColors.success, size: 20),
                          SizedBox(width: 8),
                          Text(
                            'Presensi hari ini selesai',
                            style: TextStyle(color: AppColors.success, fontWeight: FontWeight.bold),
                          ),
                        ],
                      )
                    else if (isWaitingCheckOut && todaySchedule != null)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.schedule, color: AppColors.textSecondary, size: 18),
                          const SizedBox(width: 8),
                          Flexible(
                            child: Text(
                              'Check-out mulai jam ${todaySchedule.shiftEnd.substring(0, 5)}',
                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ],
                      )
                    else if (canCheckOut)
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.info_outline, color: AppColors.warning, size: 18),
                          SizedBox(width: 8),
                          Text(
                            'Jangan lupa check-out sebelum pulang',
                            style: TextStyle(color: AppColors.warning, fontSize: 12),
                          ),
                        ],
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
        ),
      ),
    );
  }
}
