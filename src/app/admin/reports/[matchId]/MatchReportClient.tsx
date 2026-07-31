"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, X, ChevronUp, ChevronDown, Minus } from "lucide-react";

export default function MatchReportClient({ match }: { match: any }) {
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  const teamA = match.players.filter((mp: any) => mp.team === 'A');
  const teamB = match.players.filter((mp: any) => mp.team === 'B');

  const openPlayerDetails = (mp: any) => {
    const votesReceived = match.votes?.filter((v: any) => v.targetId === mp.playerId) || [];
    setSelectedPlayer({ ...mp, votesReceived });
  };

  // Genel oy özeti tablosu: Kim kime ne verdi
  const allPlayers = match.players.map((mp: any) => mp.player);

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
        {/* Team A */}
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

        {/* Team B */}
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

      {/* ======= OY MATRİSİ (Kim Kime Ne Verdi) ======= */}
      {match.votes?.length > 0 && (
        <div className="mt-2">
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-3">Toplu Oy Tablosu</h2>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Tüm oyuncuları sırala - earnedRating'e göre */}
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
                    {/* Oyuncu başlığı */}
                    <button
                      onClick={() => openPlayerDetails(mp)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-8 rounded-full ${mp.team === 'A' ? 'bg-blue-500' : 'bg-red-500'}`} />
                        <div className="text-left">
                          <div className="font-bold text-slate-800 text-sm">{mp.player.name}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">{mp.position} · {mp.team === 'A' ? 'Takım A' : 'Takım B'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {votesReceived.length > 0 ? (
                          <>
                            <div className="flex gap-2 text-right">
                              <div className="flex flex-col items-center">
                                <span className="text-[9px] text-emerald-500 font-bold uppercase">En Y.</span>
                                <span className="text-xs font-black text-emerald-700">{max}</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-[9px] text-rose-500 font-bold uppercase">En D.</span>
                                <span className="text-xs font-black text-rose-700">{min}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-center bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                              <span className="text-[9px] text-amber-500 font-bold uppercase">Ort.</span>
                              <span className="text-lg font-black text-amber-700">{avg}</span>
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold">Oy yok</span>
                        )}
                      </div>
                    </button>

                    {/* Her oyun detayı (küçük satırlar) */}
                    {votesReceived.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                        {[...votesReceived]
                          .sort((a: any, b: any) => b.rating - a.rating)
                          .map((vote: any) => {
                            const isHigh = vote.rating === max;
                            const isLow = vote.rating === min && vote.rating !== max;
                            return (
                              <div
                                key={vote.id}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                  isHigh
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                    : isLow
                                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                              >
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

      {/* Player Details Modal — Ekranın TAM ORTASINDA */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-gray-900">{selectedPlayer.player.name}</h3>
                <span className="text-sm font-semibold text-gray-500">{selectedPlayer.position}</span>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 bg-gray-50/50">
              <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <span className="font-bold text-sm text-gray-500 uppercase tracking-wider">Maç Notu</span>
                <span className="text-3xl font-black text-black">
                  {selectedPlayer.earnedRating ? Math.ceil(selectedPlayer.earnedRating) : "-"}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Kim Ne Oy Verdi?</h4>
                {selectedPlayer.votesReceived.length > 0 ? (
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                    {[...selectedPlayer.votesReceived]
                      .sort((a: any, b: any) => b.rating - a.rating)
                      .map((vote: any) => {
                        const allRatings = selectedPlayer.votesReceived.map((v: any) => v.rating);
                        const max = Math.max(...allRatings);
                        const min = Math.min(...allRatings);
                        const isHigh = vote.rating === max;
                        const isLow = vote.rating === min && vote.rating !== max;
                        return (
                          <div key={vote.id} className={`flex justify-between items-center p-3 rounded-xl border shadow-sm ${
                            isHigh ? 'bg-emerald-50 border-emerald-200' : isLow ? 'bg-rose-50 border-rose-200' : 'bg-white border-gray-100'
                          }`}>
                            <div className="flex items-center gap-2">
                              {isHigh && <ChevronUp size={14} className="text-emerald-600" />}
                              {isLow && <ChevronDown size={14} className="text-rose-600" />}
                              {!isHigh && !isLow && <Minus size={14} className="text-slate-400" />}
                              <span className={`font-semibold text-sm ${isHigh ? 'text-emerald-800' : isLow ? 'text-rose-800' : 'text-gray-700'}`}>
                                {vote.voter?.name}
                              </span>
                            </div>
                            <span className={`font-black px-3 py-1 rounded-lg border text-sm ${
                              isHigh ? 'bg-emerald-100 border-emerald-200 text-emerald-700' :
                              isLow ? 'bg-rose-100 border-rose-200 text-rose-700' :
                              'bg-amber-50 border-amber-100 text-amber-600'
                            }`}>
                              {vote.rating}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400 text-sm font-medium border-2 border-dashed border-gray-200 rounded-xl">
                    Henüz oy almamış
                  </div>
                )}
              </div>
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
