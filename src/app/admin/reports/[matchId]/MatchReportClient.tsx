"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronUp, ChevronDown, Minus, ArrowRight, Target, Award } from "lucide-react";
import { getMatchAnalyst } from "@/lib/analyst";

export default function MatchReportClient({ match }: { match: any }) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const analyst = getMatchAnalyst(match.votes);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (expandedIds.length === match.players.length) {
      setExpandedIds([]);
    } else {
      setExpandedIds(match.players.map((mp: any) => mp.id));
    }
  };

  // Ortalamaya en yakın oy'u bulma yardımcısı
  const getVoteStats = (votes: any[]) => {
    if (!votes || votes.length === 0) return null;

    const ratings = votes.map(v => v.rating);
    const sum = ratings.reduce((a, b) => a + b, 0);
    const rawAvg = sum / votes.length;
    const avg = Math.ceil(rawAvg);
    const max = Math.max(...ratings);
    const min = Math.min(...ratings);

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

  const allExpanded = expandedIds.length === match.players.length;

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
            {new Date(match.date).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Istanbul' })}
          </p>
        </div>
      </div>

      {/* ======= HAFTANIN ANALİZCİSİ KARTI ======= */}
      {analyst && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden flex items-center justify-between">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-center text-yellow-300 shadow-inner">
              <Award size={26} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-blue-200 tracking-widest">Haftanın Analizcisi</span>
              <span className="text-lg font-black text-white leading-tight mt-0.5">{analyst.name}</span>
              <span className="text-[11px] text-blue-100 font-medium mt-0.5">{analyst.score} Oyuncuda En İsabetli Tahmin</span>
            </div>
          </div>

          <div className="flex flex-col items-end z-10 shrink-0">
            <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-1 rounded-xl text-xs font-black shadow-sm">
              🏆 {analyst.score} / {analyst.voteCount} İsabet
            </span>
            <span className="text-[9px] text-blue-200 font-semibold mt-1">±{analyst.avgDiff} Sapma</span>
          </div>
        </div>
      )}

      {/* ======= OY ANALİZİ (Açılır-Kapanır Akordiyon Tasarımı) ======= */}
      {match.votes?.length > 0 && (
        <div className="mt-2 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Oy Analizi</h2>
              <p className="text-xs text-slate-400 font-medium">Oyuncuya tıklayarak oylarını inceleyebilirsiniz</p>
            </div>
            <button
              onClick={toggleAll}
              className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-xl transition-all shadow-sm"
            >
              {allExpanded ? "Tümünü Kapat" : "Tümünü Aç"}
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
            {[...match.players]
              .sort((a: any, b: any) => (b.earnedRating || 0) - (a.earnedRating || 0))
              .map((mp: any) => {
                const votesReceived = match.votes?.filter((v: any) => v.targetId === mp.playerId) || [];
                const votesGiven = match.votes?.filter((v: any) => v.voterId === mp.playerId) || [];

                const recStats = getVoteStats(votesReceived);
                const givStats = getVoteStats(votesGiven);

                const isExpanded = expandedIds.includes(mp.id);

                return (
                  <div key={mp.id} className="flex flex-col transition-colors">
                    {/* Oyuncu Tıklanabilir Akordiyon Başlığı */}
                    <button
                      onClick={() => toggleExpand(mp.id)}
                      className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                        isExpanded ? 'bg-slate-50' : 'bg-white hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-8 rounded-full ${mp.team === 'A' ? 'bg-blue-500' : 'bg-red-500'}`} />
                        <div>
                          <div className="font-black text-slate-900 text-sm leading-tight flex items-center gap-2">
                            {mp.player.name}
                            {recStats && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                Ort: {recStats.avg}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                            {mp.position} · Takım {mp.team}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Oylar</span>
                          <span className="text-xs font-bold text-slate-600">
                            {votesReceived.length} Alınan / {votesGiven.length} Verilen
                          </span>
                        </div>
                        <div className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 transition-transform ${isExpanded ? 'rotate-180 bg-blue-100 text-blue-600' : ''}`}>
                          <ChevronDown size={16} />
                        </div>
                      </div>
                    </button>

                    {/* Detay İçeriği (Açılır/Kapanır) */}
                    {isExpanded && (
                      <div className="p-4 pt-2 bg-slate-50/50 flex flex-col gap-3 border-t border-slate-100">
                        
                        {/* 1. ALINAN OYLAR BLOKU */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <span className="text-xs font-black text-blue-700 uppercase tracking-wider">
                              📥 Alınan Oylar ({votesReceived.length})
                            </span>
                            {recStats && (
                              <div className="flex items-center gap-1.5 text-[10px] font-bold flex-wrap">
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">Max: {recStats.max}</span>
                                <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded">Min: {recStats.min}</span>
                                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">Ort: {recStats.avg}</span>
                                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-0.5">
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
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <span className="text-xs font-black text-purple-700 uppercase tracking-wider">
                              📤 Verilen Oylar ({votesGiven.length})
                            </span>
                            {givStats && (
                              <div className="flex items-center gap-1.5 text-[10px] font-bold flex-wrap">
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">Max: {givStats.max}</span>
                                <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded">Min: {givStats.min}</span>
                                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">Ort: {givStats.avg}</span>
                                <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded flex items-center gap-0.5">
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
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
