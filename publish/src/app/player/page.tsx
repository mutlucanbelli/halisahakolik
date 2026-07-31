import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { logoutPlayer } from "@/app/actions";
import { User, LogOut, Medal, Clock, Shield, Activity, Swords, Star } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import LeaderboardClient from "./LeaderboardClient";
import ChangePasswordModal from "./ChangePasswordModal";
import LiveVoteClient from "./LiveVoteClient";
import AutoRefreshClient from "./AutoRefreshClient";
import PitchView from "@/components/PitchView";

export default async function PlayerDashboard() {
  const cookieStore = await cookies();
  const playerId = cookieStore.get("player_session")?.value;

  if (!playerId) {
    redirect("/");
  }

  // 1. Oyuncunun kendi bilgilerini çek
  const player = await prisma.player.findUnique({
    where: { id: playerId }
  });

  if (!player) {
    redirect("/");
  }

  // 2. Oyuncunun kadroda olduğu en yakın PENDING maçı bul
  const nextMatch = await prisma.match.findFirst({
    where: { 
      status: { in: ["PENDING", "VOTING"] },
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
    const rawTeamA = nextMatch.players.filter(mp => mp.team === 'A').map(mp => mp.player);
    const rawTeamB = nextMatch.players.filter(mp => mp.team === 'B').map(mp => mp.player);
    
    // Form skorlarını ekle ve mevkilere göre sırala (Kaleci -> Defans -> Orta Saha -> Forvet)
    const getPosVal = (pos: string) => {
      const p = (pos || "").toLowerCase();
      if (p.includes("kaleci") || p.includes("gk")) return 1;
      if (p.includes("defans") || p.includes("stoper") || p.includes("bek")) return 2;
      if (p.includes("orta saha") || p.includes("mid")) return 3;
      return 4; // forvet
    };

    const enhanceAndSort = async (team: any[]) => {
      const enhanced = team.map(p => {
        const nextMp = nextMatch.players.find(mp => mp.playerId === p.id);
        const matchPosition = nextMp ? nextMp.position : p.positions.split(',')[0];
        return { ...p, matchPosition };
      });
      
      return enhanced.sort((a, b) => {
        const pA = getPosVal(a.matchPosition);
        const pB = getPosVal(b.matchPosition);
        if (pA !== pB) return pA - pB;
        return b.rating - a.rating; // aynı mevkide rating'e göre
      });
    };

    teamA = await enhanceAndSort(rawTeamA);
    teamB = await enhanceAndSort(rawTeamB);

    const myMatchPlayer = nextMatch.players.find(mp => mp.playerId === player.id);
    if (myMatchPlayer) {
      myTeam = myMatchPlayer.team;
    }
  }

  // 3. Son Oynanan Maç (ve Puanı)
  const lastMatchPlayer = await prisma.matchPlayer.findFirst({
    where: {
      playerId: player.id,
      match: { status: "COMPLETED" }
    },
    orderBy: { match: { date: "desc" } },
    include: { 
      match: {
        include: {
          votes: { include: { target: true, voter: true } }
        }
      } 
    }
  });

  // Son maçın MVP'sini hesapla
  let lastMatchMVP = "Belirlenmedi";
  let lastMatchMVPRating = 0;

  if (lastMatchPlayer && lastMatchPlayer.match.votes && lastMatchPlayer.match.votes.length > 0) {
    const scores: Record<string, { total: number, count: number, name: string }> = {};
    
    lastMatchPlayer.match.votes.forEach((v: any) => {
      if (!scores[v.targetId]) scores[v.targetId] = { total: 0, count: 0, name: v.target?.name || 'Bilinmiyor' };
      scores[v.targetId].total += v.rating;
      scores[v.targetId].count += 1;
    });

    let highest = 0;
    Object.values(scores).forEach(s => {
      const avg = s.total / s.count;
      if (avg > highest) {
        highest = avg;
        lastMatchMVP = s.name;
        lastMatchMVPRating = Math.ceil(avg);
      }
    });
  }

  // Son maçta bana puan verenler
  let highestVoter = null;
  let lowestVoter = null;

  if (lastMatchPlayer && lastMatchPlayer.match.votes) {
    const myVotes = lastMatchPlayer.match.votes.filter((v: any) => v.targetId === player.id);
    if (myVotes.length > 0) {
      myVotes.sort((a: any, b: any) => b.rating - a.rating);
      highestVoter = { name: myVotes[0].voter?.name || 'Bilinmiyor', rating: myVotes[0].rating };
      lowestVoter = { name: myVotes[myVotes.length - 1].voter?.name || 'Bilinmiyor', rating: myVotes[myVotes.length - 1].rating };
    }
  }

  // 4. Canlı Oylamada Olan Maç (Eğer varsa)
  const votingMatch = await prisma.match.findFirst({
    where: { 
      status: "VOTING",
      players: { some: { playerId: player.id } }
    },
    include: {
      players: { include: { player: true } },
      votes: {
        where: { voterId: player.id }
      }
    }
  });

  let activeVoteTarget = null;
  let hasVotedForActive = false;

  if (votingMatch && votingMatch.activeVotePlayerId && votingMatch.activeVotePlayerId !== player.id) {
    const targetMp = votingMatch.players.find(mp => mp.playerId === votingMatch.activeVotePlayerId);
    if (targetMp) {
      activeVoteTarget = targetMp.player;
      hasVotedForActive = votingMatch.votes.some(v => v.targetId === votingMatch.activeVotePlayerId);
    }
  }

  // 5. Tüm puan sıralaması (Komple Leaderboard)
  const allPlayers = await prisma.player.findMany({
    orderBy: { rating: 'desc' }
  });

  const myRank = allPlayers.findIndex(p => p.id === player.id) + 1;

  return (
    <div className="w-full flex flex-col p-4 sm:p-6 animate-fade-in pb-12 gap-8">
      <AutoRefreshClient hasVoting={!!votingMatch} />
      {player.mustChangePassword && <ChangePasswordModal playerId={player.id} />}
      
      {/* Canlı Oylama Ekranı */}
      {activeVoteTarget && votingMatch && (
        <LiveVoteClient 
          matchId={votingMatch.id}
          voterId={player.id}
          target={{ id: activeVoteTarget.id, name: activeVoteTarget.name }}
          hasVoted={hasVotedForActive}
        />
      )}
      
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

      {/* Oyuncu Kişisel Kartları (Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Profil Kartı */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mb-1">Profil</span>
            <span className="text-xl font-black text-slate-800">{player.name}</span>
            <span className="text-xs font-bold text-slate-500 mt-1">{player.positions.replace(',', ' - ')}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Genel Sıralama: #{myRank}</span>
          </div>
        </div>

        {/* Genel OVR Kartı */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider mb-1">Genel Güç</span>
            <span className="text-3xl font-black text-slate-800">{Math.ceil(player.rating)} <span className="text-sm font-bold text-slate-400">OVR</span></span>
          </div>
          <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center text-amber-500 font-black text-xl shadow-sm">
            ★
          </div>
        </div>
      </div>

      {/* Son Maç Puanları */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Activity className="text-emerald-500" size={20} />
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Son Oynadığım Maç</h2>
        </div>
        
        {lastMatchPlayer ? (
          <div className="bg-white border border-slate-100 p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-slate-800 font-bold">{lastMatchPlayer.match.date.toLocaleDateString('tr-TR')}</span>
                <span className="text-slate-400 text-xs font-semibold uppercase">{lastMatchPlayer.position} Olarak Oynadı</span>
              </div>
              <div className="flex flex-col items-end text-center">
                <span className="text-xs font-bold text-slate-500 mb-1">Alınan Puan</span>
                {lastMatchPlayer.earnedRating ? (
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-black text-lg">
                    {Math.ceil(lastMatchPlayer.earnedRating)}
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg font-bold text-xs">
                    Henüz İşlenmedi
                  </span>
                )}
              </div>
            </div>
            
            {/* MVP Banner */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  <Star size={16} className="fill-amber-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">Maçın MVP'si</span>
                  <span className="text-sm font-bold text-amber-900">{lastMatchMVP}</span>
                </div>
              </div>
              {lastMatchMVPRating > 0 && (
                <div className="text-sm font-black text-amber-600 bg-white px-2 py-1 rounded shadow-sm">
                  {lastMatchMVPRating} OVR
                </div>
              )}
            </div>

            {/* En Yüksek ve En Düşük Puan Verenler */}
            {highestVoter && lowestVoter && (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">En Yüksek Puan Veren</span>
                  <div className="flex items-end justify-between mt-1">
                    <span className="text-sm font-bold text-emerald-900 truncate pr-2">{highestVoter.name}</span>
                    <span className="text-sm font-black text-emerald-700 bg-white px-1.5 py-0.5 rounded shadow-sm">{highestVoter.rating}</span>
                  </div>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider">En Düşük Puan Veren</span>
                  <div className="flex items-end justify-between mt-1">
                    <span className="text-sm font-bold text-rose-900 truncate pr-2">{lowestVoter.name}</span>
                    <span className="text-sm font-black text-rose-700 bg-white px-1.5 py-0.5 rounded shadow-sm">{lowestVoter.rating}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
            <p className="text-sm font-bold text-slate-500">Henüz tamamlanmış bir maçınız yok.</p>
          </div>
        )}
      </section>

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
            <div className="bg-white/60 p-3 rounded-xl border border-amber-100 flex items-center justify-between mb-2">
              <span className="font-bold text-slate-700">Durum:</span>
              <span className={`px-4 py-1.5 rounded-full font-black text-sm text-white ${myTeam === 'A' ? 'bg-blue-600' : 'bg-red-600'}`}>
                TAKIM {myTeam} İÇİNDESİN
              </span>
            </div>

            {/* Saha Görünümü */}
            <div className="w-full">
              <PitchView teamA={teamA} teamB={teamB} />
            </div>

            {/* Kadro Önizleme (Detaylı Liste) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {/* Takım A */}
              <div className="flex flex-col gap-2">
                <div className="text-center font-black text-blue-700 text-sm pb-1 border-b border-blue-200 mb-1">Takım A</div>
                {teamA.map(p => (
                  <div key={p.id} className={`flex justify-between items-center px-3 py-2 rounded-lg border shadow-sm transition-all ${p.id === player.id ? 'bg-blue-600 text-white border-blue-700 scale-[1.02]' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'}`}>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{p.name}</span>
                      <span className={`text-[9px] uppercase font-bold tracking-wider mt-0.5 ${p.id === player.id ? 'text-blue-200' : 'text-slate-400'}`}>{p.matchPosition}</span>
                    </div>
                    <div className="flex gap-3 text-right">
                      <div className="flex flex-col items-center">
                        <span className={`text-[8px] uppercase font-bold ${p.id === player.id ? 'text-blue-200' : 'text-amber-500'}`}>OVR</span>
                        <span className="text-xs font-black">{Math.ceil(p.rating)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Takım A Toplamlar */}
                <div className="flex justify-between items-center px-3 py-2 mt-1 rounded-lg bg-blue-50 border border-blue-200">
                  <span className="text-xs font-black text-blue-900">Takım Toplamı</span>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-blue-600">OVR</span>
                    <span className="text-sm font-black text-blue-800">{teamA.reduce((sum, p) => sum + Math.ceil(p.rating), 0)}</span>
                  </div>
                </div>
              </div>
              
              {/* Takım B */}
              <div className="flex flex-col gap-2">
                <div className="text-center font-black text-red-700 text-sm pb-1 border-b border-red-200 mb-1">Takım B</div>
                {teamB.map(p => (
                  <div key={p.id} className={`flex justify-between items-center px-3 py-2 rounded-lg border shadow-sm transition-all ${p.id === player.id ? 'bg-red-600 text-white border-red-700 scale-[1.02]' : 'bg-white text-slate-700 border-slate-200 hover:border-red-300'}`}>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{p.name}</span>
                      <span className={`text-[9px] uppercase font-bold tracking-wider mt-0.5 ${p.id === player.id ? 'text-red-200' : 'text-slate-400'}`}>{p.matchPosition}</span>
                    </div>
                    <div className="flex gap-3 text-right">
                      <div className="flex flex-col items-center">
                        <span className={`text-[8px] uppercase font-bold ${p.id === player.id ? 'text-red-200' : 'text-amber-500'}`}>OVR</span>
                        <span className="text-xs font-black">{Math.ceil(p.rating)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Takım B Toplamlar */}
                <div className="flex justify-between items-center px-3 py-2 mt-1 rounded-lg bg-red-50 border border-red-200">
                  <span className="text-xs font-black text-red-900">Takım Toplamı</span>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-red-600">OVR</span>
                    <span className="text-sm font-black text-red-800">{teamB.reduce((sum, p) => sum + Math.ceil(p.rating), 0)}</span>
                  </div>
                </div>
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

        <LeaderboardClient allPlayers={allPlayers} currentPlayerId={player.id} />
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
