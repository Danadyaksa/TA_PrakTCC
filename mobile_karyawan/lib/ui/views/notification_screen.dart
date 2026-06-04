import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:mobile_karyawan/ui/controllers/notification_provider.dart';
import 'package:mobile_karyawan/core/constants/app_colors.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotificationProvider>().markAllAsRead();
    });
  }

  Color _typeColor(String? type) {
    switch (type) {
      case 'warning': return AppColors.warning;
      case 'success': return AppColors.success;
      case 'error':   return AppColors.danger;
      default:        return AppColors.primary;
    }
  }

  IconData _typeIcon(String? type) {
    switch (type) {
      case 'warning': return Icons.warning_amber_rounded;
      case 'success': return Icons.check_circle_outline;
      case 'error':   return Icons.error_outline;
      default:        return Icons.notifications_outlined;
    }
  }

  String _formatTime(dynamic timestamp) {
    if (timestamp == null) return '';
    try {
      final dt = (timestamp as Timestamp).toDate().toLocal();
      final now = DateTime.now();
      final diff = now.difference(dt);
      if (diff.inMinutes < 1) return 'Baru saja';
      if (diff.inMinutes < 60) return '${diff.inMinutes} menit lalu';
      if (diff.inHours < 24) return '${diff.inHours} jam lalu';
      return '${diff.inDays} hari lalu';
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final notifProv = context.watch<NotificationProvider>();
    final notifications = notifProv.notifications;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Notifikasi', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        actions: [
          if (notifications.any((n) => n['is_read'] == false))
            TextButton(
              onPressed: () => notifProv.markAllAsRead(),
              child: const Text('Tandai semua dibaca', style: TextStyle(fontSize: 12)),
            ),
        ],
      ),
      body: notifications.isEmpty
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.notifications_none, size: 64, color: Colors.grey),
                  SizedBox(height: 12),
                  Text('Belum ada notifikasi',
                      style: TextStyle(color: AppColors.textSecondary)),
                ],
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: notifications.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final notif = notifications[index];
                final isRead = notif['is_read'] == true;
                final type = notif['type'] as String?;
                final color = _typeColor(type);

                return GestureDetector(
                  onTap: () {
                    if (!isRead) notifProv.markAsRead(notif['id']);
                  },
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isRead ? Colors.white : color.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isRead ? Colors.grey.shade200 : color.withOpacity(0.3),
                      ),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: color.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(_typeIcon(type), color: color, size: 20),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      notif['title'] ?? '',
                                      style: TextStyle(
                                        fontWeight: isRead ? FontWeight.w500 : FontWeight.bold,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ),
                                  if (!isRead)
                                    Container(
                                      width: 8, height: 8,
                                      decoration: BoxDecoration(
                                        color: color, shape: BoxShape.circle,
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                notif['message'] ?? '',
                                style: const TextStyle(
                                  color: AppColors.textSecondary, fontSize: 13,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                _formatTime(notif['timestamp']),
                                style: const TextStyle(
                                  color: AppColors.textSecondary, fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
