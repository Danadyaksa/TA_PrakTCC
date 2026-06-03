"use client";

import { useEffect, useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { ruleService } from "@/lib/services/ruleService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const [rules, setRules] = useState({
    tolerance_minutes: 15,
    absent_after_minutes: 60
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await ruleService.getRules();
      if (data) setRules(data);
    } catch (error) {
      console.error("Error fetching rules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ruleService.updateRules(rules);
      alert("Aturan berhasil diperbarui");
    } catch (error) {
      alert("Gagal memperbarui aturan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Pengaturan Aturan</h1>
        <p className="text-gray-500">Konfigurasi kebijakan presensi dan keterlambatan.</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Aturan Kehadiran</CardTitle>
            <CardDescription>
              Tentukan batasan toleransi waktu untuk karyawan saat melakukan check-in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-center">Memuat pengaturan...</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Toleransi Terlambat (Menit)</Label>
                  <Input 
                    type="number" 
                    value={rules.tolerance_minutes}
                    onChange={(e) => setRules({...rules, tolerance_minutes: parseInt(e.target.value)})}
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
                    onChange={(e) => setRules({...rules, absent_after_minutes: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-gray-500">
                    Karyawan dianggap Alpha (Tanpa Keterangan) jika belum check-in setelah batas ini.
                  </p>
                </div>

                <Button type="submit" className="w-full flex items-center gap-2" disabled={saving}>
                  <Save size={18} />
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
