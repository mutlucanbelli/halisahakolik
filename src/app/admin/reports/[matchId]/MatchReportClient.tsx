"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronUp, ChevronDown, Minus, User, ArrowRight } from "lucide-react";

export default function MatchReportClient({ match }: { match: any }) {
  const [activeTab, setActiveTab] = useState<"received" | "given">("received");

  const teamA = match.players.filter((mp: any) => mp.team === 'A');
  const teamB = match.players.filter((mp: any) => mp.team === 'B');

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

      {/* ======= OY TABLOSU (Popup Kaldırıldı, Alınan/Verilen Sekmeli) ======= */}
      {match.votes?.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 tracking-tight">Oy Detayları</h2>
          </div>

          {/* Sekme Butonları */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("received")}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "received"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <User size={14} />
              Alınan Oylar
            </button>
            <button
              onClick={() => setActiveTab("given")}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "given"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ArrowRight size={14} />
              Verilen Oylar
            </button>
          </div>

          {/* Oy Listesi Tablosu */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {[...match.players]
              .sort((a: any, b: any) => (b.earnedRating || 0) - (a.earnedRating || 0))
              .map((mp: any) => {
                const votesReceived = match.votes?.filter((v: any) => v.targetId === mp.playerId) || [];
                const votesGiven = match.votes?.filter((v: any) => v.voterId === mp.playerId) || [];

                if (activeTab === "received") {
                  const avg = votesReceived.length > 0
                    ? Math.ceil(votesReceived.reduce((sum: number, v: any) => sum + v.rating, 0) / votesReceived.length)
                    : null;
                  const max = votesReceived.length > 0 ? Math.max(...votesReceived.map((v: any) => v.rating)) : null;
                  const min = votesReceived.length > 0 ? Math.min(...votesReceived.map((v: any) => v.rating)) : null;

                  return (
                    <div key={mp.id} className="border-b border-slate-100 last:border-0 p-4">
                      {/* Başlık Satırı */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-8 rounded-full ${mp.team === 'A' ? 'bg-blue-500' : 'bg-red-500'}`} />
                          <div>
                            <div className="font-bold text-slate-800 text-sm leading-tight">{mp.player.name}</div>
                            <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">
                              {mp.position} · Takım {mp.team}
                            </div>
                          </div>
                        </div>

                        {votesReceived.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="flex gap-2 text-right">
                              <div className="flex flex-col items-center">
                                <span className="text-[9px] text-emerald-500 font-bold uppercase">Max</span>
                                <span className="text-xs font-black text-emerald-700">{max}</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-[9px] text-rose-500 font-bold uppercase">Min</span>
                                <span className="text-xs font-black text-rose-700">{min}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-center bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                              <span className="text-[9px] text-amber-500 font-bold uppercase">Ort</span>
                              <span className="text-base font-black text-amber-700">{avg}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">Oy almamış</span>
                        )}
                      </div>

                      {/* Kim Ne Puan Verdi Chips */}
                      {votesReceived.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {[...votesReceived]
                            .sort((a: any, b: any) => b.rating - a.rating)
                            .map((vote: any) => {
                              const isHigh = vote.rating === max;
                              const isLow = vote.rating === min && vote.rating !== max;
                              return (
                                <div
                                  key={vote.id}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                    isHigh
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                      : isLow
                                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                                      : 'bg-slate-50 border-slate-200 text-slate-700'
                                  }`}
                                >
                                  {isHigh && <ChevronUp size={12} className="text-emerald-600" />}
                                  {isLow && <ChevronDown size={12} className="text-rose-600" />}
                                  {!isHigh && !isLow && <Minus size={12} className="text-slate-400" />}
                                  <span>{vote.voter?.name}</span>
                                  <span className="font-black text-slate-900 ml-0.5">{vote.rating}</span>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                } else {
                  /* Verilen Oylar Tab'ı */
                  const avgGiven = votesGiven.length > 0
                    ? Math.ceil(votesGiven.reduce((sum: number, v: any) => sum + v.rating, 0) / votesGiven.length)
                    : null;

                  return (
                    <div key={mp.id} className="border-b border-slate-100 last:border-0 p-4">
                      {/* Başlık Satırı */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-8 rounded-full ${mp.team === 'A' ? 'bg-blue-500' : 'bg-red-500'}`} />
                          <div>
                            <div className="font-bold text-slate-800 text-sm leading-tight">{mp.player.name}</div>
                            <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">
                              {mp.position} · Takım {mp.team}
                            </div>
                          </div>
                        </div>

                        {votesGiven.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-purple-600 font-bold uppercase bg-purple-50 px-2 py-1 rounded-lg border border-purple-100">
                              {votesGiven.length} Oy Verdi
                            </span>
                            <div className="flex flex-col items-center bg-purple-50 border border-purple-200 px-3 py-1 rounded-xl">
                              <span className="text-[9px] text-purple-500 font-bold uppercase">Ort</span>
                              <span className="text-base font-black text-purple-700">{avgGiven}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">Oy kullanmamış</span>
                        )}
                      </div>

                      {/* Kimlere Kaç Puan Verdi Chips */}
                      {votesGiven.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {[...votesGiven]
                            .sort((a: any, b: any) => b.rating - a.rating)
                            .map((vote: any) => {
                              const targetMp = match.players.find((p: any) => p.playerId === vote.targetId);
                              const isHighVote = vote.rating >= 80;
                              const isLowVote = vote.rating <= 40;

                              return (
                                <div
                                  key={vote.id}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                    isHighVote
                                      ? 'bg-purple-50 border-purple-200 text-purple-800'
                                      : isLowVote
                                      ? 'bg-orange-50 border-orange-200 text-orange-800'
                                      : 'bg-slate-50 border-slate-200 text-slate-700'
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
                      )}
                    </div>
                  );
                }
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
