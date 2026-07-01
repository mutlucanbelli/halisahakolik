"use client";

import { useState } from "react";
import { submitVote } from "./actions";
import PitchView from "@/components/PitchView";

export default function VoteForm({ matchId, matchPlayers }: { matchId: string, matchPlayers: any[] }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const teamA = matchPlayers.filter((mp: any) => mp.team === 'A').map((mp: any) => mp.player);
  const teamB = matchPlayers.filter((mp: any) => mp.team === 'B').map((mp: any) => mp.player);
  const players = matchPlayers.map((mp: any) => mp.player).sort((a: any, b: any) => a.name.localeCompare(b.name));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const res = await submitVote(formData);
    
    if (res?.error) {
      setError(res.error);
    } else if (res?.success) {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="glass-panel text-center">
        <h2 className="title-sub" style={{ color: "var(--primary)" }}>Oylarınız Kaydedildi!</h2>
        <p style={{ color: "#94a3b8" }}>Katılımınız için teşekkürler. Bu sayfayı artık kapatabilirsiniz.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-red-100 flex flex-col items-center text-center animate-fade-in">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">İşlem Başarısız</h3>
            <p className="text-slate-600 text-sm font-medium mb-6 leading-relaxed">{error}</p>
            <button 
              type="button" 
              onClick={() => setError("")} 
              className="w-full bg-black hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              Anladım
            </button>
          </div>
        </div>
      )}

      <div className="glass-panel p-5">
        <label className="block text-xs font-bold mb-2 text-slate-700 uppercase tracking-wide">Kişisel Kodunuz:</label>
        <input type="text" name="voterCode" className="input-field border-slate-200 bg-slate-50 mb-0 font-bold tracking-widest text-center" placeholder="5 haneli kod" required />
        <input type="hidden" name="matchId" value={matchId} />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-bold text-slate-700 ml-1">Kadro Görünümü</h3>
        <PitchView teamA={teamA} teamB={teamB} />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-700 ml-1 mt-4">Oyuncuları Değerlendir (1-100)</h3>
        {players.map((p) => {
          return <PlayerRatingRow key={p.id} player={p} />;
        })}
      </div>

      <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98]">
        Oyları Gönder
      </button>
    </form>
  );
}

function PlayerRatingRow({ player }: { player: any }) {
  const [rating, setRating] = useState(50);
  
  return (
    <div className="flex flex-col gap-2 bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">{player.name}</span>
          <span className="text-xs text-slate-400">Genel Performans</span>
        </div>
        <span className="font-bold text-lg text-blue-600 bg-blue-100 px-3 py-1 rounded-lg">
          {rating}
        </span>
      </div>
      <input 
        type="range" 
        name={`rating_${player.id}`} 
        min="1" 
        max="100" 
        value={rating}
        onChange={(e) => setRating(parseInt(e.target.value))}
        className="w-full mt-2"
        style={{ accentColor: "#3b82f6" }}
      />
    </div>
  );
}
