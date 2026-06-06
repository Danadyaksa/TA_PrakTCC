import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:mobile_karyawan/core/constants/app_colors.dart';
import 'package:mobile_karyawan/ui/controllers/auth_provider.dart';
import 'package:mobile_karyawan/ui/controllers/attendance_provider.dart';
import 'package:mobile_karyawan/ui/controllers/leave_provider.dart';
import 'package:mobile_karyawan/ui/controllers/schedule_provider.dart';
import 'package:mobile_karyawan/ui/controllers/notification_provider.dart';
import 'package:mobile_karyawan/ui/views/login_screen.dart';
import 'package:mobile_karyawan/ui/views/profile_screen.dart';
import 'package:mobile_karyawan/ui/views/home_screen.dart';
import 'package:mobile_karyawan/ui/views/history_screen.dart';
import 'package:mobile_karyawan/ui/views/hrd_attendance_screen.dart';
import 'package:mobile_karyawan/ui/views/leave_screen.dart';
import 'package:mobile_karyawan/data/services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp();
  
  // Initialize date formatting
  await initializeDateFormatting('id_ID', null);

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => AttendanceProvider()),
        ChangeNotifierProvider(create: (_) => LeaveProvider()),
        ChangeNotifierProvider(create: (_) => ScheduleProvider()),
        ChangeNotifierProvider(create: (_) => NotificationProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PresensiApp',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: AppColors.primary),
        fontFamily: 'InstrumentSans',
      ),
      home: const AuthWrapper(),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        if (auth.isLoading) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        
        if (auth.isAuthenticated && auth.user != null) {
          // Start listening untuk notifikasi
          WidgetsBinding.instance.addPostFrameCallback((_) {
            context.read<NotificationProvider>().startListening(auth.user!.id);
          });
          return const MainNavigation();
        }
        
        return const LoginScreen();
      },
    );
  }
}

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final isHrd = user?.role == 'hrd';

    final List<Widget> screens = isHrd
        ? [
            const HomeScreen(),
            const HrdAttendanceScreen(),
            const LeaveScreen(),
            const ProfileScreen(),
          ]
        : [
            const HomeScreen(),
            const AttendanceHistoryScreen(),
            const LeaveScreen(),
            const ProfileScreen(),
          ];

    return Scaffold(
      body: screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: Colors.grey,
        items: [
          const BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(
            icon: Icon(isHrd ? Icons.people_alt_rounded : Icons.history),
            label: isHrd ? 'Presensi' : 'Riwayat',
          ),
          const BottomNavigationBarItem(icon: Icon(Icons.note_add), label: 'Cuti'),
          const BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profil'),
        ],
      ),
    );
  }
}
