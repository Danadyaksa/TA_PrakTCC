"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { attendanceService } from "@/lib/services/attendanceService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CalendarDays, X, BarChart2 } from "lucide-react";

export default function AttendancePage() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  // Default: hari ini
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState(todayStr);

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const fetchData = async (date) => {
    setLoading(true);
    try {
      const data = await attendanceService.getHistory(date);
      setAttendances(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "hadir":     return "bg-green-100 text-green-700";
      case "terlambat": return "bg-amber-100 text-amber-700";
      case "alpha":     return "bg-red-100 text-red-700";
      case "izin":      return "bg-blue-100 text-blue-700";
      case "sakit":     return "bg-purple-100 text-purple-700";
      default:          return "bg-gray-100 text-gray-700";
    }
  };

  const displayDate = selectedDate
    ? format(new Date(selectedDate + "T00:00:00"), "EEEE, d MMMM yyyy", { locale: localeId })
    : "Semua Tanggal";

  return (
    <SidebarLayout>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Rekap Presensi</h1>
          <p className="text-gray-500">Lihat riwayat kehadiran seluruh karyawan.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tombol ke Rekap Bulanan */}
          <Link href="/dashboard/attendance/monthly">
            <Button variant="outline" className="gap-2 text-sm">
              <BarChart2 size={16} />
              Rekap Bulanan
            </Button>
          </Link>

          {/* Date picker */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <CalendarDays
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <Input
                type="date"
                value={selectedDate}
                max={todayStr}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-9 w-48 cursor-pointer"
              />
            </div>
            {selectedDate !== todayStr && (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setSelectedDate(todayStr)}
                title="Reset ke hari ini"
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Info tanggal aktif */}
      <p className="text-sm text-gray-500 mb-4">
        Menampilkan presensi:{" "}
        <span className="font-medium text-gray-700">{displayDate}</span>
        {" "}
        <span className="text-gray-400">({attendances.length} data)</span>
      </p>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>Nama Karyawan</TableHead>
              <TableHead>Waktu Masuk</TableHead>
              <TableHead>Waktu Keluar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Keterangan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : attendances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                  Tidak ada data presensi untuk tanggal ini.
                </TableCell>
              </TableRow>
            ) : (
              attendances.map((att) => (
                <TableRow key={att.id}>
                  <TableCell className="font-medium">{att.user_name}</TableCell>
                  <TableCell>
                    {att.check_in
                      ? format(new Date(att.check_in), "HH:mm")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {att.check_out
                      ? format(new Date(att.check_out), "HH:mm")
                      : <span className="text-gray-400 text-xs">Belum checkout</span>}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-bold uppercase",
                      getStatusColor(att.status)
                    )}>
                      {att.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {att.late_minutes > 0
                      ? `Terlambat ${att.late_minutes} menit`
                      : "-"}
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
