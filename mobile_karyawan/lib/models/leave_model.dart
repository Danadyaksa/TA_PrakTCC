class LeaveRequest {
  final int id;
  final String type;
  final String startDate;
  final String endDate;
  final String? reason;
  final String status;

  LeaveRequest({
    required this.id,
    required this.type,
    required this.startDate,
    required this.endDate,
    this.reason,
    required this.status,
  });

  factory LeaveRequest.fromJson(Map<String, dynamic> json) {
    return LeaveRequest(
      id: json['id'],
      type: json['type'],
      startDate: json['start_date'],
      endDate: json['end_date'],
      reason: json['reason'],
      status: json['status'],
    );
  }

  /// Format tanggal selesai untuk tampilan, misal "5 Jun 2026"
  String get formattedEndDate {
    try {
      final date = DateTime.parse(endDate);
      const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
      return '${date.day} ${months[date.month - 1]} ${date.year}';
    } catch (_) {
      return endDate;
    }
  }

  String get typeLabel {
    switch (type.toLowerCase()) {
      case 'cuti': return 'Cuti';
      case 'izin': return 'Izin';
      case 'sakit': return 'Sakit';
      default: return type;
    }
  }
}
