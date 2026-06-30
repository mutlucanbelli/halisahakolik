"use client";

import { useState } from "react";
import { completeMatch } from "./actions";
import { Trophy, Star, X } from "lucide-react";
import { createPortal } from "react-dom";

export default function CompleteMatchButton({ matchId, disabled }: { matchId: string, disabled: boolean }) {
  const [loading, setLoading] = useState(false);
  const [mvp, setMvp] = useState<{ name: string, avg: string } | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    const res = await completeMatch(matchId);
    setLoading(false);
    
    if (res?.success) {
      if (res.mvp) {
        setMvp(res.mvp);
        setShowModal(true);
      } else {
        // Eğer MVP yoksa (hiç oy verilmemişse) sayfayı manuel yenilemek iyi olabilir
        window.location.reload();
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    window.location.reload();
  };

  const modalContent = showModal && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-gradient-to-b from-yellow-50 to-white rounded-3xl p-8 shadow-2xl max-w-sm w-full border border-yellow-200 flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Dekoratif Arka Plan */}
        <div className="absolute -top-10 -right-10 text-yellow-100 opacity-50 rotate-12">
          <Trophy size={120} />
        </div>
        <div className="absolute -bottom-10 -left-10 text-yellow-100 opacity-50 -rotate-12">
          <Star size={120} />
        </div>

        <button 
          onClick={closeModal} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white/50 rounded-full p-1"
        >
          <X size={20} />
        </button>

        <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-yellow-300 rounded-full flex items-center justify-center mb-4 shadow-lg border-4 border-white z-10 relative">
          <Trophy size={48} className="text-white drop-shadow-md" />
          <div className="absolute -bottom-2 -right-2 bg-black text-white text-xs font-black px-2 py-1 rounded-lg border-2 border-white shadow-sm">MVP</div>
        </div>
        
        <h3 className="text-sm font-bold tracking-widest text-yellow-600 uppercase mb-1 z-10">Maçın Yıldızı</h3>
        <h2 className="text-3xl font-black text-gray-900 mb-2 z-10 tracking-tight">{mvp?.name}</h2>
        
        <div className="flex items-center justify-center gap-2 bg-yellow-100/50 border border-yellow-200 px-4 py-2 rounded-xl mb-8 z-10 mt-2">
          <Star size={16} className="text-yellow-600 fill-yellow-600" />
          <span className="text-xl font-black text-yellow-700">{mvp?.avg}</span>
          <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest ml-1">Puan</span>
        </div>

        <button 
          type="button" 
          onClick={closeModal} 
          className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 z-10"
        >
          Raporlara Git
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button 
        type="button" 
        onClick={handleComplete}
        disabled={disabled || loading}
        className={`w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm ${
          disabled || loading
            ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
            : 'bg-black text-white border border-black hover:bg-gray-800 hover:shadow-md'
        }`}
        title={disabled ? "Maç süresi bitmeden raporlara gönderemezsiniz" : "Maçı Bitir ve Raporlara Gönder"}
      >
        {loading ? "Bitiriliyor..." : "Maçı Bitir"}
      </button>

      {showModal && typeof document !== 'undefined' && createPortal(modalContent, document.body)}
    </>
  );
}
