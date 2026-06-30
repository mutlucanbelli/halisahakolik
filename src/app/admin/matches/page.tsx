import prisma from "@/lib/prisma";
import { createMatch, deleteMatch, completeMatch } from "./actions";
import { Clock, CalendarDays, MapPin, CheckCircle, XCircle } from "lucide-react";
import CopyVoteLink from "./CopyVoteLink";
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
  const pendingMatches = matches.filter((m: any) => m.status === 'PENDING');

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
          
          const teamAAvg = teamA.length > 0 ? Math.ceil(teamA.reduce((acc: number, mp: any) => acc + mp.player.rating, 0) / teamA.length) : "0";
          const teamBAvg = teamB.length > 0 ? Math.ceil(teamB.reduce((acc: number, mp: any) => acc + mp.player.rating, 0) / teamB.length) : "0";
          
          const matchTime = match.date.getTime();
          const timePassed = now >= matchTime + (60 * 60 * 1000);
          
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
                  <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Bekliyor
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
                          <span className="text-xs font-bold text-gray-400 group-hover/player:text-black transition-colors">{Math.ceil(mp.player.rating)}</span>
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
                          <span className="text-xs font-bold text-gray-400 group-hover/player:text-black transition-colors">{Math.ceil(mp.player.rating)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                </div>

                {/* Actions Footer */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  
                  {!timePassed ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      <Clock size={14} className="text-orange-500" />
                      Oylama {new Date(matchTime + 60*60*1000).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})}'de açılacak
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1 items-start">
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                          <CheckCircle size={14} />
                          Oylama Açık 
                          <span className="bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-black ml-1">
                            {new Set(match.votes?.map((v: any) => v.voterId)).size || 0} Kişi Oy Verdi
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 w-full justify-between px-1">
                          <div className="flex items-center gap-2">
                            <CopyVoteLink matchId={match.id} />
                            <a href={`/vote/${match.id}`} target="_blank" className="text-xs font-bold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors">
                              Git
                            </a>
                          </div>
                          <form action={async () => { "use server"; const { revalidatePath } = await import("next/cache"); revalidatePath("/admin/matches"); }}>
                            <button type="submit" className="text-[10px] font-bold text-gray-500 hover:text-gray-800 underline">Yenile</button>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {now < matchTime + (2 * 60 * 60 * 1000) ? (
                      <form action={async () => { "use server"; await deleteMatch(match.id); }} className="w-full sm:w-auto">
                        <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-lg transition-all border border-gray-200 text-gray-600 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-sm">
                          <XCircle size={14} /> İptal Et
                        </button>
                      </form>
                    ) : (
                      <span className="w-full sm:w-auto text-center text-xs text-gray-400 font-semibold bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-lg cursor-not-allowed" title="Maç saatinin üzerinden 2 saat geçtiği için iptal edilemez">İptal Edilemez</span>
                    )}

                    <CompleteMatchButton matchId={match.id} disabled={!timePassed} />
                  </div>
                  
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
