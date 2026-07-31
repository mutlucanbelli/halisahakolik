"use client";

import { useState, useEffect } from "react";
import { submitLiveVote } from "@/app/actions";
import { CheckCircle, Zap, Send } from "lucide-react";

// Modal açıkken body scroll'u kilitler, kapanınca eski haline getirir
function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
    };
  }, [isLocked]);
}

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
  const [submitted, setSubmitted] = useState(false);

  // Her zaman modal açık (oylama aktifse) — body scroll kilitle
  useBodyScrollLock(true);

  const overlayStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(6px)',
  };

  // Oy verildi durumu
  if (hasVoted || submitted) {
    return (
      <div style={overlayStyle}>
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col items-center text-center p-8 border-4 border-emerald-400 animate-fade-in">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
            <CheckCircle size={40} />
          </div>
          <h3 className="text-2xl font-black text-emerald-800 mb-2">Oyunuz Gönderildi!</h3>
          <p className="text-sm font-semibold text-emerald-600">
            <strong>{target.name}</strong> için oy kullandınız.
          </p>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Diğer oyuncunun oylamaya açılmasını bekleyin...
          </p>
        </div>
      </div>
    );
  }

  const handleVote = async () => {
    if (loading) return;
    setLoading(true);
    await submitLiveVote(matchId, voterId, target.id, rating);
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div style={overlayStyle}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col items-center text-center p-8 border-4 border-amber-400">
        
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-500 mb-4 animate-bounce">
          <Zap size={32} />
        </div>
        
        <div className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2">
          Canlı Oylama Başladı
        </div>
        
        <h2 className="text-2xl font-black text-slate-800 mb-2">{target.name}</h2>
        <p className="text-sm text-slate-500 font-medium mb-6">
          Bu oyuncu için 1 ile 100 arasında bir puan verin.
        </p>

        <div className="w-full flex flex-col items-center gap-4">
          <div className="text-7xl font-black text-amber-500 leading-none">
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

          <div className="w-full flex justify-between text-xs font-bold text-slate-400">
            <span>Çok Kötü (1)</span>
            <span>Çok İyi (100)</span>
          </div>
        </div>

        <button
          onClick={handleVote}
          disabled={loading}
          className="w-full mt-8 bg-black text-white font-black py-4 rounded-2xl shadow-xl hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
          {loading ? "Gönderiliyor..." : "Oyu Gönder"}
        </button>
      </div>
    </div>
  );
}
