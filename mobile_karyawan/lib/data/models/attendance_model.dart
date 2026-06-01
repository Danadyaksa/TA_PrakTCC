class Attendance {
  final int id;
  final String? checkIn;
  final String? checkOut;
  final String status;
  final int lateMinutes;
  final String? userName;

  Attendance({
    required this.id,
    this.checkIn,
    this.checkOut,
    required this.status,
    required this.lateMinutes,
    this.userName,
  });

  factory Attendance.fromJson(Map<String, dynamic> json) {
    return Attendance(
      id: json['id'],
      checkIn: json['check_in'],
      checkOut: json['check_out'],
      status: json['status'],
      lateMinutes: json['late_minutes'] ?? 0,
      userName: json['user_name'],
    );
  }
}
