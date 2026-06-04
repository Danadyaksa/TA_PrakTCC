class Schedule {
  final int id;
  final int? userId;        // nullable — jadwal per departemen tidak punya user_id
  final int? departmentId;  // jadwal baru pakai department_id
  final int dayOfWeek;
  final String shiftStart;
  final String shiftEnd;

  Schedule({
    required this.id,
    this.userId,
    this.departmentId,
    required this.dayOfWeek,
    required this.shiftStart,
    required this.shiftEnd,
  });

  factory Schedule.fromJson(Map<String, dynamic> json) {
    return Schedule(
      id: json['id'] as int,
      userId: json['user_id'] as int?,
      departmentId: json['department_id'] as int?,
      dayOfWeek: json['day_of_week'] as int,
      shiftStart: json['shift_start'] as String,
      shiftEnd: json['shift_end'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'department_id': departmentId,
      'day_of_week': dayOfWeek,
      'shift_start': shiftStart,
      'shift_end': shiftEnd,
    };
  }

  String get formattedShift {
    final start = shiftStart.substring(0, 5);
    final end = shiftEnd.substring(0, 5);
    return '$start - $end';
  }
}
