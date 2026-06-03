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
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Check, X } from "lucide-react";

export default function LeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await leaveService.getLeaves();
      setLeaves(data);
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
    } catch (error) {
      alert("Gagal update status");
    }
  };

  return (
    <SidebarLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Pengajuan Cuti & Izin</h1>
        <p className="text-gray-500">Kelola dan proses pengajuan cuti atau izin karyawan.</p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>Karyawan</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Alasan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">Memuat data...</TableCell>
              </TableRow>
            ) : leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">Belum ada pengajuan.</TableCell>
              </TableRow>
            ) : (
              leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">{leave.user_name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold uppercase">
                      {leave.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(leave.start_date), "dd MMM")} - {format(new Date(leave.end_date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-gray-500" title={leave.reason}>
                    {leave.reason}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-bold uppercase",
                      leave.status === "pending" ? "bg-amber-100 text-amber-700" :
                      leave.status === "approved" ? "bg-green-100 text-green-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {leave.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {leave.status === "pending" && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleUpdateStatus(leave.id, "approved")}
                        >
                          <Check size={18} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
    </SidebarLayout>
  );
}
