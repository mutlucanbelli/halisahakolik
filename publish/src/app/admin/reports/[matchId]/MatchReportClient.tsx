"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star, Trophy, Users, X } from "lucide-react";

export default function MatchReportClient({ match }: { match: any }) {
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  const teamA = match.players.filter((mp: any) => mp.team === 'A');
  const teamB = match.players.filter((mp: any) => mp.team === 'B');

  const openPlayerDetails = (mp: any) => {
    const votesReceived = match.votes?.filter((v: any) => v.targetId === mp.playerId) || [];
    setSelectedPlayer({ ...mp, votesReceived });
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in pb-24 max-w-lg mx-auto">
      {/* Header with Back Button */}
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

      {/* Player Details Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">
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
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {selectedPlayer.votesReceived.map((vote: any) => (
                      <div key={vote.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <span className="font-semibold text-gray-700">{vote.voter?.name}</span>
                        <span className="font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                          {vote.rating}
                        </span>
                      </div>
                    ))}
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
