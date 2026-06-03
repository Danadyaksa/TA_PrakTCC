import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../data/services/firestore_service.dart';

class NotificationProvider extends ChangeNotifier {
  final FirestoreService _firestoreService = FirestoreService();
  
  List<Map<String, dynamic>> _notifications = [];
  StreamSubscription? _notificationSubscription;
  int? _userId;

  List<Map<String, dynamic>> get notifications => _notifications;
  int get unreadCount => _notifications.where((n) => n['is_read'] == false).length;

  /// Start listening untuk notifikasi user
  void startListening(int userId) {
    _userId = userId;
    _notificationSubscription?.cancel();
    
    _notificationSubscription = _firestoreService
        .listenToNotifications(userId)
        .listen((snapshot) {
      _notifications = snapshot.docs.map((doc) {
        final data = doc.data() as Map<String, dynamic>;
        data['id'] = doc.id;
        return data;
      }).toList();
      notifyListeners();
    });
  }

  /// Stop listening
  void stopListening() {
    _notificationSubscription?.cancel();
    _notificationSubscription = null;
  }

  /// Mark notifikasi sebagai sudah dibaca
  Future<void> markAsRead(String notificationId) async {
    await _firestoreService.markNotificationAsRead(notificationId);
    
    // Update local state
    final index = _notifications.indexWhere((n) => n['id'] == notificationId);
    if (index != -1) {
      _notifications[index]['is_read'] = true;
      notifyListeners();
    }
  }

  /// Mark semua notifikasi sebagai sudah dibaca
  Future<void> markAllAsRead() async {
    for (var notification in _notifications) {
      if (notification['is_read'] == false) {
        await markAsRead(notification['id']);
      }
    }
  }

  @override
  void dispose() {
    stopListening();
    super.dispose();
  }
}
