"use client";

import { useEffect, useState, useCallback } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { attendanceService } from "@/lib/services/attendanceService";
import { userService } from "@/lib/services/userService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Users,
  CalendarDays,
  TrendingDown,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";

const MONTHS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

const STATUS_STYLE = {
  hadir:     "bg-green-100 text-green-700",
  terlambat: "bg-amber-100 text-amber-700",
  alpha:     "bg-red-100 text-red-700",
  izin:      "bg-blue-100 text-blue-700",
  sakit:     "bg-purple-100 text-purple-700",
  upcoming:  "bg-gray-100 text-gray-400",
  libur:     "bg-gray-200 text-gray-600",
};

export default function MonthlyAttendancePage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [daySortConfig, setDaySortConfig] = useState({ key: null, direction: "asc" });

  const handleDaySort = (key) => {
    setDaySortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortedDays = (days) => {
    if (!daySortConfig.key) return days;
    return [...days].sort((a, b) => {
      let valA = a[daySortConfig.key];
      let valB = b[daySortConfig.key];
      if (valA === undefined || valA === null) valA = "";
      if (valB === undefined || valB === null) valB = "";
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return daySortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return daySortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };
  const [year, setYear]   = useState(now.getFullYear());
  const [userId, setUserId] = useState("");
  const [users, setUsers]   = useState([]);
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({}); // { [user_id]: bool }

  // Fetch user list for filter dropdown
  useEffect(() => {
    userService.getUsers().then(setUsers).catch(console.error);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await attendanceService.getMonthlySummary({
        month,
        year,
        userId: userId || undefined,
      });
      setData(result);
      setExpanded({});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [month, year, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleExpand = (uid) =>
    setExpanded((prev) => ({ ...prev, [uid]: !prev[uid] }));

  const employees = data?.employees ?? [];

  // Year options: current year and 2 years back
  const yearOptions = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

  return (
    <SidebarLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Rekap Bulanan</h1>
          <p className="text-gray-500">
            Ringkasan alpha, izin, terlambat, dan hadir per karyawan.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Bulan */}
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {MONTHS.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          {/* Tahun */}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {/* Filter karyawan */}
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary min-w-[180px]"
          >
            <option value="">Semua Karyawan</option>
            {users
              .filter((u) => u.role === "karyawan")
              .map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
          </select>
        </div>
      </div>

      {/* Periode label */}
      <p className="text-sm text-gray-500 mb-4">
        Periode:{" "}
        <span className="font-semibold text-gray-700">
          {MONTHS[month - 1]} {year}
        </span>
        {" "}·{" "}
        <span className="text-gray-400">{employees.length} karyawan</span>
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          Memuat data...
        </div>
      ) : employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
          <Users size={40} className="opacity-30" />
          <p>Tidak ada data untuk periode ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {employees.map((emp) => (
            <div
              key={emp.user_id}
              className="bg-white rounded-xl border shadow-sm overflow-hidden"
            >
              {/* Summary row — clickable to expand */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(emp.user_id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {emp.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{emp.user_name}</p>
                    <p className="text-xs text-gray-400">{emp.department_name ?? "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap justify-end">
                  <StatBadge
                    label="Hadir"
                    value={emp.summary.hadir}
                    className="bg-green-100 text-green-700"
                  />
                  <StatBadge
                    label="Terlambat"
                    value={emp.summary.terlambat}
                    className="bg-amber-100 text-amber-700"
                  />
                  <StatBadge
                    label="Alpha"
                    value={emp.summary.alpha}
                    className={cn(
                      "bg-red-100 text-red-700",
                      emp.summary.alpha > 0 && "ring-1 ring-red-300"
                    )}
                  />
                  <StatBadge
                    label="Izin/Sakit"
                    value={emp.summary.izin_sakit}
                    className="bg-blue-100 text-blue-700"
                  />
                  {emp.summary.libur > 0 && (
                    <StatBadge
                      label="Libur"
                      value={emp.summary.libur}
                      className="bg-gray-100 text-gray-600"
                    />
                  )}
                  <span className="text-xs text-gray-400 ml-2">
                    {emp.summary.total_work_days} hari kerja
                  </span>
                  {expanded[emp.user_id] ? (
                    <ChevronUp size={18} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </div>
              </div>

              {/* Detail table — expandable */}
              {expanded[emp.user_id] && (
                <div className="border-t">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/70">
                        <TableHead className="text-xs cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleDaySort("date")}>Tanggal</TableHead>
                        <TableHead className="text-xs cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleDaySort("shift_start")}>Shift</TableHead>
                        <TableHead className="text-xs cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleDaySort("check_in")}>Check In</TableHead>
                        <TableHead className="text-xs cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleDaySort("check_out")}>Check Out</TableHead>
                        <TableHead className="text-xs cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleDaySort("status")}>Status</TableHead>
                        <TableHead className="text-xs cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleDaySort("late_minutes")}>Keterangan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getSortedDays(emp.days).map((day) => (
                        <TableRow
                          key={day.date}
                          className={cn(
                            day.status === "alpha" && "bg-red-50/40",
                            day.status === "libur" && "bg-gray-50/30 text-gray-400",
                            day.status === "upcoming" && "opacity-50"
                          )}
                        >
                          <TableCell className="text-sm font-medium">
                            {format(parseISO(day.date), "EEE, d MMM", { locale: localeId })}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {day.shift_start?.slice(0, 5)}–{day.shift_end?.slice(0, 5)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {day.check_in
                              ? format(new Date(day.check_in), "HH:mm")
                              : <span className="text-gray-300">—</span>}
                          </TableCell>
                          <TableCell className="text-sm">
                            {day.check_out
                              ? format(new Date(day.check_out), "HH:mm")
                              : <span className="text-gray-300">—</span>}
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded text-xs font-bold uppercase",
                                STATUS_STYLE[day.status] ?? "bg-gray-100 text-gray-500"
                              )}
                            >
                              {day.status === "upcoming" ? "Belum" : day.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">
                            {day.late_minutes > 0
                              ? `Telat ${day.late_minutes} mnt`
                              : day.status === "alpha"
                              ? "Tidak hadir"
                              : day.status === "libur"
                              ? (day.holiday_name || "Hari Libur Nasional")
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </SidebarLayout>
  );
}

function StatBadge({ label, value, className }) {
  return (
    <div className={cn("flex flex-col items-center px-3 py-1 rounded-lg text-xs font-bold min-w-[52px]", className)}>
      <span className="text-base leading-tight">{value}</span>
      <span className="font-normal opacity-80">{label}</span>
    </div>
  );
}
