import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:mobile_karyawan/data/providers/leave_provider.dart';
import 'package:mobile_karyawan/core/constants/app_colors.dart';
import 'package:mobile_karyawan/data/models/leave_model.dart';
import 'apply_leave_screen.dart';

class LeaveScreen extends StatefulWidget {
  const LeaveScreen({super.key});

  @override
  State<LeaveScreen> createState() => _LeaveScreenState();
}

class _LeaveScreenState extends State<LeaveScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<LeaveProvider>().fetchLeaves();
    });
  }

  @override
  Widget build(BuildContext context) {
    final leaveProv = context.watch<LeaveProvider>();
    final leaves = leaveProv.leaves;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Pengajuan Cuti', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: () => leaveProv.fetchLeaves(),
        child: leaveProv.isLoading && leaves.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : leaves.isEmpty
                ? const Center(child: Text('Belum ada pengajuan cuti', style: TextStyle(color: AppColors.textSecondary)))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: leaves.length,
                    itemBuilder: (context, index) {
                      return _buildLeaveCard(leaves[index]);
                    },
                  ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const ApplyLeaveScreen()),
          );
        },
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Ajukan Cuti', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildLeaveCard(LeaveRequest leave) {
    Color statusColor;
    switch (leave.status) {
      case 'approved': statusColor = AppColors.success; break;
      case 'rejected': statusColor = AppColors.danger; break;
      default: statusColor = AppColors.warning;
    }

    return Container(
      margin: const EdgeInsets.bottom(12),
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
              Text(
                leave.type.toUpperCase(),
                style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  leave.status.toUpperCase(),
                  style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${DateFormat('d MMM').format(DateTime.parse(leave.startDate))} - ${DateFormat('d MMM yyyy').format(DateTime.parse(leave.endDate))}',
            style: const TextStyle(fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 4),
          Text(
            leave.reason,
            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
