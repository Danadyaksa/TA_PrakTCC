class User {
  final int id;
  final String name;
  final String email;
  final String role;
  final String? departmentName;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.departmentName,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      role: json['role'],
      departmentName: json['department_name'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'department_name': departmentName,
    };
  }
}
