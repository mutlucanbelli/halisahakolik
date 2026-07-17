"use client";

import { useState } from "react";
import { submitLiveVote } from "@/app/actions";
import { CheckCircle, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface TargetPlayer {
  id: string;
  name: string;
}

export default function LiveVoteClient({
  matchId,
  voterId,
  target,
  hasVoted
}: {
  matchId: string;
  voterId: string;
  target: TargetPlayer;
  hasVoted: boolean;
}) {
  const [rating, setRating] = useState<number>(50);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (hasVoted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl text-center flex flex-col items-center justify-center gap-3 animate-fade-in shadow-sm z-50 fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-white/95 backdrop-blur-md">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
          <CheckCircle size={32} />
        </div>
        <h3 className="text-xl font-black text-emerald-800">Oyunuz Alındı!</h3>
        <p className="text-sm font-semibold text-emerald-600">
          <strong>{target.name}</strong> için oy kullandınız. Diğer oyuncunun oylamaya açılmasını bekleyin...
        </p>
        <button onClick={() => router.refresh()} className="mt-4 text-xs font-bold text-emerald-700 bg-emerald-100 px-4 py-2 rounded-lg hover:bg-emerald-200 transition-colors">
          Sayfayı Yenile
        </button>
      </div>
    );
  }

  const handleVote = async () => {
    setLoading(true);
    await submitLiveVote(matchId, voterId, target.id, rating);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col items-center text-center p-8 border-4 border-amber-400 transform transition-all">
        
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-500 mb-4 animate-bounce">
          <Zap size={32} />
        </div>
        
        <div className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2">
          Canlı Oylama Başladı
        </div>
        
        <h2 className="text-2xl font-black text-slate-800 mb-2">{target.name}</h2>
        <p className="text-sm text-slate-500 font-medium mb-8">
          Şu anda oylamada! Lütfen bu oyuncu için 1 ile 100 arasında bir puan verin.
        </p>

        <div className="w-full flex flex-col items-center gap-4">
          <div className="text-6xl font-black text-amber-500 mb-2">
            {rating}
          </div>
          
          <input
            type="range"
            min="1"
            max="100"
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />

          <div className="w-full flex justify-between text-xs font-bold text-slate-400 mt-1">
            <span>Çok Kötü (1)</span>
            <span>Çok İyi (100)</span>
          </div>
        </div>

        <button
          onClick={handleVote}
          disabled={loading}
          className="w-full mt-8 bg-black text-white font-black py-4 rounded-2xl shadow-xl hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {loading ? "Gönderiliyor..." : "Oyu Gönder"}
        </button>
      </div>
    </div>
  );
}
