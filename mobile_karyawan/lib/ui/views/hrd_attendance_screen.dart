import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile_karyawan/core/constants/app_colors.dart';
import 'package:mobile_karyawan/data/services/attendance_service.dart';

class HrdAttendanceScreen extends StatefulWidget {
  const HrdAttendanceScreen({super.key});

  @override
  State<HrdAttendanceScreen> createState() => _HrdAttendanceScreenState();
}

class _HrdAttendanceScreenState extends State<HrdAttendanceScreen> {
  final AttendanceService _service = AttendanceService();

  DateTime _selectedDate = DateTime.now();
  bool _isLoading = false;
  Map<String, dynamic>? _data;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchSummary();
  }

  Future<void> _fetchSummary() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
      final result = await _service.getDailySummary(date: dateStr);
      setState(() {
        _data = result;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2024),
      lastDate: DateTime.now(),
      locale: const Locale('id', 'ID'),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() => _selectedDate = picked);
      _fetchSummary();
    }
  }

  @override
  Widget build(BuildContext context) {
    final summary = _data?['summary'] as List<dynamic>? ?? [];
    final total = _data?['total'] ?? 0;

    // Hitung statistik
    final hadir = summary.where((e) => e['status'] == 'hadir').length;
    final terlambat = summary.where((e) => e['status'] == 'terlambat').length;
    final alpha = summary.where((e) => e['status'] == 'alpha').length;
    final izin = summary.where((e) => e['status'] == 'izin' || e['status'] == 'sakit').length;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'Presensi Harian',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _fetchSummary,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: Column(
        children: [
          // Date Picker Bar
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: InkWell(
              onTap: _pickDate,
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.calendar_today_rounded,
                            color: AppColors.primary, size: 18),
                        const SizedBox(width: 10),
                        Text(
                          DateFormat('EEEE, d MMMM yyyy', 'id_ID')
                              .format(_selectedDate),
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                    const Icon(Icons.arrow_drop_down_rounded,
                        color: AppColors.textSecondary),
                  ],
                ),
              ),
            ),
          ),

          // Stats Row
          if (_data != null && !_isLoading)
            Container(
              color: Colors.white,
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Row(
                children: [
                  _statChip('Hadir', hadir, AppColors.success),
                  const SizedBox(width: 8),
                  _statChip('Terlambat', terlambat, AppColors.warning),
                  const SizedBox(width: 8),
                  _statChip('Alpha', alpha, AppColors.danger),
                  const SizedBox(width: 8),
                  _statChip('Izin/Sakit', izin, AppColors.info),
                ],
              ),
            ),

          const Divider(height: 1),

          // List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.error_outline,
                                  color: AppColors.danger, size: 48),
                              const SizedBox(height: 12),
                              Text(_error!,
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(
                                      color: AppColors.textSecondary)),
                            ],
                          ),
                        ),
                      )
                    : summary.isEmpty
                        ? const Center(
                            child: Text(
                              'Tidak ada jadwal pada hari ini',
                              style: TextStyle(color: AppColors.textSecondary),
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: _fetchSummary,
                            child: ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: summary.length,
                              itemBuilder: (context, index) =>
                                  _buildCard(summary[index]),
                            ),
                          ),
          ),
        ],
      ),
    );
  }

  Widget _statChip(String label, int count, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Text(
              '$count',
              style: TextStyle(
                  fontSize: 18, fontWeight: FontWeight.bold, color: color),
            ),
            Text(
              label,
              style: TextStyle(fontSize: 10, color: color),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCard(Map<String, dynamic> row) {
    final status = row['status'] as String? ?? 'alpha';

    Color statusColor;
    IconData statusIcon;
    switch (status) {
      case 'hadir':
        statusColor = AppColors.success;
        statusIcon = Icons.check_circle_rounded;
        break;
      case 'terlambat':
        statusColor = AppColors.warning;
        statusIcon = Icons.schedule_rounded;
        break;
      case 'alpha':
        statusColor = AppColors.danger;
        statusIcon = Icons.block_rounded;
        break;
      case 'izin':
      case 'sakit':
        statusColor = AppColors.info;
        statusIcon = Icons.event_note_rounded;
        break;
      default:
        statusColor = AppColors.textSecondary;
        statusIcon = Icons.help_outline_rounded;
    }

    final checkIn = row['check_in'] != null
        ? DateFormat('HH:mm').format(DateTime.parse(row['check_in']).toLocal())
        : '--:--';
    final checkOut = row['check_out'] != null
        ? DateFormat('HH:mm').format(DateTime.parse(row['check_out']).toLocal())
        : '--:--';
    final shiftStart = (row['shift_start'] as String? ?? '').substring(0, 5);
    final shiftEnd = (row['shift_end'] as String? ?? '').substring(0, 5);
    final lateMinutes = row['late_minutes'] as int? ?? 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: status == 'alpha'
              ? AppColors.danger.withOpacity(0.3)
              : Colors.grey.shade200,
        ),
      ),
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: CircleAvatar(
          backgroundColor: statusColor.withOpacity(0.15),
          child: Icon(statusIcon, color: statusColor, size: 20),
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                row['user_name'] ?? '-',
                style: const TextStyle(
                    fontWeight: FontWeight.bold, fontSize: 14),
              ),
            ),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                status.toUpperCase(),
                style: TextStyle(
                    color: statusColor,
                    fontSize: 10,
                    fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              row['department_name'] ?? '-',
              style: const TextStyle(
                  fontSize: 11, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                _infoChip(Icons.login_rounded, 'Masuk', checkIn),
                const SizedBox(width: 16),
                _infoChip(Icons.logout_rounded, 'Keluar', checkOut),
                const SizedBox(width: 16),
                _infoChip(Icons.access_time_rounded, 'Shift',
                    '$shiftStart–$shiftEnd'),
                if (lateMinutes > 0) ...[
                  const SizedBox(width: 16),
                  _infoChip(Icons.warning_amber_rounded, 'Telat',
                      '${lateMinutes}m',
                      color: AppColors.warning),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoChip(IconData icon, String label, String value,
      {Color color = AppColors.textSecondary}) {
    return Row(
      children: [
        Icon(icon, size: 12, color: color),
        const SizedBox(width: 3),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: TextStyle(fontSize: 9, color: color)),
            Text(value,
                style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: color == AppColors.textSecondary
                        ? AppColors.textPrimary
                        : color)),
          ],
        ),
      ],
    );
  }
}
