import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:mobile_karyawan/ui/controllers/auth_provider.dart';
import 'package:mobile_karyawan/ui/controllers/attendance_provider.dart';
import 'package:mobile_karyawan/ui/controllers/schedule_provider.dart';
import 'package:mobile_karyawan/ui/controllers/notification_provider.dart';
import 'package:mobile_karyawan/ui/views/attendance_camera_screen.dart';
import 'package:mobile_karyawan/core/constants/app_colors.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AttendanceProvider>().fetchHistory();
      context.read<ScheduleProvider>().fetchTodaySchedule();
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

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
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
                  Stack(
                    children: [
                      const CircleAvatar(
                        backgroundColor: AppColors.primary,
                        child: Icon(Icons.person, color: Colors.white),
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
                              '${notificationProv.unreadCount}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                    ],
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
                      todaySchedule?.formattedShift ?? '08:00 - 17:00',
                      style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      todayAtt == null 
                        ? 'Belum melakukan presensi' 
                        : todayAtt.checkOut == null 
                          ? 'Sudah Check-In pada ${DateFormat('HH:mm').format(DateTime.parse(todayAtt.checkIn!))}'
                          : 'Sudah Check-Out pada ${DateFormat('HH:mm').format(DateTime.parse(todayAtt.checkOut!))}',
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
                      onTap: todayAtt?.checkOut != null ? null : () {
                        if (todayAtt == null) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const AttendanceCameraScreen(isCheckIn: true),
                            ),
                          );
                        } else {
                          // Check out logic directly
                          context.read<AttendanceProvider>().checkOut();
                        }
                      },
                      child: Container(
                        width: 200,
                        height: 200,
                        decoration: BoxDecoration(
                          color: todayAtt?.checkOut != null 
                            ? Colors.grey.shade300
                            : todayAtt == null 
                              ? AppColors.primary 
                              : AppColors.warning,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: (todayAtt == null ? AppColors.primary : AppColors.warning).withOpacity(0.4),
                              blurRadius: 20,
                              spreadRadius: 5,
                            ),
                          ],
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              todayAtt == null ? Icons.login_rounded : Icons.logout_rounded,
                              size: 60,
                              color: Colors.white,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              todayAtt == null ? 'CHECK IN' : 'CHECK OUT',
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
                    if (todayAtt?.checkOut != null)
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
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
