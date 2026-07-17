"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type PlayerData = {
  id: string;
  name: string;
  positions: string;
  rating: number;
};

export default function LeaderboardClient({ 
  allPlayers, 
  currentPlayerId 
}: { 
  allPlayers: PlayerData[], 
  currentPlayerId: string 
}) {
  const [expanded, setExpanded] = useState(false);

  // Başlangıçta kaç kişi gösterilecek (Örn: İlk 5)
  const INITIAL_COUNT = 5;
  const displayPlayers = expanded ? allPlayers : allPlayers.slice(0, INITIAL_COUNT);
  const hasMore = allPlayers.length > INITIAL_COUNT;

  return (
    <div className="flex flex-col gap-2">
      {displayPlayers.map((p, index) => {
        const isMe = p.id === currentPlayerId;
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

      {hasMore && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center gap-2 mt-2 py-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors font-bold text-xs"
        >
          {expanded ? (
            <>Sıralamayı Gizle <ChevronUp size={16} /></>
          ) : (
            <>Tüm Sıralamayı Gör ({allPlayers.length} Oyuncu) <ChevronDown size={16} /></>
          )}
        </button>
      )}
    </div>
  );
}
