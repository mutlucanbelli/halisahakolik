"use client";

import Link from "next/link";
import { ArrowLeft, ChevronUp, ChevronDown, Minus, ArrowRight, Target } from "lucide-react";

export default function MatchReportClient({ match }: { match: any }) {
  const teamA = match.players.filter((mp: any) => mp.team === 'A');
  const teamB = match.players.filter((mp: any) => mp.team === 'B');

  // Ortalamaya en yakın oy'u bulma yardımcısı
  const getVoteStats = (votes: any[]) => {
    if (!votes || votes.length === 0) return null;

    const ratings = votes.map(v => v.rating);
    const sum = ratings.reduce((a, b) => a + b, 0);
    const rawAvg = sum / votes.length;
    const avg = Math.ceil(rawAvg);
    const max = Math.max(...ratings);
    const min = Math.min(...ratings);

    // Raw average'a mutlak fark olarak en yakın oy'u bul
    let closestVote = votes[0];
    let minDiff = Math.abs(votes[0].rating - rawAvg);

    for (let i = 1; i < votes.length; i++) {
      const diff = Math.abs(votes[i].rating - rawAvg);
      if (diff < minDiff) {
        minDiff = diff;
        closestVote = votes[i];
      }
    }

    return { max, min, avg, closestVote };
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/reports" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight">Maç Detayı</h1>
          <p className="text-xs text-gray-500 font-medium">
            {new Date(match.date).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Teams Container */}
      <div className="flex flex-col gap-6 mt-2">
        {/* Team A */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <h3 className="font-black text-blue-900 text-sm uppercase tracking-wider">Takım A (Mavi)</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {teamA.map((mp: any) => (
              <PlayerCard key={mp.id} mp={mp} />
            ))}
          </div>
        </div>

        {/* Team B */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <h3 className="font-black text-red-900 text-sm uppercase tracking-wider">Takım B (Kırmızı)</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {teamB.map((mp: any) => (
              <PlayerCard key={mp.id} mp={mp} />
            ))}
          </div>
        </div>
      </div>

      {/* ======= DETAYLI OY TABLOSU (Alt Alta, Tab'sız) ======= */}
      {match.votes?.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 tracking-tight">Oy Analizi (Alınan & Verilen)</h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
            {[...match.players]
              .sort((a: any, b: any) => (b.earnedRating || 0) - (a.earnedRating || 0))
              .map((mp: any) => {
                const votesReceived = match.votes?.filter((v: any) => v.targetId === mp.playerId) || [];
                const votesGiven = match.votes?.filter((v: any) => v.voterId === mp.playerId) || [];

                const recStats = getVoteStats(votesReceived);
                const givStats = getVoteStats(votesGiven);

                return (
                  <div key={mp.id} className="p-4 flex flex-col gap-3 bg-white hover:bg-slate-50/50 transition-colors">
                    {/* Oyuncu Başlığı */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-8 rounded-full ${mp.team === 'A' ? 'bg-blue-500' : 'bg-red-500'}`} />
                        <div>
                          <div className="font-black text-slate-900 text-base leading-tight">{mp.player.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                            {mp.position} · Takım {mp.team}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Maç Puanı</span>
                        <span className="text-xl font-black text-slate-800">{mp.earnedRating ? Math.ceil(mp.earnedRating) : '-'}</span>
                      </div>
                    </div>

                    {/* 1. ALINAN OYLAR BLOKU */}
                    <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-blue-700 uppercase tracking-wider">
                          📥 Alınan Oylar ({votesReceived.length})
                        </span>
                        {recStats && (
                          <div className="flex items-center gap-2 text-[10px] font-bold">
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Max: {recStats.max}</span>
                            <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded">Min: {recStats.min}</span>
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Ort: {recStats.avg}</span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded flex items-center gap-0.5">
                              <Target size={10} /> En Yakın: {recStats.closestVote.rating} ({recStats.closestVote.voter?.name})
                            </span>
                          </div>
                        )}
                      </div>

                      {votesReceived.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {[...votesReceived]
                            .sort((a: any, b: any) => b.rating - a.rating)
                            .map((vote: any) => {
                              const isMax = recStats && vote.rating === recStats.max;
                              const isMin = recStats && vote.rating === recStats.min && vote.rating !== recStats.max;
                              const isClosest = recStats && vote.id === recStats.closestVote.id;

                              return (
                                <div
                                  key={vote.id}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                    isMax
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                                      : isMin
                                      ? 'bg-rose-50 border-rose-200 text-rose-800 font-bold'
                                      : isClosest
                                      ? 'bg-blue-50 border-blue-200 text-blue-800 font-bold'
                                      : 'bg-white border-slate-200 text-slate-700'
                                  }`}
                                >
                                  {isMax && <ChevronUp size={12} className="text-emerald-600" />}
                                  {isMin && <ChevronDown size={12} className="text-rose-600" />}
                                  {!isMax && !isMin && <Minus size={12} className="text-slate-400" />}
                                  <span>{vote.voter?.name}</span>
                                  <span className="font-black text-slate-900">{vote.rating}</span>
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Oy alınmadı</span>
                      )}
                    </div>

                    {/* 2. VERİLEN OYLAR BLOKU */}
                    <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-purple-700 uppercase tracking-wider">
                          📤 Verilen Oylar ({votesGiven.length})
                        </span>
                        {givStats && (
                          <div className="flex items-center gap-2 text-[10px] font-bold">
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Max: {givStats.max}</span>
                            <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded">Min: {givStats.min}</span>
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Ort: {givStats.avg}</span>
                            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded flex items-center gap-0.5">
                              <Target size={10} /> En Yakın: {givStats.closestVote.rating} ({givStats.closestVote.target?.name})
                            </span>
                          </div>
                        )}
                      </div>

                      {votesGiven.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {[...votesGiven]
                            .sort((a: any, b: any) => b.rating - a.rating)
                            .map((vote: any) => {
                              const targetMp = match.players.find((p: any) => p.playerId === vote.targetId);
                              const isMax = givStats && vote.rating === givStats.max;
                              const isMin = givStats && vote.rating === givStats.min && vote.rating !== givStats.max;
                              const isClosest = givStats && vote.id === givStats.closestVote.id;

                              return (
                                <div
                                  key={vote.id}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                    isMax
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                      : isMin
                                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                                      : isClosest
                                      ? 'bg-purple-50 border-purple-200 text-purple-800'
                                      : 'bg-white border-slate-200 text-slate-700'
                                  }`}
                                >
                                  <span className={`w-2 h-2 rounded-full ${targetMp?.team === 'A' ? 'bg-blue-500' : 'bg-red-500'}`} />
                                  <span>{vote.target?.name}</span>
                                  <ArrowRight size={10} className="text-slate-400" />
                                  <span className="font-black text-slate-900">{vote.rating}</span>
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Oy kullanılmadı</span>
                      )}
                    </div>

                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerCard({ mp }: { mp: any }) {
  const rating = mp.earnedRating ? Math.ceil(mp.earnedRating) : "?";
  return (
    <div className="flex flex-col items-center justify-center bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
      <span className="font-bold text-gray-800 text-sm text-center mb-1">{mp.player.name}</span>
      <span className="text-[10px] text-gray-400 font-semibold uppercase mb-3">{mp.position}</span>
      <div className="w-10 h-10 rounded-full bg-gray-50 border-2 border-gray-100 flex items-center justify-center font-black text-lg text-gray-700">
        {rating}
      </div>
    </div>
  );
}
