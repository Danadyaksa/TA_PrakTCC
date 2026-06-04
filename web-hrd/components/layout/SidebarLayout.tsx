"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Users, 
  LayoutDashboard, 
  Building2, 
  MapPin, 
  CalendarDays, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  ClipboardCheck,
  FileText,
  BadgeDollarSign,
  Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Karyawan", href: "/dashboard/users", icon: Users },
  { name: "Departemen", href: "/dashboard/departments", icon: Building2 },
  { name: "Lokasi Kerja", href: "/dashboard/locations", icon: MapPin },
  { name: "Jadwal", href: "/dashboard/schedules", icon: CalendarDays },
  { name: "Presensi", href: "/dashboard/attendance", icon: ClipboardCheck },
  { name: "Cuti & Izin", href: "/dashboard/leaves", icon: FileText },
  { name: "Gaji", href: "/dashboard/salaries", icon: BadgeDollarSign },
  { name: "Pengaturan", href: "/dashboard/settings", icon: Settings2 },
];

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Dialog konfirmasi logout */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Konfirmasi Logout</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin keluar dari sistem?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowLogoutDialog(false)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleLogout}
            >
              Ya, Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-white border-r transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            {!isCollapsed && <span className="text-xl font-bold text-primary">PresensiApp</span>}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="ml-auto"
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 mx-2 rounded-lg transition-colors group",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <item.icon className={cn("shrink-0", isCollapsed ? "mx-auto" : "mr-3")} size={20} />
                  {!isCollapsed && <span className="font-medium">{item.name}</span>}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t">
            {!isCollapsed && (
              <div className="mb-4 px-2">
                <p className="text-sm font-bold truncate">{user?.name || "HRD Admin"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            )}
            <Button 
              variant="ghost" 
              className={cn("w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50", isCollapsed && "justify-center")}
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className={cn(isCollapsed ? "mr-0" : "mr-3")} size={20} />
              {!isCollapsed && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isCollapsed ? "ml-20" : "ml-64"
        )}
      >
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
