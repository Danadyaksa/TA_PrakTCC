import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:mobile_karyawan/ui/controllers/auth_provider.dart';
import 'package:mobile_karyawan/core/constants/app_colors.dart';
import 'package:mobile_karyawan/core/constants/app_constants.dart';
import 'package:mobile_karyawan/data/services/auth_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _oldPasswordCtrl = TextEditingController();
  final _newPasswordCtrl = TextEditingController();
  final _confirmPasswordCtrl = TextEditingController();

  bool _obscureOld = true;
  bool _obscureNew = true;
  bool _obscureConfirm = true;
  bool _isSaving = false;

  @override
  void dispose() {
    _oldPasswordCtrl.dispose();
    _newPasswordCtrl.dispose();
    _confirmPasswordCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleChangePassword() async {
    final oldPw = _oldPasswordCtrl.text.trim();
    final newPw = _newPasswordCtrl.text.trim();
    final confirmPw = _confirmPasswordCtrl.text.trim();

    if (oldPw.isEmpty || newPw.isEmpty || confirmPw.isEmpty) {
      _showSnack('Semua field harus diisi', isError: true);
      return;
    }
    if (newPw.length < 6) {
      _showSnack('Password baru minimal 6 karakter', isError: true);
      return;
    }
    if (newPw != confirmPw) {
      _showSnack('Konfirmasi password tidak cocok', isError: true);
      return;
    }

    setState(() => _isSaving = true);

    try {
      final token = await AuthService().getToken();
      final response = await http.put(
        Uri.parse('${AppConstants.baseUrl}/auth/change-password'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'current_password': oldPw,
          'new_password': newPw,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        _oldPasswordCtrl.clear();
        _newPasswordCtrl.clear();
        _confirmPasswordCtrl.clear();
        _showSnack('Password berhasil diubah');
      } else {
        _showSnack(data['message'] ?? 'Gagal mengubah password', isError: true);
      }
    } catch (e) {
      _showSnack('Terjadi kesalahan koneksi', isError: true);
    } finally {
      setState(() => _isSaving = false);
    }
  }

  void _showSnack(String msg, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: isError ? AppColors.danger : AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Profil Saya', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Avatar & info
            Center(
              child: Column(
                children: [
                  const CircleAvatar(
                    radius: 50,
                    backgroundColor: AppColors.primary,
                    child: Icon(Icons.person, size: 50, color: Colors.white),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    user?.name ?? 'Nama Karyawan',
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    user?.email ?? 'email@karyawan.com',
                    style: const TextStyle(color: AppColors.textSecondary),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            _buildInfoCard(icon: Icons.business_rounded, label: 'Departemen', value: user?.departmentName ?? '-'),
            const SizedBox(height: 12),
            _buildInfoCard(icon: Icons.badge_outlined, label: 'Role', value: user?.role.toUpperCase() ?? 'KARYAWAN'),

            const SizedBox(height: 32),

            // Ganti password section
            const Text(
              'Ganti Password',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            const Text(
              'Masukkan password lama dan password baru.',
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 16),

            _buildPasswordField(
              controller: _oldPasswordCtrl,
              label: 'Password Lama',
              obscure: _obscureOld,
              onToggle: () => setState(() => _obscureOld = !_obscureOld),
            ),
            const SizedBox(height: 12),
            _buildPasswordField(
              controller: _newPasswordCtrl,
              label: 'Password Baru',
              obscure: _obscureNew,
              onToggle: () => setState(() => _obscureNew = !_obscureNew),
            ),
            const SizedBox(height: 12),
            _buildPasswordField(
              controller: _confirmPasswordCtrl,
              label: 'Konfirmasi Password Baru',
              obscure: _obscureConfirm,
              onToggle: () => setState(() => _obscureConfirm = !_obscureConfirm),
            ),
            const SizedBox(height: 20),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _isSaving ? null : _handleChangePassword,
                icon: _isSaving
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.lock_reset),
                label: Text(_isSaving ? 'Menyimpan...' : 'Ubah Password'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),

            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => context.read<AuthProvider>().logout(),
                icon: const Icon(Icons.logout),
                label: const Text('LOGOUT'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.danger,
                  side: const BorderSide(color: AppColors.danger),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPasswordField({
    required TextEditingController controller,
    required String label,
    required bool obscure,
    required VoidCallback onToggle,
  }) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: const Icon(Icons.lock_outline),
        suffixIcon: IconButton(
          icon: Icon(
            obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
            color: AppColors.textSecondary,
          ),
          onPressed: onToggle,
        ),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        filled: true,
        fillColor: Colors.white,
      ),
    );
  }

  Widget _buildInfoCard({required IconData icon, required String label, required String value}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primary),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
              Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }
}
