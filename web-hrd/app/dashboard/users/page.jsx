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
import { Pencil, Trash2, UserPlus, Camera } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast-notification";

export default function UsersPage() {
  const { showToast, ToastComponent } = useToast();
  const [users, setUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let valA, valB;
    if (sortConfig.key === "face_url") {
      valA = a.face_url ? 1 : 0;
      valB = b.face_url ? 1 : 0;
    } else {
      valA = a[sortConfig.key];
      valB = b[sortConfig.key];
    }
    if (valA === undefined || valA === null) valA = "";
    if (valB === undefined || valB === null) valB = "";
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", description: "", onConfirm: () => {} });

  const [isFaceDialogOpen, setIsFaceDialogOpen] = useState(false);
  const [faceUser, setFaceUser] = useState(null);
  const [faceFile, setFaceFile] = useState(null);
  const [facePreview, setFacePreview] = useState(null);
  const [faceLoading, setFaceLoading] = useState(false);

  const handleFaceOpen = (user) => {
    setFaceUser(user);
    setFaceFile(null);
    setFacePreview(user.face_url || null);
    setIsFaceDialogOpen(true);
  };

  const handleFaceSubmit = async (e) => {
    e.preventDefault();
    if (!faceFile) {
      showToast("Harap pilih file foto wajah terlebih dahulu", "error");
      return;
    }
    setFaceLoading(true);
    try {
      await userService.uploadFace(faceUser.id, faceFile);
      showToast("Wajah berhasil didaftarkan!", "success");
      setIsFaceDialogOpen(false);
      setFaceFile(null);
      setFacePreview(null);
      fetchData();
    } catch (error) {
      console.error(error);
      showToast(error.message || "Gagal mendaftarkan wajah", "error");
    } finally {
      setFaceLoading(false);
    }
  };

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

      {/* Dialog Pendaftaran Wajah */}
      <Dialog open={isFaceDialogOpen} onOpenChange={setIsFaceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pendaftaran Wajah - {faceUser?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFaceSubmit} className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
              {facePreview ? (
                <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-blue-100 shadow-lg">
                  <img
                    src={facePreview}
                    alt="Face Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Camera size={48} className="mb-2" />
                  <span className="text-sm">Belum ada foto referensi wajah</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                id="face-upload-input"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFaceFile(file);
                    setFacePreview(URL.createObjectURL(file));
                  }
                }}
              />
              <label
                htmlFor="face-upload-input"
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md cursor-pointer text-sm font-medium transition-colors"
              >
                Pilih Foto Wajah
              </label>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Unggah foto wajah karyawan yang jelas (tampak depan, pencahayaan baik, tanpa masker/kacamata hitam).
            </p>
            <DialogFooter className="pt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFaceDialogOpen(false)}
                disabled={faceLoading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={faceLoading || !faceFile}>
                {faceLoading ? "Mengunggah..." : "Daftarkan Wajah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleSort("name")}>Nama</TableHead>
              <TableHead className="cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleSort("email")}>Email</TableHead>
              <TableHead className="cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleSort("department_name")}>Departemen</TableHead>
              <TableHead className="cursor-pointer select-none hover:bg-gray-100/50" onDoubleClick={() => handleSort("face_url")}>Status Wajah</TableHead>
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
              sortedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-gray-500">{user.email}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {user.department_name || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.face_url ? (
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-medium">
                        Terdaftar
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-medium">
                        Belum Terdaftar
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      onClick={() => handleFaceOpen(user)}
                      title="Daftarkan Wajah"
                    >
                      <Camera size={16} />
                    </Button>
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
