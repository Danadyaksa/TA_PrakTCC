"use client";

import { useEffect, useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { userService } from "@/lib/services/userService";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast-notification";

export default function UsersPage() {
  const { showToast, ToastComponent } = useToast();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", description: "", onConfirm: () => {} });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "karyawan",
    department_id: "",
  });

  const [editData, setEditData] = useState({
    name: "",
    email: "",
    department_id: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersData, deptsData] = await Promise.all([
        userService.getUsers(),
        departmentService.getDepartments(),
      ]);
      setUsers(usersData.filter((u) => u.role !== "hrd"));
      setDepartments(deptsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.createUser({ ...formData, role: "karyawan" });
      setIsAddDialogOpen(false);
      setFormData({ name: "", email: "", password: "", role: "karyawan", department_id: "" });
      fetchData();
    } catch (error) {
      showToast("Gagal menambah karyawan", "error");
    }
  };

  const handleEditOpen = (user) => {
    setEditingUser(user);
    setEditData({
      name: user.name,
      email: user.email,
      department_id: user.department_id?.toString() ?? "",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.updateUser(editingUser.id, {
        name: editData.name,
        email: editData.email,
        department_id: editData.department_id || null,
      });
      setIsEditDialogOpen(false);
      setEditingUser(null);
      fetchData();
    } catch (error) {
      showToast("Gagal mengupdate karyawan", "error");
    }
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      open: true,
      title: "Hapus Karyawan",
      description: "Data karyawan akan dihapus permanen.",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        try {
          await userService.deleteUser(id);
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
          <h1 className="text-3xl font-bold">Data Karyawan</h1>
          <p className="text-gray-500">Kelola informasi seluruh karyawan Anda di sini.</p>
        </div>

        {/* Dialog Tambah */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus size={18} />
              Tambah Karyawan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Karyawan Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Departemen</Label>
                <Select
                  value={formData.department_id.toString()}
                  onValueChange={(v) => setFormData({ ...formData, department_id: v })}
                >
                  <SelectTrigger>
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
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full">Simpan Karyawan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog Edit */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Karyawan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input
                required
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Departemen</Label>
              <Select
                value={editData.department_id.toString()}
                onValueChange={(v) => setEditData({ ...editData, department_id: v })}
              >
                <SelectTrigger>
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
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
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
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Departemen</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                  Belum ada data karyawan.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs">#{user.id}</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-gray-500">{user.email}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {user.department_name || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handleEditOpen(user)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(user.id)}
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
