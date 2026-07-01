import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutAdmin } from "./actions";
import prisma from "@/lib/prisma";
import { Users, CalendarDays, Activity, PlusCircle, UserPlus, LogOut, Trophy } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("admin_session")?.value === "authenticated";

  // Login page.tsx is the entry point, so if they are not authenticated, go there.
  if (!isAuthenticated) {
    redirect("/login");
  }

  const totalPlayers = await prisma.player.count();
  const pendingMatches = await prisma.match.count({ where: { status: "PENDING" } });
  const completedMatches = await prisma.match.count({ where: { status: "COMPLETED" } });

  return (
    <div className="w-full flex flex-col p-6 animate-fade-in pb-32">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Hoş geldin Yönetici</p>
        </div>
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-lg">
          <Trophy className="text-white" size={24} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/30 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Users size={80} />
          </div>
          <div className="flex flex-col relative z-10">
            <span className="text-sm font-semibold opacity-90 mb-1">Oyuncular</span>
            <span className="text-3xl font-black">{totalPlayers}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/30 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <CalendarDays size={80} />
          </div>
          <div className="flex flex-col relative z-10">
            <span className="text-sm font-semibold opacity-90 mb-1">Bekleyen Maç</span>
            <span className="text-3xl font-black">{pendingMatches}</span>
          </div>
        </div>

        <div className="col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg shadow-slate-900/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Activity className="text-emerald-400" size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-300">Oynanan Toplam Maç</span>
              <span className="text-xl font-black">{completedMatches}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-bold text-slate-800 mb-4">Hızlı İşlemler</h2>
      <div className="flex flex-col gap-3 mb-8">
        <Link href="/admin/matches" className="flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors mr-4">
            <PlusCircle size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800">Yeni Maç Kur</span>
            <span className="text-xs text-slate-500">Kadro oluştur ve oylama başlat</span>
          </div>
        </Link>

        <Link href="/admin/players" className="flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors mr-4">
            <UserPlus size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800">Oyuncu Yönetimi</span>
            <span className="text-xs text-slate-500">Yeni oyuncu ekle veya puanla</span>
          </div>
        </Link>
      </div>

      {/* Logout */}
      <form action={logoutAdmin} className="mt-auto">
        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-4 rounded-xl hover:bg-red-100 transition-colors active:scale-[0.98]">
          <LogOut size={18} /> Çıkış Yap
        </button>
      </form>

    </div>
  );
}
