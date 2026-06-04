"use client";

import { useEffect, useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { ruleService } from "@/lib/services/ruleService";
import { authService } from "@/lib/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, KeyRound, UserCog, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/toast-notification";

const TABS = [
  { id: "profile", label: "Profil Akun", icon: UserCog },
  { id: "rules",   label: "Aturan Kehadiran", icon: ShieldCheck },
];

export default function SettingsPage() {
  const { showToast, ToastComponent } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  // --- Profile state ---
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [profileSaving, setProfileSaving] = useState(false);

  // --- Password state ---
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [pwSaving, setPwSaving] = useState(false);

  // --- Rules state ---
  const [rules, setRules] = useState({ tolerance_minutes: 15, absent_after_minutes: 60 });
  const [rulesLoading, setRulesLoading] = useState(true);
  const [rulesSaving, setRulesSaving] = useState(false);

  useEffect(() => {
    // Load profile dari localStorage (sudah ada saat login)
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      setProfile({ name: u.name || "", email: u.email || "" });
    }
    // Load rules
    ruleService.getRules().then((data) => {
      if (data) setRules(data);
      setRulesLoading(false);
    }).catch(() => setRulesLoading(false));
  }, []);

  // Update nama
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const result = await authService.updateProfile({ name: profile.name });
      if (result.name) {
        // Update localStorage juga
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...stored, name: result.name }));
        setProfile((p) => ({ ...p, name: result.name }));
        showToast("Nama berhasil diperbarui", "success");
      } else {
        showToast(result.message || "Gagal memperbarui nama", "error");
      }
    } catch {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setProfileSaving(false);
    }
  };

  // Ganti password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) {
      showToast("Konfirmasi password tidak cocok", "error");
      return;
    }
    if (pwForm.new_password.length < 6) {
      showToast("Password baru minimal 6 karakter", "error");
      return;
    }
    setPwSaving(true);
    try {
      const result = await authService.changePassword(pwForm.current_password, pwForm.new_password);
      if (result.message === "Password berhasil diubah") {
        showToast("Password berhasil diubah", "success");
        setPwForm({ current_password: "", new_password: "", confirm_password: "" });
      } else {
        showToast(result.message || "Gagal mengubah password", "error");
      }
    } catch {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setPwSaving(false);
    }
  };

  // Simpan aturan
  const handleRulesSubmit = async (e) => {
    e.preventDefault();
    setRulesSaving(true);
    try {
      await ruleService.updateRules(rules);
      showToast("Aturan berhasil diperbarui", "success");
    } catch {
      showToast("Gagal memperbarui aturan", "error");
    } finally {
      setRulesSaving(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Pengaturan</h1>
        <p className="text-gray-500">Kelola akun dan konfigurasi sistem presensi.</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 mb-6 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl space-y-6">
        {/* ── Tab: Profil ── */}
        {activeTab === "profile" && (
          <>
            {/* Ganti nama */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Akun</CardTitle>
                <CardDescription>Perbarui nama tampilan akun HRD Anda.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nama</Label>
                    <Input
                      required
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profile.email} disabled className="bg-gray-50 text-gray-400" />
                    <p className="text-xs text-gray-400">Email tidak dapat diubah.</p>
                  </div>
                  <Button type="submit" disabled={profileSaving} className="flex items-center gap-2">
                    <Save size={16} />
                    {profileSaving ? "Menyimpan..." : "Simpan Nama"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Ganti password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound size={18} />
                  Ganti Password
                </CardTitle>
                <CardDescription>Pastikan password baru minimal 6 karakter.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Password Saat Ini</Label>
                    <Input
                      type="password"
                      required
                      value={pwForm.current_password}
                      onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password Baru</Label>
                    <Input
                      type="password"
                      required
                      minLength={6}
                      value={pwForm.new_password}
                      onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Konfirmasi Password Baru</Label>
                    <Input
                      type="password"
                      required
                      value={pwForm.confirm_password}
                      onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })}
                    />
                  </div>
                  <Button type="submit" disabled={pwSaving} className="flex items-center gap-2">
                    <KeyRound size={16} />
                    {pwSaving ? "Menyimpan..." : "Ubah Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── Tab: Aturan ── */}
        {activeTab === "rules" && (
          <Card>
            <CardHeader>
              <CardTitle>Aturan Kehadiran</CardTitle>
              <CardDescription>
                Tentukan batasan toleransi waktu untuk karyawan saat melakukan check-in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rulesLoading ? (
                <div className="py-10 text-center text-gray-400">Memuat pengaturan...</div>
              ) : (
                <form onSubmit={handleRulesSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Toleransi Terlambat (Menit)</Label>
                    <Input
                      type="number"
                      value={rules.tolerance_minutes}
                      onChange={(e) => setRules({ ...rules, tolerance_minutes: parseInt(e.target.value) })}
                    />
                    <p className="text-xs text-gray-500">
                      Karyawan dianggap hadir (tepat waktu) jika check-in sebelum batas ini.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Batas Alpha (Menit)</Label>
                    <Input
                      type="number"
                      value={rules.absent_after_minutes}
                      onChange={(e) => setRules({ ...rules, absent_after_minutes: parseInt(e.target.value) })}
                    />
                    <p className="text-xs text-gray-500">
                      Karyawan dianggap Alpha (Tanpa Keterangan) jika belum check-in setelah batas ini.
                    </p>
                  </div>
                  <Button type="submit" disabled={rulesSaving} className="flex items-center gap-2">
                    <Save size={16} />
                    {rulesSaving ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {ToastComponent}
    </SidebarLayout>
  );
}
