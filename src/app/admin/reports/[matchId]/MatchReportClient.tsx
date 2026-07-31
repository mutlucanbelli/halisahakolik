"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, X, ChevronUp, ChevronDown, Minus, User, ArrowRight } from "lucide-react";

export default function MatchReportClient({ match }: { match: any }) {
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"received" | "given">("received");

  const teamA = match.players.filter((mp: any) => mp.team === 'A');
  const teamB = match.players.filter((mp: any) => mp.team === 'B');

  const openPlayerDetails = (mp: any) => {
    const votesReceived = match.votes?.filter((v: any) => v.targetId === mp.playerId) || [];
    const votesGiven = match.votes?.filter((v: any) => v.voterId === mp.playerId) || [];
    setSelectedPlayer({ ...mp, votesReceived, votesGiven });
    setViewMode("received");
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

      {/* Teams */}
      <div className="flex flex-col gap-6 mt-2">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <h3 className="font-black text-blue-900 text-sm uppercase tracking-wider">Takım A (Mavi)</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {teamA.map((mp: any) => (
              <PlayerCard key={mp.id} mp={mp} onClick={() => openPlayerDetails(mp)} />
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <h3 className="font-black text-red-900 text-sm uppercase tracking-wider">Takım B (Kırmızı)</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {teamB.map((mp: any) => (
              <PlayerCard key={mp.id} mp={mp} onClick={() => openPlayerDetails(mp)} />
            ))}
          </div>
        </div>
      </div>

      {/* Toplu Oy Tablosu */}
      {match.votes?.length > 0 && (
        <div className="mt-2">
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-3">Toplu Oy Tablosu</h2>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {[...match.players]
              .sort((a: any, b: any) => (b.earnedRating || 0) - (a.earnedRating || 0))
              .map((mp: any) => {
                const votesReceived = match.votes?.filter((v: any) => v.targetId === mp.playerId) || [];
                const avg = votesReceived.length > 0
                  ? Math.ceil(votesReceived.reduce((sum: number, v: any) => sum + v.rating, 0) / votesReceived.length)
                  : null;
                const max = votesReceived.length > 0 ? Math.max(...votesReceived.map((v: any) => v.rating)) : null;
                const min = votesReceived.length > 0 ? Math.min(...votesReceived.map((v: any) => v.rating)) : null;

                return (
                  <div key={mp.id} className="border-b border-slate-100 last:border-0">
                    <button
                      onClick={() => openPlayerDetails(mp)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-8 rounded-full ${mp.team === 'A' ? 'bg-blue-500' : 'bg-red-500'}`} />
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{mp.player.name}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">{mp.position} · {mp.team === 'A' ? 'Takım A' : 'Takım B'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {votesReceived.length > 0 ? (
                          <>
                            <div className="flex gap-2">
                              <div className="flex flex-col items-center">
                                <span className="text-[9px] text-emerald-500 font-bold uppercase">Max</span>
                                <span className="text-xs font-black text-emerald-700">{max}</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-[9px] text-rose-500 font-bold uppercase">Min</span>
                                <span className="text-xs font-black text-rose-700">{min}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-center bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                              <span className="text-[9px] text-amber-500 font-bold uppercase">Ort</span>
                              <span className="text-lg font-black text-amber-700">{avg}</span>
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold italic">Oy yok</span>
                        )}
                      </div>
                    </button>
                    {votesReceived.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                        {[...votesReceived]
                          .sort((a: any, b: any) => b.rating - a.rating)
                          .map((vote: any) => {
                            const isHigh = vote.rating === max;
                            const isLow = vote.rating === min && vote.rating !== max;
                            return (
                              <div key={vote.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                isHigh ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                isLow ? 'bg-rose-50 border-rose-200 text-rose-700' :
                                'bg-slate-50 border-slate-200 text-slate-600'
                              }`}>
                                {isHigh && <ChevronUp size={11} />}
                                {isLow && <ChevronDown size={11} />}
                                {!isHigh && !isLow && <Minus size={11} />}
                                <span>{vote.voter?.name}</span>
                                <span className="font-black">{vote.rating}</span>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ====== PLAYER DETAILS MODAL - EKRANIN TAM ORTASINDA ====== */}
      {selectedPlayer && (
        <div
          className="fixed z-[9999] bg-black/50 backdrop-blur-sm"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedPlayer(null); }}
        >
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white ${selectedPlayer.team === 'A' ? 'bg-blue-500' : 'bg-red-500'}`}>
                  {selectedPlayer.player.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 leading-tight">{selectedPlayer.player.name}</h3>
                  <span className="text-xs font-bold text-gray-400 uppercase">{selectedPlayer.position} · Takım {selectedPlayer.team}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                  <span className="text-[9px] font-bold text-amber-500 uppercase">Not</span>
                  <span className="text-lg font-black text-amber-700">{selectedPlayer.earnedRating ? Math.ceil(selectedPlayer.earnedRating) : '-'}</span>
                </div>
                <button onClick={() => setSelectedPlayer(null)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors ml-1">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-gray-100 shrink-0">
              <button
                onClick={() => setViewMode("received")}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-wide transition-colors ${viewMode === 'received' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-400'}`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <User size={13} />
                  Alınan Oylar ({selectedPlayer.votesReceived.length})
                </div>
              </button>
              <button
                onClick={() => setViewMode("given")}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-wide transition-colors ${viewMode === 'given' ? 'text-purple-600 border-b-2 border-purple-500' : 'text-gray-400'}`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <ArrowRight size={13} />
                  Verilen Oylar ({selectedPlayer.votesGiven.length})
                </div>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto flex-1">
              {viewMode === "received" ? (
                <>
                  {selectedPlayer.votesReceived.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {(() => {
                        const allRatings = selectedPlayer.votesReceived.map((v: any) => v.rating);
                        const maxR = Math.max(...allRatings);
                        const minR = Math.min(...allRatings);
                        return [...selectedPlayer.votesReceived]
                          .sort((a: any, b: any) => b.rating - a.rating)
                          .map((vote: any) => {
                            const isHigh = vote.rating === maxR;
                            const isLow = vote.rating === minR && vote.rating !== maxR;
                            return (
                              <div key={vote.id} className={`flex justify-between items-center p-3 rounded-xl border ${
                                isHigh ? 'bg-emerald-50 border-emerald-200' :
                                isLow ? 'bg-rose-50 border-rose-200' :
                                'bg-slate-50 border-slate-100'
                              }`}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                                    isHigh ? 'bg-emerald-200 text-emerald-800' :
                                    isLow ? 'bg-rose-200 text-rose-800' :
                                    'bg-slate-200 text-slate-600'
                                  }`}>
                                    {vote.voter?.name?.charAt(0) || '?'}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {isHigh && <ChevronUp size={13} className="text-emerald-600" />}
                                    {isLow && <ChevronDown size={13} className="text-rose-600" />}
                                    {!isHigh && !isLow && <Minus size={13} className="text-slate-400" />}
                                    <span className={`font-semibold text-sm ${isHigh ? 'text-emerald-800' : isLow ? 'text-rose-800' : 'text-gray-700'}`}>
                                      {vote.voter?.name}
                                    </span>
                                  </div>
                                </div>
                                <span className={`font-black text-base px-3 py-1 rounded-lg border ${
                                  isHigh ? 'bg-emerald-100 border-emerald-200 text-emerald-700' :
                                  isLow ? 'bg-rose-100 border-rose-200 text-rose-700' :
                                  'bg-white border-slate-200 text-slate-600'
                                }`}>{vote.rating}</span>
                              </div>
                            );
                          });
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-sm font-medium border-2 border-dashed border-gray-200 rounded-xl">
                      Bu oyuncu oy almamış
                    </div>
                  )}
                </>
              ) : (
                /* Verilen Oylar */
                <>
                  {selectedPlayer.votesGiven.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {[...selectedPlayer.votesGiven]
                        .sort((a: any, b: any) => b.rating - a.rating)
                        .map((vote: any) => {
                          const targetMp = match.players.find((mp: any) => mp.playerId === vote.targetId);
                          const isHighVote = vote.rating >= 80;
                          const isLowVote = vote.rating <= 40;
                          return (
                            <div key={vote.id} className={`flex justify-between items-center p-3 rounded-xl border ${
                              isHighVote ? 'bg-purple-50 border-purple-200' :
                              isLowVote ? 'bg-orange-50 border-orange-200' :
                              'bg-slate-50 border-slate-100'
                            }`}>
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                                  targetMp?.team === 'A' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {vote.target?.name?.charAt(0) || '?'}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-sm text-gray-800">{vote.target?.name}</span>
                                  <span className="text-[10px] text-gray-400 font-semibold uppercase">{targetMp?.position} · Takım {targetMp?.team}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <ArrowRight size={12} className="text-slate-400" />
                                <span className={`font-black text-base px-3 py-1 rounded-lg border ${
                                  isHighVote ? 'bg-purple-100 border-purple-200 text-purple-700' :
                                  isLowVote ? 'bg-orange-100 border-orange-200 text-orange-700' :
                                  'bg-white border-slate-200 text-slate-600'
                                }`}>{vote.rating}</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-sm font-medium border-2 border-dashed border-gray-200 rounded-xl">
                      Bu oyuncu oy kullanmamış
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerCard({ mp, onClick }: { mp: any, onClick: () => void }) {
  const rating = mp.earnedRating ? Math.ceil(mp.earnedRating) : "?";
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center bg-white border border-gray-200 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all group active:scale-95"
    >
      <span className="font-bold text-gray-800 text-sm text-center mb-1 group-hover:text-black">{mp.player.name}</span>
      <span className="text-[10px] text-gray-400 font-semibold uppercase mb-3">{mp.position}</span>
      <div className="w-10 h-10 rounded-full bg-gray-50 border-2 border-gray-100 flex items-center justify-center font-black text-lg text-gray-700 group-hover:bg-amber-50 group-hover:border-amber-200 group-hover:text-amber-700 transition-colors">
        {rating}
      </div>
    </button>
  );
}
