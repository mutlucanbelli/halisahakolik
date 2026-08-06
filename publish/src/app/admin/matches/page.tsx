import prisma from "@/lib/prisma";
import { createMatch, deleteMatch, completeMatch, startVoting, setActiveVotePlayer } from "./actions";
import { Clock, CalendarDays, MapPin, CheckCircle, XCircle } from "lucide-react";
import CompleteMatchButton from "./CompleteMatchButton";

import MatchForm from "./MatchForm";

export default async function MatchesPage() {
  const players = await prisma.player.findMany({ orderBy: { rating: 'desc' } });
  
  const matches = await prisma.match.findMany({
    orderBy: { date: 'desc' },
    include: {
      players: {
        include: { player: true }
      },
      votes: true
    }
  });

  const now = new Date().getTime();
  const pendingMatches = matches.filter((m: any) => m.status === 'PENDING' || m.status === 'VOTING');

  return (
    <div className="w-full flex flex-col gap-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col">
        <h1 className="text-3xl font-black text-black tracking-tight">Maçlar</h1>
        <p className="text-sm text-gray-500 font-medium">Yeni maç oluştur ve aktif maçları yönet</p>
      </div>

      <div className="glass-panel border-black/5 p-6">
        <h2 className="text-xl font-bold text-black mb-4">Yeni Maç Kur</h2>
        <MatchForm players={players} />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-black mb-2">Bekleyen Maçlar</h2>
        
        {pendingMatches.map((match: any) => {
          const teamA = match.players.filter((mp: any) => mp.team === 'A');
          const teamB = match.players.filter((mp: any) => mp.team === 'B');
          
          const getMatchRating = (mp: any) => {
            const pos = (mp.position || "").toLowerCase();
            if (pos.includes("kaleci") || pos.includes("gk")) return mp.player.rating_GK;
            if (pos.includes("defans") || pos.includes("stoper") || pos.includes("bek")) return mp.player.rating_DEF;
            if (pos.includes("forvet") || pos.includes("santrfor") || pos.includes("kanat")) return mp.player.rating_FWD;
            if (pos.includes("orta saha") || pos.includes("mid")) return mp.player.rating_MID;
            return mp.player.rating;
          }; const teamAAvg = teamA.length > 0 ? Math.ceil(teamA.reduce((acc: number, mp: any) => acc + getMatchRating(mp), 0) / teamA.length) : "0";
          const teamBAvg = teamB.length > 0 ? Math.ceil(teamB.reduce((acc: number, mp: any) => acc + getMatchRating(mp), 0) / teamB.length) : "0";
          
          const matchTime = match.date.getTime();
          const allowedVotingTime = matchTime + 60000;
          const canStartVoting = now >= allowedVotingTime;
          
          return (
            <div key={match.id} className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row group">
              
              {/* Ticket Left Side (Date & Info) */}
              <div className="bg-black text-white p-6 flex flex-col justify-center sm:w-1/4 min-w-[200px] border-b sm:border-b-0 sm:border-r border-dashed border-gray-700 relative">
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#fafafa] rounded-full sm:block hidden"></div>
                
                <div className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">Tarih</div>
                <div className="text-3xl font-black tracking-tighter mb-1">{match.date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}</div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                  <Clock size={14} /> {match.date.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                </div>

                <div className="mt-auto">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${match.status === 'VOTING' ? 'bg-amber-500 text-white animate-pulse' : 'bg-white/10'}`}>
                    {match.status === 'VOTING' ? 'Canlı Oylama' : 'Bekliyor'}
                  </span>
                </div>
              </div>

              {/* Ticket Right Side (Teams & Actions) */}
              <div className="p-6 flex-1 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative">
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#fafafa] rounded-full sm:block hidden"></div>
                
                <div className="flex flex-col sm:flex-row gap-6 items-stretch mb-6">
                  
                  {/* Takım A */}
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                      <strong className="text-lg font-black text-black">Takım A</strong>
                      <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">OVR {teamAAvg}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {teamA.map((mp: any) => (
                        <div key={mp.id} className="flex justify-between items-center text-sm group/player">
                          <span className="font-semibold text-gray-700">{mp.player.name}</span>
                          <span className="text-xs font-bold text-gray-400 group-hover/player:text-black transition-colors">{Math.ceil(getMatchRating(mp))}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* VS Divider */}
                  <div className="hidden sm:flex flex-col items-center justify-center">
                    <div className="w-px h-full bg-gray-100 absolute left-1/2 -translate-x-1/2"></div>
                    <div className="bg-white border border-gray-100 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-gray-400 z-10 relative">VS</div>
                  </div>

                  {/* Takım B */}
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                      <strong className="text-lg font-black text-black">Takım B</strong>
                      <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">OVR {teamBAvg}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {teamB.map((mp: any) => (
                        <div key={mp.id} className="flex justify-between items-center text-sm group/player">
                          <span className="font-semibold text-gray-700">{mp.player.name}</span>
                          <span className="text-xs font-bold text-gray-400 group-hover/player:text-black transition-colors">{Math.ceil(getMatchRating(mp))}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                </div>

                {/* Actions Footer */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  
                  {match.status === 'PENDING' && (
                    <>
                      {!canStartVoting ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                          <Clock size={14} className="text-orange-500" />
                          Oylama maç saatinden 1 dk sonra ({new Date(allowedVotingTime).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})}) açılabilir
                        </div>
                      ) : (
                        <form action={async () => { "use server"; await startVoting(match.id); }}>
                          <button type="submit" className="flex items-center gap-2 text-xs font-bold text-white bg-blue-600 px-4 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                            <CheckCircle size={16} /> Canlı Oylamayı Başlat
                          </button>
                        </form>
                      )}

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <form action={async () => { "use server"; await deleteMatch(match.id); }} className="w-full sm:w-auto">
                          <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-lg transition-all border border-gray-200 text-gray-600 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-sm">
                            <XCircle size={14} /> İptal Et
                          </button>
                        </form>
                      </div>
                    </>
                  )}

                  {match.status === 'VOTING' && (
                    <div className="w-full flex flex-col gap-4">
                      <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          <span className="text-sm font-bold text-amber-800">Canlı Oylama Devam Ediyor</span>
                        </div>
                        <form action={async () => { "use server"; const { revalidatePath } = await import("next/cache"); revalidatePath("/admin/matches"); }}>
                          <button type="submit" className="text-xs font-bold bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-md hover:bg-amber-100 transition-colors shadow-sm">
                            Yenile (Oy Sayısı)
                          </button>
                        </form>
                      </div>
                      
                      <div className="flex flex-col gap-2 bg-slate-50 border border-slate-200 p-3 rounded-lg">
                        <span className="text-xs font-bold text-slate-500 uppercase">Kimi Oylatmak İstiyorsunuz?</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {match.players.map((mp: any) => {
                            const isVotingNow = match.activeVotePlayerId === mp.playerId;
                            const targetVotes = match.votes?.filter((v: any) => v.targetId === mp.playerId) || [];
                            const voteCount = targetVotes.length;
                            const voteAvg = voteCount > 0 ? Math.ceil(targetVotes.reduce((sum: number, v: any) => sum + v.rating, 0) / voteCount) : 0;
                            return (
                              <form key={mp.id} action={async () => { "use server"; await setActiveVotePlayer(match.id, isVotingNow ? null : mp.playerId); }}>
                                <button type="submit" className={`w-full flex flex-col items-center justify-center p-2 rounded border text-xs font-bold transition-colors ${
                                  isVotingNow ? 'bg-amber-500 text-white border-amber-600 shadow-md transform scale-[1.02]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}>
                                  <span>{mp.player.name}</span>
                                  <span className={`text-[10px] mt-1 ${isVotingNow ? 'text-amber-100' : 'text-slate-400'}`}>
                                    {voteCount} Oy {voteCount > 0 && `- Ort: ${voteAvg}`}
                                  </span>
                                  {isVotingNow && <span className="mt-1 bg-white/20 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider animate-pulse">Oylanıyor</span>}
                                </button>
                              </form>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-end mt-2">
                        <CompleteMatchButton matchId={match.id} disabled={false} />
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>
          );
        })}
        {pendingMatches.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
            <p className="text-gray-500 font-medium">Bekleyen maç bulunmuyor.</p>
            <p className="text-xs text-gray-400 mt-1">Yeni bir maç kurarak organizasyona başlayın.</p>
          </div>
        )}
      </div>
    </div>
  );
}
