import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz;
import 'package:cloud_firestore/cloud_firestore.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _plugin = FlutterLocalNotificationsPlugin();
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  bool _initialized = false;

  // ID user yang sedang login (diset dari luar)
  int? currentUserId;

  // Notification IDs
  static const int idCheckinReminder = 1;
  static const int idAlphaWarning = 2;
  static const int idCheckoutReminder = 3;

  Future<void> init() async {
    if (_initialized) return;

    tz.initializeTimeZones();
    tz.setLocalLocation(tz.getLocation('Asia/Jakarta'));

    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const initSettings = InitializationSettings(android: androidSettings);

    await _plugin.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (details) {
      },
    );

    // Minta permission Android 13+
    await _plugin
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.requestNotificationsPermission();

    _initialized = true;
  }

  /// Channel config untuk Android
  AndroidNotificationDetails get _androidDetails => const AndroidNotificationDetails(
    'presensi_channel',
    'Pengingat Presensi',
    channelDescription: 'Notifikasi pengingat absensi karyawan',
    importance: Importance.high,
    priority: Priority.high,
    icon: '@mipmap/ic_launcher',
  );

  NotificationDetails get _notifDetails => NotificationDetails(android: _androidDetails);

  /// Tampilkan notif langsung (immediate)
  Future<void> showImmediate({
    required int id,
    required String title,
    required String body,
  }) async {
    await init();
    await _plugin.show(id, title, body, _notifDetails);
  }

  /// Jadwalkan notif pada waktu tertentu hari ini
  Future<void> scheduleToday({
    required int id,
    required String title,
    required String body,
    required int hour,
    required int minute,
  }) async {
    await init();

    final now = tz.TZDateTime.now(tz.local);
    var scheduledTime = tz.TZDateTime(
      tz.local,
      now.year, now.month, now.day,
      hour, minute,
    );

    // Kalau waktu sudah lewat hari ini, skip
    if (scheduledTime.isBefore(now)) return;

    await _plugin.zonedSchedule(
      id,
      title,
      body,
      scheduledTime,
      _notifDetails,
      androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
    );
  }

  /// Jadwalkan 3 notif berdasarkan jadwal shift hari ini
  /// - 10 menit sebelum shift mulai (reminder check-in)
  /// - [alphaMinutes] setelah shift mulai (warning alpha)
  /// - 5 menit setelah shift selesai (reminder check-out)
  Future<void> scheduleShiftNotifications({
    required String shiftStart,  // "HH:mm:ss"
    required String shiftEnd,    // "HH:mm:ss"
    required int alphaMinutes,   // dari attendance_rules
  }) async {
    await init();
    await cancelAll();

    final startParts = shiftStart.split(':');
    final endParts = shiftEnd.split(':');

    final startHour = int.parse(startParts[0]);
    final startMin = int.parse(startParts[1]);
    final endHour = int.parse(endParts[0]);
    final endMin = int.parse(endParts[1]);

    final checkinReminderMin = startMin - 10;
    final checkinReminderHour = checkinReminderMin < 0 ? startHour - 1 : startHour;
    final checkinReminderMinFinal = checkinReminderMin < 0 ? 60 + checkinReminderMin : checkinReminderMin;

    await _scheduleWithFirestore(
      id: idCheckinReminder,
      title: '⏰ Pengingat Absen Masuk',
      body: 'Shift dimulai jam ${startParts[0]}:${startParts[1]}. Jangan lupa absen!',
      hour: checkinReminderHour,
      minute: checkinReminderMinFinal,
      type: 'info',
    );

    final alphaTotalMin = startMin + alphaMinutes;
    final alphaHour = startHour + (alphaTotalMin ~/ 60);
    final alphaMin = alphaTotalMin % 60;

    await _scheduleWithFirestore(
      id: idAlphaWarning,
      title: '⚠️ Segera Absen!',
      body: 'Anda belum absen. $alphaMinutes menit lagi dianggap Alpha!',
      hour: alphaHour,
      minute: alphaMin,
      type: 'warning',
    );

    final checkoutTotalMin = endMin + 5;
    final checkoutHour = endHour + (checkoutTotalMin ~/ 60);
    final checkoutMin = checkoutTotalMin % 60;

    await _scheduleWithFirestore(
      id: idCheckoutReminder,
      title: '🏁 Jangan Lupa Absen Pulang',
      body: 'Shift sudah selesai. Segera lakukan check-out!',
      hour: checkoutHour,
      minute: checkoutMin,
      type: 'info',
    );
  }

  /// Jadwalkan notif lokal DAN simpan ke Firestore notification_logs
  Future<void> _scheduleWithFirestore({
    required int id,
    required String title,
    required String body,
    required int hour,
    required int minute,
    required String type,
  }) async {
    await init();

    final now = tz.TZDateTime.now(tz.local);
    final scheduledTime = tz.TZDateTime(
      tz.local,
      now.year, now.month, now.day,
      hour, minute,
    );

    // Simpan ke Firestore dulu tanpa cek waktu (biar selalu masuk riwayat)
    if (currentUserId != null) {
      try {
        // Cek apakah notif hari ini sudah ada untuk menghindari duplikat
        final todayStr = '${now.year}-${now.month.toString().padLeft(2,'0')}-${now.day.toString().padLeft(2,'0')}';
        final existing = await _firestore
            .collection('notification_logs')
            .where('user_id', isEqualTo: currentUserId)
            .where('notification_id', isEqualTo: id)
            .where('date', isEqualTo: todayStr)
            .limit(1)
            .get();

        if (existing.docs.isEmpty) {
          await _firestore.collection('notification_logs').add({
            'user_id': currentUserId,
            'notification_id': id,
            'title': title,
            'message': body,
            'type': type,
            'is_read': false,
            'date': todayStr,
            'scheduled_for': '${hour.toString().padLeft(2,'0')}:${minute.toString().padLeft(2,'0')}',
            'timestamp': FieldValue.serverTimestamp(),
          });
          print('✅ Notification saved to Firestore: $title');
        }
      } catch (e) {
        print('⚠️ Failed to save notification to Firestore: $e');
      }
    }

    // Jadwalkan notif lokal hanya kalau belum lewat
    if (scheduledTime.isAfter(now)) {
      try {
        await _plugin.zonedSchedule(
          id, title, body,
          scheduledTime,
          _notifDetails,
          androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
          uiLocalNotificationDateInterpretation:
              UILocalNotificationDateInterpretation.absoluteTime,
        );
        print('✅ Notification scheduled at $hour:$minute');
      } catch (e) {
        print('⚠️ Failed to schedule local notification: $e');
      }
    } else {
      print('⏭️ Notification time $hour:$minute already passed, skipping local schedule');
    }
  }

  Future<void> cancelAll() async {
    await _plugin.cancelAll();
  }

  Future<void> cancel(int id) async {
    await _plugin.cancel(id);
  }
}
