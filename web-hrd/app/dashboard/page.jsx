"use client";

import SidebarLayout from "@/components/layout/SidebarLayout";
import { useEffect, useState } from "react";
import { 
  Users, 
  ClipboardCheck, 
  FileText, 
  AlertCircle,
  Clock,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    presentToday: 0,
    onLeave: 0,
    lateToday: 0
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { userService },
        { attendanceService },
        { leaveService }
      ] = await Promise.all([
        import("@/lib/services/userService"),
        import("@/lib/services/attendanceService"),
        import("@/lib/services/leaveService")
      ]);

      const [users, attendances, leaves] = await Promise.all([
        userService.getUsers(),
        attendanceService.getHistory(),
        leaveService.getLeaves()
      ]);

      const today = new Date().toISOString().split('T')[0];
      const employees = users.filter((u) => u.role === "karyawan");
      const todayAttendances = attendances.filter((a) => a.check_in && a.check_in.startsWith(today));
      
      setStats({
        totalUsers: employees.length,
        presentToday: todayAttendances.length,
        onLeave: leaves.filter((l) => l.status === "approved" && today >= l.start_date.split('T')[0] && today <= l.end_date.split('T')[0]).length,
        lateToday: todayAttendances.filter((a) => a.status === "terlambat").length
      });

      setRecentAttendance(attendances.slice(0, 5));
      setPendingLeaves(leaves.filter((l) => l.status === "pending").slice(0, 5));
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard HRD</h1>
        <p className="text-gray-500">Ringkasan aktivitas presensi hari ini.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Karyawan" 
          value={stats.totalUsers} 
          icon={<Users className="text-blue-600" />} 
          bgColor="bg-blue-50"
          loading={loading}
        />
        <StatCard 
          title="Hadir Hari Ini" 
          value={stats.presentToday} 
          icon={<ClipboardCheck className="text-green-600" />} 
          bgColor="bg-green-50"
          loading={loading}
        />
        <StatCard 
          title="Izin / Sakit" 
          value={stats.onLeave} 
          icon={<FileText className="text-amber-600" />} 
          bgColor="bg-amber-50"
          loading={loading}
        />
        <StatCard 
          title="Terlambat" 
          value={stats.lateToday} 
          icon={<AlertCircle className="text-red-600" />} 
          bgColor="bg-red-50"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <Clock size={20} className="mr-2 text-gray-400" />
            Presensi Terbaru
          </h2>
          <div className="space-y-4">
            {loading ? (
              <div className="py-10 text-center text-gray-500">Memuat data...</div>
            ) : recentAttendance.length === 0 ? (
              <div className="py-10 text-center text-gray-500 border-2 border-dashed rounded-lg">
                Belum ada aktivitas masuk hari ini.
              </div>
            ) : (
            recentAttendance.map((att) => (
                <div key={att.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border">
                  <div>
                    <p className="font-medium text-gray-900">{att.user_name}</p>
                    <p className="text-xs text-gray-500">
                      {att.check_in ? format(new Date(att.check_in), "HH:mm") : "-"} • {att.status}
                    </p>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                    att.status === "hadir" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {att.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <CheckCircle2 size={20} className="mr-2 text-gray-400" />
            Pengajuan Cuti Pending
          </h2>
          <div className="space-y-4">
            {loading ? (
              <div className="py-10 text-center text-gray-500">Memuat data...</div>
            ) : pendingLeaves.length === 0 ? (
              <div className="py-10 text-center text-gray-500 border-2 border-dashed rounded-lg">
                Semua pengajuan sudah diproses.
              </div>
            ) : (
            pendingLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border">
                  <div>
                    <p className="font-medium text-gray-900">{leave.user_name}</p>
                    <p className="text-xs text-gray-500">
                      {leave.type} • {format(new Date(leave.start_date), "dd MMM")}
                    </p>
                  </div>
                  <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase">
                    Pending
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

function StatCard({ title, value, icon, bgColor, loading }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center">
      <div className={cn("p-3 rounded-lg mr-4", bgColor)}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        {loading ? (
          <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );
}
