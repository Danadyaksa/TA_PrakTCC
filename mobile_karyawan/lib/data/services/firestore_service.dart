import 'package:cloud_firestore/cloud_firestore.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  /// 1. GPS Logs - Mencatat lokasi saat check-in/out
  Future<void> logGPS({
    required int userId,
    required double latitude,
    required double longitude,
    required bool isInRadius,
    required String type, // 'check-in' atau 'check-out'
  }) async {
    try {
      await _firestore.collection('gps_logs').add({
        'user_id': userId,
        'latitude': latitude,
        'longitude': longitude,
        'is_in_radius': isInRadius,
        'type': type,
        'timestamp': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      print('Error logging GPS: $e');
      rethrow;
    }
  }

  /// 2. Selfie Logs - Mencatat metadata foto selfie
  Future<void> logSelfie({
    required int userId,
    required bool isFaceDetected,
    required double livenessScore,
    required String status, // 'passed' atau 'failed'
    String? photoUrl,
  }) async {
    try {
      await _firestore.collection('selfie_logs').add({
        'user_id': userId,
        'is_face_detected': isFaceDetected,
        'liveness_score': livenessScore,
        'status': status,
        'photo_url': photoUrl,
        'timestamp': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      print('Error logging selfie: $e');
      rethrow;
    }
  }

  /// 3. Face Validations - Hasil validasi wajah dari ML Kit
  Future<void> logFaceValidation({
    required int userId,
    required bool faceDetected,
    required double livenessScore,
    required bool smileDetected,
    required bool eyesOpen,
    required String validationResult, // 'passed' atau 'failed'
  }) async {
    try {
      await _firestore.collection('face_validations').add({
        'user_id': userId,
        'face_detected': faceDetected,
        'liveness_score': livenessScore,
        'smile_detected': smileDetected,
        'eyes_open': eyesOpen,
        'validation_result': validationResult,
        'timestamp': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      print('Error logging face validation: $e');
      rethrow;
    }
  }

  /// 4. Mobile Error Logs - Mencatat error yang terjadi di aplikasi
  Future<void> logError({
    required int userId,
    required String errorType,
    required String message,
    String? stackTrace,
  }) async {
    try {
      await _firestore.collection('mobile_error_logs').add({
        'user_id': userId,
        'error_type': errorType,
        'message': message,
        'stack_trace': stackTrace,
        'timestamp': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      print('Error logging error: $e');
    }
  }

  /// 5. Notification Logs - Mencatat notifikasi yang dikirim/diterima
  Future<void> logNotification({
    required int userId,
    required String title,
    required String message,
    required String type, // 'info', 'warning', 'success', 'error'
    bool isRead = false,
  }) async {
    try {
      await _firestore.collection('notification_logs').add({
        'user_id': userId,
        'title': title,
        'message': message,
        'type': type,
        'is_read': isRead,
        'timestamp': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      print('Error logging notification: $e');
      rethrow;
    }
  }

  /// Listen untuk notifikasi real-time dari HRD
  Stream<QuerySnapshot> listenToNotifications(int userId) {
    return _firestore
        .collection('notification_logs')
        .where('user_id', isEqualTo: userId)
        .orderBy('timestamp', descending: true)
        .limit(50)
        .snapshots();
  }

  /// Mark notifikasi sebagai sudah dibaca
  Future<void> markNotificationAsRead(String notificationId) async {
    try {
      await _firestore
          .collection('notification_logs')
          .doc(notificationId)
          .update({'is_read': true});
    } catch (e) {
      print('Error marking notification as read: $e');
    }
  }
}
