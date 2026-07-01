import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { logoutPlayer } from "@/app/login/actions";
import { User, LogOut, Medal, Clock, Shield, Star, Swords } from "lucide-react";
import CountdownTimer from "./CountdownTimer";

export default async function PlayerDashboard() {
  const cookieStore = await cookies();
  const playerId = cookieStore.get("player_session")?.value;

  if (!playerId) {
    redirect("/login");
  }

  // 1. Oyuncunun kendi bilgilerini çek
  const player = await prisma.player.findUnique({
    where: { id: playerId }
  });

  if (!player) {
    redirect("/login");
  }

  // 2. Oyuncunun kadroda olduğu en yakın PENDING maçı bul
  const nextMatch = await prisma.match.findFirst({
    where: { 
      status: "PENDING",
      date: { gte: new Date() },
      players: { some: { playerId: player.id } }
    },
    orderBy: { date: "asc" },
    include: {
      players: {
        include: { player: true }
      }
    }
  });

  let myTeam = "";
  let teamA: any[] = [];
  let teamB: any[] = [];

  if (nextMatch) {
    teamA = nextMatch.players.filter(mp => mp.team === 'A').map(mp => mp.player);
    teamB = nextMatch.players.filter(mp => mp.team === 'B').map(mp => mp.player);
    const myMatchPlayer = nextMatch.players.find(mp => mp.playerId === player.id);
    if (myMatchPlayer) {
      myTeam = myMatchPlayer.team;
    }
  }

  // 3. Tüm puan sıralaması (Komple Leaderboard)
  const allPlayers = await prisma.player.findMany({
    orderBy: { rating: 'desc' }
  });

  const myRank = allPlayers.findIndex(p => p.id === player.id) + 1;

  return (
    <div className="w-full flex flex-col p-4 sm:p-6 animate-fade-in pb-12 gap-8">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Oyuncu Paneli</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Hoş geldin, {player.name}</p>
        </div>
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30">
          <User className="text-white" size={24} />
        </div>
      </div>

      {/* Oyuncu Kişisel Kartı */}
      <div className="bg-gradient-to-br from-slate-900 to-black rounded-3xl p-6 text-white shadow-xl shadow-black/20 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <Shield size={160} />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-slate-400 font-bold uppercase text-xs tracking-wider mb-1">Mevki: {player.positions.replace(',', ' - ')}</span>
            <span className="text-3xl font-black">{player.name}</span>
            <div className="flex items-center gap-2 mt-3">
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold border border-white/20">Sıralama: #{myRank}</span>
            </div>
          </div>
          <div className="w-20 h-24 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-xl flex flex-col items-center justify-center shadow-lg border-2 border-yellow-300 transform rotate-3">
            <span className="text-xs font-black text-amber-900 uppercase">OVR</span>
            <span className="text-3xl font-black text-white">{Math.ceil(player.rating)}</span>
          </div>
        </div>

        {/* Yetenek Barları */}
        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
          {[
            { label: 'Şut', value: player.shooting },
            { label: 'Pas', value: player.passing },
            { label: 'Top Sürme', value: player.dribbling },
            { label: 'Defans', value: player.defending },
            { label: 'Fizik', value: player.physical },
            { label: 'Hız', value: player.pace },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>{stat.label}</span>
                <span className="text-white">{stat.value}</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${stat.value >= 80 ? 'bg-emerald-400' : stat.value >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                  style={{ width: `${stat.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sıradaki Maçım */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Clock className="text-amber-500" size={20} />
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Sıradaki Maçım</h2>
        </div>
        
        {nextMatch ? (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 rounded-3xl flex flex-col gap-4 shadow-sm relative overflow-hidden">
            {/* Geri Sayım */}
            <div className="flex justify-between items-center border-b border-amber-200/60 pb-4">
              <div className="flex flex-col">
                <span className="text-amber-800 font-bold">{nextMatch.date.toLocaleDateString('tr-TR')}</span>
                <span className="text-amber-600 text-sm font-medium">{nextMatch.date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <CountdownTimer targetDate={nextMatch.date.toISOString()} />
            </div>

            {/* Hangi Takımdasın */}
            <div className="bg-white/60 p-3 rounded-xl border border-amber-100 flex items-center justify-between">
              <span className="font-bold text-slate-700">Durum:</span>
              <span className={`px-4 py-1.5 rounded-full font-black text-sm text-white ${myTeam === 'A' ? 'bg-blue-600' : 'bg-red-600'}`}>
                TAKIM {myTeam} İÇİNDESİN
              </span>
            </div>

            {/* Kadro Önizleme */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              {/* Takım A */}
              <div className="flex flex-col gap-2">
                <div className="text-center font-black text-blue-700 text-sm pb-1 border-b border-blue-200">Takım A</div>
                {teamA.map(p => (
                  <div key={p.id} className={`text-xs font-bold px-2 py-1.5 rounded-md ${p.id === player.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-800'}`}>
                    {p.name}
                  </div>
                ))}
              </div>
              
              {/* Takım B */}
              <div className="flex flex-col gap-2">
                <div className="text-center font-black text-red-700 text-sm pb-1 border-b border-red-200">Takım B</div>
                {teamB.map(p => (
                  <div key={p.id} className={`text-xs font-bold px-2 py-1.5 rounded-md ${p.id === player.id ? 'bg-red-600 text-white' : 'bg-red-50 text-red-800'}`}>
                    {p.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
              <Swords size={24} />
            </div>
            <p className="text-sm font-bold text-slate-500">Şu an kadrosunda olduğun bekleyen bir maç yok.</p>
          </div>
        )}
      </section>

      {/* Komple Leaderboard */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Medal className="text-indigo-500" size={20} />
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Tüm Puan Sıralaması</h2>
        </div>

        <div className="flex flex-col gap-2">
          {allPlayers.map((p, index) => {
            const isMe = p.id === player.id;
            return (
              <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                isMe ? 'bg-indigo-50 border-2 border-indigo-500 shadow-md transform scale-[1.02]' : 'bg-white border border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full font-black text-xs shadow-sm
                    ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white border-2 border-yellow-200' : 
                      index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white border-2 border-slate-200' :
                      index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white border-2 border-orange-200' :
                      'bg-slate-100 text-slate-500 border border-slate-300'}
                  `}>
                    {index + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-bold text-sm ${isMe ? 'text-indigo-700' : 'text-slate-800'}`}>
                      {p.name} {isMe && '(Sen)'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">{p.positions.split(',')[0]}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-black text-lg ${isMe ? 'text-indigo-700' : 'text-slate-800'}`}>
                    {Math.ceil(p.rating)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Çıkış Yap */}
      <form action={logoutPlayer} className="mt-6">
        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-slate-200 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-300 transition-colors active:scale-[0.98]">
          <LogOut size={18} /> Sistemden Çıkış Yap
        </button>
      </form>

    </div>
  );
}
