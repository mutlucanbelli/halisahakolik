"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Users, FileText, LogOut } from "lucide-react";
import { logoutAdmin } from "@/app/login/actions";

export default function BottomNav() {
  const pathname = usePathname();

  // Oylama, login ve oyuncu sayfalarında alt menüyü gizle
  if (pathname?.startsWith("/vote") || pathname?.startsWith("/login") || pathname?.startsWith("/player")) {
    return null;
  }

  return (
    <nav className="bottom-nav">
      <Link href="/" className={`nav-item ${pathname === "/" ? "active" : ""}`}>
        <Home className="nav-icon" />
        <span className="nav-text">Ana Sayfa</span>
      </Link>
      
      <Link href="/admin/matches" className={`nav-item ${pathname?.startsWith("/admin/matches") ? "active" : ""}`}>
        <Trophy className="nav-icon" />
        <span className="nav-text">Maçlar</span>
      </Link>
      
      <Link href="/admin/players" className={`nav-item ${pathname?.startsWith("/admin/players") ? "active" : ""}`}>
        <Users className="nav-icon" />
        <span className="nav-text">Oyuncular</span>
      </Link>
      
      <Link href="/admin/reports" className={`nav-item ${pathname?.startsWith("/admin/reports") ? "active" : ""}`}>
        <FileText className="nav-icon" />
        <span className="nav-text">Rapor</span>
      </Link>

      <button onClick={() => logoutAdmin()} className="nav-item text-red-500 hover:text-red-700">
        <LogOut className="nav-icon text-red-500" />
        <span className="nav-text text-red-500">Çıkış</span>
      </button>
    </nav>
  );
}
