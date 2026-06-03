"use client";

import { useEffect, useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { salaryService } from "@/lib/services/salaryService";
import { userService } from "@/lib/services/userService";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BadgeDollarSign, Plus } from "lucide-react";

export default function SalariesPage() {
  const [salaries, setSalaries] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    user_id: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basic_salary: "",
    allowances: "0",
    deductions: "0"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salaryData, userData] = await Promise.all([
        salaryService.getSalaries(),
        userService.getUsers()
      ]);
      setSalaries(salaryData);
      setUsers(userData.filter((u) => u.role === "karyawan"));
    } catch (error) {
      console.error("Error fetching salaries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await salaryService.createSalary(formData);
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      alert("Gagal menyimpan gaji");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Rekap Gaji</h1>
          <p className="text-gray-500">Kelola dan input gaji bulanan karyawan.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={18} />
              Input Gaji
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Input Gaji Karyawan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Karyawan</Label>
                <Select onValueChange={(v) => setFormData({...formData, user_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Karyawan" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bulan</Label>
                  <Select 
                    defaultValue={formData.month.toString()}
                    onValueChange={(v) => setFormData({...formData, month: parseInt(v)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m, i) => (
                        <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tahun</Label>
                  <Input 
                    type="number" 
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Gaji Pokok</Label>
                <Input 
                  type="number" 
                  required
                  value={formData.basic_salary}
                  onChange={(e) => setFormData({...formData, basic_salary: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tunjangan</Label>
                  <Input 
                    type="number" 
                    value={formData.allowances}
                    onChange={(e) => setFormData({...formData, allowances: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Potongan</Label>
                  <Input 
                    type="number" 
                    value={formData.deductions}
                    onChange={(e) => setFormData({...formData, deductions: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full">Simpan Gaji</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>Karyawan</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead>Gaji Pokok</TableHead>
              <TableHead>Tunjangan</TableHead>
              <TableHead>Potongan</TableHead>
              <TableHead className="text-right font-bold">Total Bersih</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">Memuat data...</TableCell>
              </TableRow>
            ) : salaries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">Belum ada data gaji.</TableCell>
              </TableRow>
            ) : (
              salaries.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.user_name}</TableCell>
                  <TableCell>{months[s.month - 1]} {s.year}</TableCell>
                  <TableCell>{formatCurrency(s.basic_salary)}</TableCell>
                  <TableCell className="text-green-600">+{formatCurrency(s.allowances)}</TableCell>
                  <TableCell className="text-red-600">-{formatCurrency(s.deductions)}</TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {formatCurrency(s.net_salary)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </SidebarLayout>
  );
}
