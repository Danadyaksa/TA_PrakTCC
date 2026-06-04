"use client";

import { useEffect, useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { scheduleService } from "@/lib/services/scheduleService";
import { departmentService } from "@/lib/services/departmentService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast-notification";

const DAYS = [
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
];

export default function SchedulesPage() {
  const { showToast, ToastComponent } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", description: "", onConfirm: () => {} });

  // Edit dialog
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [editData, setEditData] = useState({ shift_start: "", shift_end: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedulesData, deptsData] = await Promise.all([
        scheduleService.getSchedules(),
        departmentService.getDepartments(),
      ]);
      setSchedules(schedulesData);
      setDepartments(deptsData);
      // Auto-pilih departemen pertama
      if (deptsData.length > 0 && !selectedDeptId) {
        setSelectedDeptId(deptsData[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedDept = departments.find((d) => d.id === selectedDeptId);
  const hasSchedule = schedules.some((s) => s.department_id === selectedDeptId);
  const slots = schedules
    .filter((s) => s.department_id === selectedDeptId)
    .sort((a, b) => a.day_of_week - b.day_of_week);

  const handleInitDept = async () => {
    try {
      await scheduleService.initDepartmentSchedule(selectedDeptId);
      fetchData();
    } catch {
      showToast("Gagal membuat jadwal", "error");
    }
  };

  const handleDeleteDept = () => {
    setConfirmDialog({
      open: true,
      title: "Hapus Jadwal",
      description: `Semua jadwal departemen "${selectedDept?.name}" akan dihapus.`,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        try {
          await scheduleService.deleteDepartmentSchedule(selectedDeptId);
          fetchData();
        } catch {
          showToast("Gagal menghapus jadwal", "error");
        }
      },
    });
  };

  const handleEditOpen = (slot) => {
    setEditingSlot(slot);
    setEditData({
      shift_start: slot.shift_start.substring(0, 5),
      shift_end: slot.shift_end.substring(0, 5),
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await scheduleService.updateSchedule(editingSlot.id, editData);
      setIsEditOpen(false);
      fetchData();
    } catch {
      showToast("Gagal menyimpan perubahan", "error");
    }
  };

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Jadwal Kerja</h1>
          <p className="text-gray-500">Atur jam kerja per departemen. Berlaku Senin – Jumat.</p>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Jam Kerja —{" "}
              {DAYS.find((d) => d.value === editingSlot?.day_of_week)?.label}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jam Masuk</Label>
                <Input
                  type="time"
                  required
                  value={editData.shift_start}
                  onChange={(e) => setEditData({ ...editData, shift_start: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Jam Pulang</Label>
                <Input
                  type="time"
                  required
                  value={editData.shift_end}
                  onChange={(e) => setEditData({ ...editData, shift_end: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Memuat data...</div>
      ) : departments.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          Belum ada departemen. Tambahkan departemen terlebih dahulu.
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {/* Dropdown + action */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
            <Select
              value={selectedDeptId?.toString()}
              onValueChange={(v) => setSelectedDeptId(Number(v))}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Pilih Departemen" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              {!hasSchedule ? (
                <Button size="sm" onClick={handleInitDept} className="flex items-center gap-1">
                  <Plus size={14} />
                  Buat Jadwal Default
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleDeleteDept}
                >
                  <Trash2 size={14} className="mr-1" />
                  Hapus Jadwal
                </Button>
              )}
            </div>
          </div>

          {/* Tabel hari */}
          {!hasSchedule ? (
            <div className="px-6 py-12 text-center text-sm text-gray-400">
              Departemen <span className="font-medium text-gray-600">{selectedDept?.name}</span> belum
              punya jadwal. Klik <span className="font-medium">"Buat Jadwal Default"</span> untuk
              membuat jadwal Senin–Jumat (08:00 – 16:00).
            </div>
          ) : (
            <div className="divide-y">
              {DAYS.map((day) => {
                const slot = slots.find((s) => s.day_of_week === day.value);
                return (
                  <div key={day.value} className="flex items-center px-6 py-4">
                    <span className="w-28 text-sm font-medium text-gray-700">{day.label}</span>
                    {slot ? (
                      <>
                        <div className="flex flex-1 items-center gap-2 text-sm text-gray-600">
                          <Clock size={14} className="text-blue-400" />
                          <span className="font-mono">{slot.shift_start.substring(0, 5)}</span>
                          <span className="text-gray-300">–</span>
                          <span className="font-mono">{slot.shift_end.substring(0, 5)}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => handleEditOpen(slot)}
                        >
                          <Pencil size={15} />
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant="destructive"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ open: false, title: "", description: "", onConfirm: () => {} })}
      />
      {ToastComponent}
    </SidebarLayout>
  );
}
