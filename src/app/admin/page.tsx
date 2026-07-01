import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutAdmin } from "./actions";
import prisma from "@/lib/prisma";
import { 
  Users, CalendarDays, Activity, PlusCircle, UserPlus, 
  LogOut, Trophy, Medal, ArrowRight, Clock, Calendar 
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("admin_session")?.value === "authenticated";

  // Login page.tsx is the entry point, so if they are not authenticated, go there.
  if (!isAuthenticated) {
    redirect("/login");
  }

  // İstatisikler
  const totalPlayers = await prisma.player.count();
  const pendingMatchesCount = await prisma.match.count({ where: { status: "PENDING" } });
  const completedMatchesCount = await prisma.match.count({ where: { status: "COMPLETED" } });

  // En iyi 5 oyuncu (Leaderboard)
  const topPlayers = await prisma.player.findMany({
    orderBy: { rating: 'desc' },
    take: 5
  });

  // Yaklaşan Maç (En yakın tarihli PENDING maç)
  const nextMatch = await prisma.match.findFirst({
    where: { status: 'PENDING', date: { gte: new Date() } },
    orderBy: { date: 'asc' },
    include: { players: { include: { player: true } } }
  });

  // Son tamamlanan 2 maç
  const recentMatches = await prisma.match.findMany({
    where: { status: 'COMPLETED' },
    orderBy: { date: 'desc' },
    take: 2,
    include: { players: { include: { player: true } } }
  });

  return (
    <div className="w-full flex flex-col p-4 sm:p-6 animate-fade-in pb-32 gap-8">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Hoş geldin Yönetici</p>
        </div>
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-lg">
          <Trophy className="text-white" size={24} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-blue-500/30 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Users size={80} />
          </div>
          <div className="flex flex-col relative z-10">
            <span className="text-xs sm:text-sm font-semibold opacity-90 mb-1">Oyuncular</span>
            <span className="text-2xl sm:text-3xl font-black">{totalPlayers}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-emerald-500/30 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <CalendarDays size={80} />
          </div>
          <div className="flex flex-col relative z-10">
            <span className="text-xs sm:text-sm font-semibold opacity-90 mb-1">Bekleyen Maç</span>
            <span className="text-2xl sm:text-3xl font-black">{pendingMatchesCount}</span>
          </div>
        </div>

        <div className="col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-slate-900/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
              <Activity className="text-emerald-400" size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-semibold text-slate-300 truncate">Oynanan Toplam Maç</span>
              <span className="text-lg sm:text-xl font-black">{completedMatchesCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Yaklaşan Maç Section */}
      {nextMatch && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Clock className="text-amber-500" size={20} />
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Yaklaşan Maç</h2>
          </div>
          
          <Link href={`/admin/matches`} className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 sm:p-5 rounded-2xl flex flex-col gap-3 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-center border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2 text-amber-700 font-bold">
                <Calendar size={16} />
                <span>{nextMatch.date.toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-black text-sm shadow-sm">
                {nextMatch.date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-amber-800 font-medium text-sm">
                {nextMatch.players.length} Oyuncu Kadroda
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:text-amber-700">
                Kadroyu Gör <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* Leaderboard Section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Medal className="text-indigo-500" size={20} />
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Puan Sıralaması</h2>
          </div>
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Top 5</span>
        </div>

        <div className="flex flex-col gap-2">
          {topPlayers.map((player, index) => (
            <Link href={`/admin/players/${player.id}`} key={player.id} className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-xl shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full font-black text-xs shadow-sm
                  ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white border-2 border-yellow-200' : 
                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white border-2 border-slate-200' :
                    index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white border-2 border-orange-200' :
                    'bg-slate-50 text-slate-500 border border-slate-200'}
                `}>
                  {index + 1}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 text-sm group-hover:text-black transition-colors">{player.name}</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">{player.positions.split(',')[0]}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">OVR</span>
                <span className="font-black text-slate-800 text-lg">{Math.ceil(player.rating)}</span>
              </div>
            </Link>
          ))}
          {topPlayers.length === 0 && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-center text-sm font-medium text-slate-400">
              Sistemde henüz oyuncu yok.
            </div>
          )}
        </div>
        
        <Link href="/admin/players" className="inline-flex items-center justify-center gap-2 mt-1 text-xs font-bold text-indigo-500 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-3 rounded-xl transition-all">
          Tüm Oyuncuları Yönet <ArrowRight size={14} />
        </Link>
      </section>

      {/* Recent Matches Section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Activity className="text-emerald-500" size={20} />
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Son Oynanan Maçlar</h2>
        </div>

        <div className="flex flex-col gap-3">
          {recentMatches.map((match: any) => {
            const teamA = match.players.filter((mp: any) => mp.team === 'A');
            const teamB = match.players.filter((mp: any) => mp.team === 'B');
            
            const teamAAvg = teamA.length > 0 ? Math.ceil(teamA.reduce((acc: number, mp: any) => acc + mp.player.rating, 0) / teamA.length) : 0;
            const teamBAvg = teamB.length > 0 ? Math.ceil(teamB.reduce((acc: number, mp: any) => acc + mp.player.rating, 0) / teamB.length) : 0;

            return (
              <Link href="/admin/reports" key={match.id} className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-all">
                <div className="text-xs font-bold text-slate-400 mb-3 border-b border-slate-50 pb-2 flex justify-between">
                  <span>{match.date.toLocaleDateString('tr-TR')}</span>
                  <span>{match.date.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                
                <div className="flex justify-between items-center gap-4">
                  {/* Takım A Özet */}
                  <div className="flex-1 text-center bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                    <span className="block font-black text-blue-700 text-sm mb-1">Takım A</span>
                    <span className="text-[10px] bg-white text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-bold shadow-sm">Ort: {teamAAvg}</span>
                  </div>
                  
                  <div className="text-[10px] font-black text-slate-300 bg-slate-50 px-2 py-1 rounded-md">VS</div>
                  
                  {/* Takım B Özet */}
                  <div className="flex-1 text-center bg-red-50/50 p-2 rounded-lg border border-red-100/50">
                    <span className="block font-black text-red-700 text-sm mb-1">Takım B</span>
                    <span className="text-[10px] bg-white text-red-600 border border-red-100 px-2 py-0.5 rounded-full font-bold shadow-sm">Ort: {teamBAvg}</span>
                  </div>
                </div>
              </Link>
            );
          })}
          {recentMatches.length === 0 && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-center text-sm font-medium text-slate-400">
              Raporlanan henüz bir maç yok.
            </div>
          )}
        </div>
        
        <Link href="/admin/reports" className="inline-flex items-center justify-center gap-2 mt-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-3 rounded-xl transition-all">
          Tüm Raporları Gör <ArrowRight size={14} />
        </Link>
      </section>

      {/* Quick Actions */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Hızlı İşlemler</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/admin/matches" className="flex-1 flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors mr-3 shrink-0">
              <PlusCircle size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 text-sm">Yeni Maç Kur</span>
              <span className="text-[10px] text-slate-500 font-medium">Kadro oluştur & oylama başlat</span>
            </div>
          </Link>

          <Link href="/admin/players" className="flex-1 flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors mr-3 shrink-0">
              <UserPlus size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 text-sm">Oyuncu Yönetimi</span>
              <span className="text-[10px] text-slate-500 font-medium">Yeni oyuncu ekle / puanla</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Logout */}
      <form action={logoutAdmin} className="mt-4">
        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-4 rounded-xl hover:bg-red-100 transition-colors active:scale-[0.98] border border-red-100 shadow-sm">
          <LogOut size={18} /> Güvenli Çıkış
        </button>
      </form>

    </div>
  );
}
