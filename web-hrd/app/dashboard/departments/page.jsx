"use client";

import { useEffect, useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { departmentService } from "@/lib/services/departmentService";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast-notification";

export default function DepartmentsPage() {
  const { showToast, ToastComponent } = useToast();
  const [departments, setDepartments] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedDepartments = [...departments].sort((a, b) => {
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", description: "", onConfirm: () => {} });

  const [formData, setFormData] = useState({ name: "", description: "", basic_salary: "0" });
  const [editData, setEditData] = useState({ name: "", description: "", basic_salary: "0" });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await departmentService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await departmentService.createDepartment({
        ...formData,
        basic_salary: parseFloat(formData.basic_salary || 0)
      });
      setIsAddDialogOpen(false);
      setFormData({ name: "", description: "", basic_salary: "0" });
      fetchData();
    } catch (error) {
      showToast("Gagal menambah departemen", "error");
    }
  };

  const handleEditOpen = (dept) => {
    setEditingDept(dept);
    setEditData({
      name: dept.name,
      description: dept.description || "",
      basic_salary: dept.basic_salary?.toString() || "0"
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await departmentService.updateDepartment(editingDept.id, {
        ...editData,
        basic_salary: parseFloat(editData.basic_salary || 0)
      });
      setIsEditDialogOpen(false);
      setEditingDept(null);
      fetchData();
    } catch (error) {
      showToast("Gagal mengupdate departemen", "error");
    }
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      open: true,
      title: "Hapus Departemen",
      description: "Departemen ini akan dihapus permanen.",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        try {
          await departmentService.deleteDepartment(id);
          fetchData();
        } catch (error) {
          showToast("Gagal menghapus", "error");
        }
      },
    });
  };

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Departemen</h1>
          <p className="text-gray-500">Kelola divisi atau unit kerja perusahaan.</p>
        </div>

        {/* Dialog Tambah */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={18} />
              Tambah Departemen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Departemen</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nama Departemen</Label>
                <Input
                  placeholder="Contoh: IT Support, Kasir"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Input
                  placeholder="Keterangan singkat divisi"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Gaji Pokok Standar (Rp)</Label>
                <Input
                  type="number"
                  placeholder="Contoh: 3500000"
                  required
                  value={formData.basic_salary}
                  onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full">Simpan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog Edit */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Departemen</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Departemen</Label>
              <Input
                required
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Input
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Gaji Pokok Standar (Rp)</Label>
              <Input
                type="number"
                required
                value={editData.basic_salary}
                onChange={(e) => setEditData({ ...editData, basic_salary: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan Perubahan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleSort("name")}>Nama Departemen</TableHead>
              <TableHead className="cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleSort("description")}>Deskripsi</TableHead>
              <TableHead className="cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleSort("basic_salary")}>Gaji Pokok Standar</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">Memuat data...</TableCell>
              </TableRow>
            ) : departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-gray-500">
                  Belum ada data departemen.
                </TableCell>
              </TableRow>
            ) : (
              sortedDepartments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell className="text-gray-500">{dept.description || "-"}</TableCell>
                  <TableCell className="font-medium text-primary">{formatCurrency(dept.basic_salary || 0)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handleEditOpen(dept)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(dept.id)}
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
