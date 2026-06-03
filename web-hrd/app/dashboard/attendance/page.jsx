"use client";

import { useEffect, useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { attendanceService } from "@/lib/services/attendanceService";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function AttendancePage() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await attendanceService.getHistory();
      setAttendances(data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "hadir": return "bg-green-100 text-green-700";
      case "terlambat": return "bg-amber-100 text-amber-700";
      case "alpha": return "bg-red-100 text-red-700";
      case "izin": return "bg-blue-100 text-blue-700";
      case "sakit": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <SidebarLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Rekap Presensi</h1>
        <p className="text-gray-500">Lihat riwayat kehadiran seluruh karyawan.</p>
      </div>

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
                <TableCell colSpan={5} className="text-center py-10">Memuat data...</TableCell>
              </TableRow>
            ) : attendances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-500">Belum ada data presensi.</TableCell>
              </TableRow>
            ) : (
              attendances.map((att) => (
                <TableRow key={att.id}>
                  <TableCell className="font-medium">{att.user_name}</TableCell>
                  <TableCell>
                    {att.check_in ? format(new Date(att.check_in), "dd MMM yyyy HH:mm") : "-"}
                  </TableCell>
                  <TableCell>
                    {att.check_out ? format(new Date(att.check_out), "dd MMM yyyy HH:mm") : "-"}
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
                    {att.late_minutes > 0 ? `Terlambat ${att.late_minutes} menit` : "-"}
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
