"use client";

import { useEffect, useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { locationService } from "@/lib/services/locationService";
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
import { MapPin, Plus, Trash2, Pencil } from "lucide-react";
import dynamic from "next/dynamic";

// Load MapPicker dynamically to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import("@/components/layout/MapPicker"), { 
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg" />
});

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    latitude: "-6.175110", // Default Jakarta
    longitude: "106.827153",
    radius_meters: 100
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await locationService.getLocations();
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: "", latitude: "-6.175110", longitude: "106.827153", radius_meters: 100 });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingId(loc.id);
    setFormData({
      name: loc.name,
      latitude: loc.latitude.toString(),
      longitude: loc.longitude.toString(),
      radius_meters: loc.radius_meters
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      radius_meters: parseInt(formData.radius_meters)
    };

    try {
      if (editingId) {
        await locationService.updateLocation(editingId, payload);
      } else {
        await locationService.createLocation(payload);
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      alert("Gagal menyimpan lokasi");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Hapus lokasi ini?")) {
      try {
        await locationService.deleteLocation(id);
        fetchData();
      } catch (error) {
        alert("Gagal menghapus");
      }
    }
  };

  const updateCoordinates = (lat, lng) => {
    setFormData({
      ...formData,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    });
  };

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Lokasi Kerja</h1>
          <p className="text-gray-500">Atur koordinat geofencing untuk presensi karyawan.</p>
        </div>

        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus size={18} />
          Tambah Lokasi
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Lokasi" : "Tambah Titik Lokasi"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Nama Lokasi</Label>
                <Input 
                  placeholder="Contoh: Kantor Pusat, Cabang Bekasi"
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Pilih di Peta (Klik untuk memindahkan pin)</Label>
                <MapPicker 
                  lat={parseFloat(formData.latitude)} 
                  lng={parseFloat(formData.longitude)} 
                  radius={formData.radius_meters}
                  onChange={updateCoordinates}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input 
                    required 
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input 
                    required 
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Radius Presensi (Meter)</Label>
                <Input 
                  required 
                  type="number"
                  value={formData.radius_meters}
                  onChange={(e) => setFormData({...formData, radius_meters: parseInt(e.target.value)})}
                />
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full">
                  {editingId ? "Simpan Perubahan" : "Simpan Lokasi Baru"}
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
              <TableHead>Nama Lokasi</TableHead>
              <TableHead>Koordinat</TableHead>
              <TableHead>Radius</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">Memuat data...</TableCell>
              </TableRow>
            ) : locations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-gray-500">Belum ada data lokasi.</TableCell>
              </TableRow>
            ) : (
          locations.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-2 text-red-500" />
                      {loc.name}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-600">
                    {loc.latitude}, {loc.longitude}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                      {loc.radius_meters} Meter
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
                      onClick={() => handleOpenEdit(loc)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50" 
                      onClick={() => handleDelete(loc.id)}
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
