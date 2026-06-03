class Schedule {
  final int id;
  final int userId;
  final int dayOfWeek; // 0: Sunday, 1: Monday, etc.
  final String shiftStart; // Format: "HH:mm:ss"
  final String shiftEnd;

  Schedule({
    required this.id,
    required this.userId,
    required this.dayOfWeek,
    required this.shiftStart,
    required this.shiftEnd,
  });

  factory Schedule.fromJson(Map<String, dynamic> json) {
    return Schedule(
      id: json['id'],
      userId: json['user_id'],
      dayOfWeek: json['day_of_week'],
      shiftStart: json['shift_start'],
      shiftEnd: json['shift_end'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'day_of_week': dayOfWeek,
      'shift_start': shiftStart,
      'shift_end': shiftEnd,
    };
  }

  // Helper untuk format tampilan
  String get formattedShift {
    // Konversi dari "08:00:00" ke "08:00"
    final start = shiftStart.substring(0, 5);
    final end = shiftEnd.substring(0, 5);
    return '$start - $end';
  }
}
