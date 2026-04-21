// AdminHeader.tsx (Server Component)
import { Button } from "@app/components/ui/button";
import {
  Home,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  AlertTriangle,
  ListChecks,
  PowerOff,
  MessageSquare,
  Cog,
  FolderTree,
  Mail,
  KeyRound,
  FileText,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@app/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@app/components/ui/dropdown-menu";
import Link from "next/link";
import { AdminHeaderClient } from "./menu"; // Client component'i içe aktar

// Menü öğeleri (server-side'da tanımlı)
const menuItems = [
  {
    label: "Anasayfa",
    path: "/management/dashboard",
    icon: Home,
  },
  {
    label: "Üyeler",
    path: "/management/users",
    icon: Users,
  },
  {
    label: "Şikayetler",
    path: "/management/complaints",
    icon: ClipboardList,
  },
  {
    label: "Mesajlar",
    path: "/management/all-messages",
    icon: MessageSquare,
  },
  {
    label: "İletişim Mesajları",
    path: "/management/contact-mesajlari",
    icon: Mail,
  },
  {
    label: "Blog",
    path: "/management/blog",
    icon: FileText,
  },
  {
    label: "Kategoriler",
    path: "/management/categoryler",
    icon: FolderTree,
  },
];

// Ayarlar alt menü öğeleri
const settingsMenuItems = [
  {
    label: "Ticari Ayarlar",
    path: "/management/settings/ticari",
    icon: Cog,
  },
  {
    label: "Site Ayarları",
    path: "/management/settings/site",
    icon: Settings,
  },
  {
    label: "Admin Pin Değiştir",
    path: "/management/admin-pin-change",
    icon: KeyRound,
  },
];

// Server Component
export function AdminHeader() {
  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo ve Başlık */}
          <div className="flex items-center gap-4">
            <Link href="/management/dashboard">
              <h1 className="text-xl font-bold text-primary cursor-pointer">
                Admin Panel
              </h1>
            </Link>
          </div>

          {/* Client Component */}
          <AdminHeaderClient
            menuItems={menuItems}
            settingsMenuItems={settingsMenuItems}
          />
        </div>
      </div>
    </header>
  );
}