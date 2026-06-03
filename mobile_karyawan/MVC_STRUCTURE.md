# 📐 MVC Architecture - Flutter Mobile Karyawan

## ✅ Struktur Folder (Sesuai FLUTTER_GUIDELINES.md)

```
lib/
├── models/                          # ✅ MODEL - Data entities
│   ├── user_model.dart
│   ├── attendance_model.dart
│   ├── leave_model.dart
│   ├── schedule_model.dart
│   └── work_location_model.dart
│
├── ui/
│   ├── views/                       # ✅ VIEW - UI/Screens
│   │   ├── login_screen.dart
│   │   ├── home_screen.dart
│   │   ├── attendance_camera_screen.dart
│   │   ├── history_screen.dart
│   │   ├── leave_screen.dart
│   │   ├── apply_leave_screen.dart
│   │   └── profile_screen.dart
│   │
│   └── controllers/                 # ✅ CONTROLLER - Business Logic
│       ├── auth_provider.dart
│       ├── attendance_provider.dart
│       ├── leave_provider.dart
│       ├── schedule_provider.dart
│       └── notification_provider.dart
│
├── data/
│   └── services/                    # ✅ SERVICES - API & Database
│       ├── auth_service.dart
│       ├── attendance_service.dart
│       ├── leave_service.dart
│       ├── schedule_service.dart
│       ├── location_service.dart
│       └── firestore_service.dart
│
├── core/
│   └── constants/                   # ✅ CONSTANTS
│       ├── app_colors.dart
│       └── app_constants.dart
│
└── main.dart                        # ✅ Entry Point
```

---

## 🏗️ MVC Pattern Explanation

### **M - Model** (`lib/models/`)
Representasi data dari JSON API atau database.

**Contoh:** `user_model.dart`
```dart
class User {
  final int id;
  final String name;
  final String email;
  
  User({required this.id, required this.name, required this.email});
  
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
    );
  }
}
```

**Aturan:**
- ✅ Hanya berisi data dan parsing JSON
- ❌ Tidak boleh ada logika bisnis
- ❌ Tidak boleh ada HTTP request

---

### **V - View** (`lib/ui/views/`)
Antarmuka pengguna (UI/Widgets).

**Contoh:** `home_screen.dart`
```dart
class HomeScreen extends StatefulWidget {
  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    
    return Scaffold(
      body: Text('Hello ${user?.name}'),
    );
  }
}
```

**Aturan:**
- ✅ Hanya berisi UI dan Widget
- ✅ Menggunakan `Consumer` atau `context.watch()` untuk data
- ❌ Tidak boleh ada HTTP request
- ❌ Tidak boleh ada logika bisnis kompleks

---

### **C - Controller** (`lib/ui/controllers/`)
Business logic dan state management menggunakan Provider.

**Contoh:** `auth_provider.dart`
```dart
class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  User? _user;
  
  User? get user => _user;
  
  Future<bool> login(String email, String password) async {
    final result = await _authService.login(email, password);
    _user = User.fromJson(result['user']);
    notifyListeners(); // Update UI
    return true;
  }
}
```

**Aturan:**
- ✅ Extends `ChangeNotifier`
- ✅ Memanggil Service untuk HTTP request
- ✅ Menyimpan state/data
- ✅ Memanggil `notifyListeners()` untuk update UI
- ❌ Tidak boleh ada HTTP request langsung (harus via Service)

---

### **Services** (`lib/data/services/`)
Kelas murni untuk HTTP Request atau koneksi database.

**Contoh:** `auth_service.dart`
```dart
class AuthService {
  final String _baseUrl = AppConstants.baseUrl;
  
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/login'),
      body: jsonEncode({'email': email, 'password': password}),
    );
    return jsonDecode(response.body);
  }
}
```

**Aturan:**
- ✅ Hanya berisi HTTP request atau Firestore operations
- ✅ Return data mentah (Map, List, dll)
- ❌ Tidak boleh ada `notifyListeners()`
- ❌ Tidak boleh ada UI logic

---

## 🔄 Data Flow

```
┌─────────────┐
│    VIEW     │  User tap button
│ (UI Screen) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ CONTROLLER  │  Call service & update state
│ (Provider)  │  notifyListeners()
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   SERVICE   │  HTTP Request / Firestore
│ (API/DB)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    MODEL    │  Parse JSON to Object
│ (Data Class)│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ CONTROLLER  │  Store data & notify
│ (Provider)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    VIEW     │  UI auto-rebuild
│ (UI Screen) │
└─────────────┘
```

---

## 📝 Example: Add New Feature (Salary Screen)

### 1. Model (`lib/models/salary_model.dart`)
```dart
class Salary {
  final int id;
  final int userId;
  final double netSalary;
  
  factory Salary.fromJson(Map<String, dynamic> json) {
    return Salary(
      id: json['id'],
      userId: json['user_id'],
      netSalary: double.parse(json['net_salary'].toString()),
    );
  }
}
```

### 2. Service (`lib/data/services/salary_service.dart`)
```dart
class SalaryService {
  Future<List<Salary>> getMySalaries() async {
    final response = await http.get(Uri.parse('$baseUrl/salaries/my'));
    List data = jsonDecode(response.body);
    return data.map((item) => Salary.fromJson(item)).toList();
  }
}
```

### 3. Controller (`lib/ui/controllers/salary_provider.dart`)
```dart
class SalaryProvider extends ChangeNotifier {
  final SalaryService _service = SalaryService();
  List<Salary> _salaries = [];
  
  List<Salary> get salaries => _salaries;
  
  Future<void> fetchSalaries() async {
    _salaries = await _service.getMySalaries();
    notifyListeners();
  }
}
```

### 4. View (`lib/ui/views/salary_screen.dart`)
```dart
class SalaryScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final salaryProv = context.watch<SalaryProvider>();
    
    return ListView.builder(
      itemCount: salaryProv.salaries.length,
      itemBuilder: (context, index) {
        final salary = salaryProv.salaries[index];
        return ListTile(
          title: Text('Rp ${salary.netSalary}'),
        );
      },
    );
  }
}
```

### 5. Register Provider (`lib/main.dart`)
```dart
MultiProvider(
  providers: [
    ChangeNotifierProvider(create: (_) => SalaryProvider()),
  ],
  child: MyApp(),
)
```

---

## ✅ Checklist MVC Compliance

- ✅ **Models** di `lib/models/` (bukan `lib/data/models/`)
- ✅ **Views** di `lib/ui/views/` (bukan `lib/ui/screens/`)
- ✅ **Controllers** di `lib/ui/controllers/` (bukan `lib/data/providers/`)
- ✅ **Services** di `lib/data/services/`
- ✅ **Constants** di `lib/core/constants/`
- ✅ **No API calls in Views**
- ✅ **No UI logic in Controllers**
- ✅ **All providers extend ChangeNotifier**
- ✅ **All providers registered in main.dart**

---

*Struktur ini 100% sesuai dengan FLUTTER_GUIDELINES.md*
*Last Updated: June 2, 2026*
