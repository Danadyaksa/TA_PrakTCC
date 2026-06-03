"use client";

import { useEffect, useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { scheduleService } from "@/lib/services/scheduleService";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CalendarDays, Plus, Trash2, Pencil, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const days = [
  { value: "0", label: "Minggu" },
  { value: "1", label: "Senin" },
  { value: "2", label: "Selasa" },
  { value: "3", label: "Rabu" },
  { value: "4", label: "Kamis" },
  { value: "5", label: "Jumat" },
  { value: "6", label: "Sabtu" },
];

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    user_id: "",
    day_of_week: "1",
    shift_start: "08:00",
    shift_end: "17:00"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schedulesData, usersData] = await Promise.all([
        scheduleService.getSchedules(),
        userService.getUsers()
      ]);
      setSchedules(schedulesData);
      setUsers(usersData.filter((u) => u.role === 'karyawan'));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ user_id: "", day_of_week: "1", shift_start: "08:00", shift_end: "17:00" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (s) => {
    setEditingId(s.id);
    setFormData({
      user_id: s.user_id.toString(),
      day_of_week: s.day_of_week.toString(),
      shift_start: s.shift_start.substring(0, 5),
      shift_end: s.shift_end.substring(0, 5)
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await scheduleService.updateSchedule(editingId, formData);
      } else {
        await scheduleService.createSchedule(formData);
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      alert("Gagal menyimpan jadwal");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Hapus jadwal ini?")) {
      try {
        await scheduleService.deleteSchedule(id);
        fetchData();
      } catch (error) {
        alert("Gagal menghapus");
      }
    }
  };

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Jadwal Kerja</h1>
          <p className="text-gray-500">Atur shift masuk dan pulang untuk setiap karyawan.</p>
        </div>

        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus size={18} />
          Tambah Jadwal
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Jadwal" : "Tambah Jadwal Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Pilih Karyawan</Label>
                <Select 
                  disabled={!!editingId}
                  value={formData.user_id} 
                  onValueChange={(v) => setFormData({...formData, user_id: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Karyawan" />
                  </SelectTrigger>
                  <SelectContent>
                  {users.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Hari</Label>
                <Select 
                  value={formData.day_of_week} 
                  onValueChange={(v) => setFormData({...formData, day_of_week: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Hari" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jam Masuk</Label>
                  <Input 
                    type="time" 
                    required 
                    value={formData.shift_start}
                    onChange={(e) => setFormData({...formData, shift_start: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jam Pulang</Label>
                  <Input 
                    type="time" 
                    required 
                    value={formData.shift_end}
                    onChange={(e) => setFormData({...formData, shift_end: e.target.value})}
                  />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full">
                  {editingId ? "Simpan Perubahan" : "Simpan Jadwal"}
                </Button>
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
              <TableHead>Hari</TableHead>
              <TableHead>Jam Kerja</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">Memuat data...</TableCell>
              </TableRow>
            ) : schedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-gray-500">Belum ada jadwal kerja.</TableCell>
              </TableRow>
            ) : (
          schedules.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.user_name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                      {days.find(d => d.value === s.day_of_week.toString())?.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Clock size={14} className="mr-2 text-blue-500" />
                      {s.shift_start.substring(0, 5)} - {s.shift_end.substring(0, 5)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
                      onClick={() => handleOpenEdit(s)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50" 
                      onClick={() => handleDelete(s.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
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
