import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:mobile_karyawan/ui/controllers/attendance_provider.dart';
import 'package:mobile_karyawan/core/constants/app_colors.dart';
import 'package:mobile_karyawan/models/attendance_model.dart';

class AttendanceHistoryScreen extends StatefulWidget {
  const AttendanceHistoryScreen({super.key});

  @override
  State<AttendanceHistoryScreen> createState() => _AttendanceHistoryScreenState();
}

class _AttendanceHistoryScreenState extends State<AttendanceHistoryScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AttendanceProvider>().fetchHistory();
    });
  }

  @override
  Widget build(BuildContext context) {
    final attendanceProv = context.watch<AttendanceProvider>();
    final history = attendanceProv.history;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Riwayat Presensi', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: () => attendanceProv.fetchHistory(),
        child: attendanceProv.isLoading && history.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : history.isEmpty
                ? const Center(
                    child: Text('Belum ada riwayat presensi', 
                    style: TextStyle(color: AppColors.textSecondary)))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: history.length,
                    itemBuilder: (context, index) {
                      final att = history[index];
                      return _buildHistoryCard(att);
                    },
                  ),
      ),
    );
  }

  Widget _buildHistoryCard(Attendance att) {
    Color statusColor;
    switch (att.status) {
      case 'hadir': statusColor = AppColors.success; break;
      case 'terlambat': statusColor = AppColors.warning; break;
      case 'alpha': statusColor = AppColors.danger; break;
      default: statusColor = AppColors.info;
    }

    final checkInTime = att.checkIn != null 
        ? DateFormat('HH:mm').format(DateTime.parse(att.checkIn!))
        : '--:--';
    final checkOutTime = att.checkOut != null 
        ? DateFormat('HH:mm').format(DateTime.parse(att.checkOut!))
        : '--:--';
    final date = att.checkIn != null 
        ? DateFormat('EEEE, d MMM yyyy', 'id_ID').format(DateTime.parse(att.checkIn!))
        : 'Tanggal tidak tersedia';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(date, style: const TextStyle(fontWeight: FontWeight.bold)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  att.status.toUpperCase(),
                  style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const Divider(height: 24),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Check In', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    Text(checkInTime, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Check Out', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    Text(checkOutTime, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              if (att.lateMinutes > 0)
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      const Text('Terlambat', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                      Text('${att.lateMinutes}m', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.danger)),
                    ],
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
