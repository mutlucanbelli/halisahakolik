"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Users, FileText } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

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
    </nav>
  );
}
