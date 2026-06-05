"use client";

import { useEffect, useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { leaveService } from "@/lib/services/leaveService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Check, X } from "lucide-react";
import { useToast } from "@/components/ui/toast-notification";

const MONTHS = [
  { value: "1",  label: "Januari" },
  { value: "2",  label: "Februari" },
  { value: "3",  label: "Maret" },
  { value: "4",  label: "April" },
  { value: "5",  label: "Mei" },
  { value: "6",  label: "Juni" },
  { value: "7",  label: "Juli" },
  { value: "8",  label: "Agustus" },
  { value: "9",  label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

export default function LeavesPage() {
  const { showToast, ToastComponent } = useToast();
  const [leaves, setLeaves] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedLeaves = [...leaves].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];
    if (valA === undefined || valA === null) valA = "";
    if (valB === undefined || valB === null) valB = "";
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
  const [loading, setLoading] = useState(true);

  // Filter state — default bulan & tahun sekarang
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await leaveService.getLeaves({
        month: selectedMonth,
        year: selectedYear,
      });
      setLeaves(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await leaveService.updateStatus(id, status);
      fetchData();
      showToast(
        status === "approved" ? "Pengajuan disetujui" : "Pengajuan ditolak",
        "success"
      );
    } catch (error) {
      showToast("Gagal update status", "error");
    }
  };

  const periodLabel = `${MONTHS.find((m) => m.value === selectedMonth)?.label} ${selectedYear}`;

  return (
    <SidebarLayout>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Pengajuan Cuti & Izin</h1>
          <p className="text-gray-500">Kelola dan proses pengajuan cuti atau izin karyawan.</p>
        </div>

        {/* Filter bulan & tahun */}
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Info periode */}
      <p className="text-sm text-gray-500 mb-4">
        Menampilkan pengajuan:{" "}
        <span className="font-medium text-gray-700">{periodLabel}</span>
        {" "}
        <span className="text-gray-400">({leaves.length} data)</span>
      </p>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleSort("user_name")}>Karyawan</TableHead>
              <TableHead className="cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleSort("type")}>Tipe</TableHead>
              <TableHead className="cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleSort("start_date")}>Tanggal</TableHead>
              <TableHead className="cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleSort("reason")}>Alasan</TableHead>
              <TableHead className="cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleSort("status")}>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                  Tidak ada pengajuan pada {periodLabel}.
                </TableCell>
              </TableRow>
            ) : (
              sortedLeaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">{leave.user_name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold uppercase">
                      {leave.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(leave.start_date), "dd MMM")} –{" "}
                    {format(new Date(leave.end_date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell
                    className="max-w-xs truncate text-gray-500"
                    title={leave.reason}
                  >
                    {leave.reason}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-xs font-bold uppercase",
                        leave.status === "pending"  ? "bg-amber-100 text-amber-700" :
                        leave.status === "approved" ? "bg-green-100 text-green-700" :
                                                      "bg-red-100 text-red-700"
                      )}
                    >
                      {leave.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {leave.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Setujui"
                          onClick={() => handleUpdateStatus(leave.id, "approved")}
                        >
                          <Check size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Tolak"
                          onClick={() => handleUpdateStatus(leave.id, "rejected")}
                        >
                          <X size={18} />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {ToastComponent}
    </SidebarLayout>
  );
}
