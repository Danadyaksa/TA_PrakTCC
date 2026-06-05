"use client";

import { useEffect, useState, useCallback } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { salaryService } from "@/lib/services/salaryService";
import { departmentService } from "@/lib/services/departmentService";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Save } from "lucide-react";
import { useToast } from "@/components/ui/toast-notification";

export default function SalariesPage() {
  const { showToast, ToastComponent } = useToast();
  const [departments, setDepartments] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState(null);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());
  const [selectedDept, setSelectedDept] = useState("all");

  // Local inputs state for editing allowances and deductions
  const [inputs, setInputs] = useState({}); // { [user_id]: { allowances: string, deductions: string } }

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

  // Fetch departments list
  useEffect(() => {
    departmentService.getDepartments()
      .then(setDepartments)
      .catch((err) => console.error("Error fetching departments:", err));
  }, []);

  // Fetch salaries matching filters
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters = { month, year };
      if (selectedDept && selectedDept !== "all") {
        filters.department_id = selectedDept;
      }
      const data = await salaryService.getSalaries(filters);
      setSalaries(data);

      // Initialize inputs state with retrieved values
      const initialInputs = {};
      for (const item of data) {
        initialInputs[item.user_id] = {
          allowances: item.allowances.toString(),
          deductions: item.deductions.toString()
        };
      }
      setInputs(initialInputs);
    } catch (error) {
      console.error("Error fetching salaries:", error);
      showToast("Gagal mengambil data rekap gaji", "error");
    } finally {
      setLoading(false);
    }
  }, [month, year, selectedDept, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle local change in inputs
  const handleInputChange = (userId, field, value) => {
    setInputs((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value
      }
    }));
  };

  // Handle saving individual employee salary
  const handleSave = async (item) => {
    const userInputs = inputs[item.user_id] || { allowances: "0", deductions: "0" };
    const payload = {
      user_id: item.user_id,
      month,
      year,
      basic_salary: item.basic_salary,
      allowances: parseFloat(userInputs.allowances || 0),
      deductions: parseFloat(userInputs.deductions || 0)
    };

    setSavingUserId(item.user_id);
    try {
      await salaryService.createSalary(payload);
      showToast(`Berhasil menyimpan gaji untuk ${item.user_name}`, "success");
      // Update the saved status locally
      setSalaries((prev) =>
        prev.map((s) =>
          s.user_id === item.user_id
            ? {
                ...s,
                allowances: payload.allowances,
                deductions: payload.deductions,
                net_salary: s.basic_salary + payload.allowances - payload.deductions,
                is_saved: true
              }
            : s
        )
      );
    } catch (error) {
      console.error("Error saving salary:", error);
      showToast("Gagal menyimpan data gaji", "error");
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <SidebarLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Rekap Gaji</h1>
          <p className="text-gray-500">Kelola, input tunjangan, potongan, serta hitung gaji bulanan karyawan.</p>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border shadow-sm">
          <div className="w-[140px]">
            <Select 
              value={month.toString()}
              onValueChange={(v) => setMonth(parseInt(v))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, i) => (
                  <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-[100px]">
            <Select 
              value={year.toString()}
              onValueChange={(v) => setYear(parseInt(v))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => year - 2 + i).map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-[180px]">
            <Select 
              value={selectedDept}
              onValueChange={setSelectedDept}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Departemen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Departemen</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="font-semibold text-xs">Karyawan</TableHead>
              <TableHead className="font-semibold text-xs">Departemen</TableHead>
              <TableHead className="font-semibold text-xs">Kehadiran (Bulan Ini)</TableHead>
              <TableHead className="font-semibold text-xs">Gaji Pokok</TableHead>
              <TableHead className="font-semibold text-xs w-[130px]">Tunjangan (Rp)</TableHead>
              <TableHead className="font-semibold text-xs w-[130px]">Potongan (Rp)</TableHead>
              <TableHead className="font-semibold text-xs text-right">Total Bersih</TableHead>
              <TableHead className="font-semibold text-xs text-center w-[120px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="text-gray-500 font-medium">Memuat rekap gaji karyawan...</div>
                </TableCell>
              </TableRow>
            ) : salaries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                  Tidak ditemukan karyawan pada kriteria filter ini.
                </TableCell>
              </TableRow>
            ) : (
              salaries.map((item) => {
                const userInputs = inputs[item.user_id] || { allowances: "0", deductions: "0" };
                const rawAllowances = parseFloat(userInputs.allowances || 0);
                const rawDeductions = parseFloat(userInputs.deductions || 0);
                const computedNetSalary = item.basic_salary + rawAllowances - rawDeductions;

                return (
                  <TableRow key={item.user_id} className="hover:bg-gray-50/50">
                    <TableCell className="py-4">
                      <div>
                        <p className="font-semibold text-gray-800">{item.user_name}</p>
                        <p className="text-xs text-gray-400">{item.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-medium text-gray-600">
                      {item.department_name}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                          {item.attendance_summary.hadir} Hadir
                        </span>
                        {item.attendance_summary.terlambat > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            {item.attendance_summary.terlambat} Telat
                          </span>
                        )}
                        {item.attendance_summary.alpha > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            {item.attendance_summary.alpha} Alpha
                          </span>
                        )}
                        {item.attendance_summary.izin_sakit > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {item.attendance_summary.izin_sakit} Izin
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-medium text-gray-700">
                      {formatCurrency(item.basic_salary)}
                    </TableCell>
                    <TableCell className="py-4">
                      <Input
                        type="number"
                        className="h-8 text-sm"
                        value={userInputs.allowances}
                        onChange={(e) => handleInputChange(item.user_id, "allowances", e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="py-4">
                      <Input
                        type="number"
                        className="h-8 text-sm"
                        value={userInputs.deductions}
                        onChange={(e) => handleInputChange(item.user_id, "deductions", e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="py-4 text-right font-bold text-primary text-base">
                      {formatCurrency(computedNetSalary)}
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <Button
                        size="sm"
                        className="h-8 gap-1 w-24"
                        onClick={() => handleSave(item)}
                        disabled={savingUserId === item.user_id}
                        variant={item.is_saved ? "outline" : "default"}
                      >
                        {item.is_saved ? (
                          <>
                            <Check size={14} className="text-green-600 font-bold" />
                            Saved
                          </>
                        ) : (
                          <>
                            <Save size={14} />
                            Simpan
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      {ToastComponent}
    </SidebarLayout>
  );
}
