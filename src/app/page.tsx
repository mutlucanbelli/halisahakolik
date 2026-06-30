import Link from "next/link";
import prisma from "@/lib/prisma";
import { Users, Trophy, Activity, Medal, Calendar, ArrowRight, Star } from "lucide-react";

export default async function Home() {
  const playersCount = await prisma.player.count();
  const completedMatchesCount = await prisma.match.count({ where: { status: 'COMPLETED' } });
  const pendingMatchesCount = await prisma.match.count({ where: { status: 'PENDING' } });
  
  // En iyi 5 oyuncu (Leaderboard)
  const topPlayers = await prisma.player.findMany({
    orderBy: { rating: 'desc' },
    take: 5
  });

  // Son tamamlanan 2 maç
  const recentMatches = await prisma.match.findMany({
    where: { status: 'COMPLETED' },
    orderBy: { date: 'desc' },
    take: 2,
    include: {
      players: {
        include: { player: true }
      }
    }
  });

  return (
    <main className="container flex flex-col gap-6 py-8 pb-24" style={{ minHeight: "calc(100vh - 70px)" }}>
      
      {/* Header Section */}
      <div className="flex flex-col mb-4">
        <h1 className="text-3xl font-bold text-black tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Sistem İstatistikleri ve Liderlik Tablosu
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <Users size={20} className="text-gray-400 mb-2" />
          <div>
            <h3 className="font-bold text-2xl text-black">{playersCount}</h3>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Oyuncu</p>
          </div>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <Trophy size={20} className="text-gray-400 mb-2" />
          <div>
            <h3 className="font-bold text-2xl text-black">{completedMatchesCount}</h3>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Oynanan</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <Calendar size={20} className="text-gray-400 mb-2" />
          <div>
            <h3 className="font-bold text-2xl text-black">{pendingMatchesCount}</h3>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Bekleyen</p>
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="glass-panel mt-2">
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <Medal className="text-gray-800" size={20} />
            <h2 className="text-base font-bold text-black m-0 tracking-tight">Puan Sıralaması</h2>
          </div>
          <span className="text-xs font-semibold text-gray-400">Top 5</span>
        </div>

        <div className="flex flex-col gap-2 relative z-10">
          {topPlayers.map((player, index) => (
            <div key={player.id} className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-xl hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className={`
                  flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs
                  ${index === 0 ? 'bg-black text-white' : 'bg-gray-50 text-gray-500 border border-gray-100'}
                `}>
                  {index + 1}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-black text-sm">{player.name}</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase">{player.positions.split(',')[0]}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-black text-sm">{player.rating.toFixed(1)}</span>
              </div>
            </div>
          ))}
          {topPlayers.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-4">Sistemde henüz oyuncu yok.</p>
          )}
        </div>
        <Link href="/admin/players" className="flex items-center justify-center gap-2 mt-4 text-xs font-semibold text-gray-500 hover:text-black transition">
          Tüm Oyuncuları Gör <ArrowRight size={14} />
        </Link>
      </div>

      {/* Recent Matches Section */}
      <div className="glass-panel">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-gray-800" size={20} />
          <h2 className="text-base font-bold text-black m-0 tracking-tight">Son Oynanan Maçlar</h2>
        </div>

        <div className="flex flex-col gap-3">
          {recentMatches.map((match: any) => {
            const teamA = match.players.filter((mp: any) => mp.team === 'A');
            const teamB = match.players.filter((mp: any) => mp.team === 'B');
            
            const teamAAvg = teamA.length > 0 ? (teamA.reduce((acc: number, mp: any) => acc + mp.player.rating, 0) / teamA.length).toFixed(1) : 0;
            const teamBAvg = teamB.length > 0 ? (teamB.reduce((acc: number, mp: any) => acc + mp.player.rating, 0) / teamB.length).toFixed(1) : 0;

            return (
              <div key={match.id} className="bg-white border border-gray-100 p-4 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="text-xs font-semibold text-gray-400 mb-3 border-b border-gray-50 pb-2 flex justify-between">
                  <span>{match.date.toLocaleDateString('tr-TR')}</span>
                  <span>{match.date.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                
                <div className="flex justify-between items-center gap-4">
                  {/* Takım A Özet */}
                  <div className="flex-1 text-center">
                    <span className="block font-bold text-black text-sm mb-1">Takım A</span>
                    <span className="text-[10px] bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-full font-bold">Ort: {teamAAvg}</span>
                  </div>
                  
                  <div className="text-xs font-bold text-gray-300">VS</div>
                  
                  {/* Takım B Özet */}
                  <div className="flex-1 text-center">
                    <span className="block font-bold text-black text-sm mb-1">Takım B</span>
                    <span className="text-[10px] bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-full font-bold">Ort: {teamBAvg}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {recentMatches.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-4">Raporlanan henüz bir maç yok.</p>
          )}
        </div>
        
        <Link href="/admin/reports" className="flex items-center justify-center gap-2 mt-4 text-xs font-semibold text-gray-500 hover:text-black transition">
          Maç Raporlarına Git <ArrowRight size={14} />
        </Link>
      </div>

    </main>
  );
}
