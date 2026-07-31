"use client";

import { useState, useEffect } from "react";
import { bulkReevaluateAll } from "./actions";
import { RefreshCw, X, CheckCircle2, ArrowRight, TrendingUp, TrendingDown, Minus, Zap, ShieldAlert } from "lucide-react";
import { createPortal } from "react-dom";

export default function BulkDistributeModal({ players }: { players: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sadece en az 2 tamamlanmış maçı olan oyuncuları hesapla
  const pendingPlayers = players
    .map(player => {
      const unappliedMatches = player.matches?.filter(
        (m: any) => !m.isApplied && m.earnedRating != null && m.match?.status === "COMPLETED"
      ) || [];

      if (unappliedMatches.length < 2) return null;

      const gkMatches = unappliedMatches.filter((m: any) => m.position === "Kaleci");
      const outfieldMatches = unappliedMatches.filter((m: any) => m.position !== "Kaleci");

      const calcAvg = (arr: any[]) =>
        arr.length > 0 ? arr.reduce((s: number, m: any) => s + m.earnedRating, 0) / arr.length : 0;

      const gkAvg = calcAvg(gkMatches);
      const outfieldAvg = calcAvg(outfieldMatches);

      const positionsArr = player.positions?.split(',').map((p: string) => p.trim()) || [];
      const mainPos = positionsArr[0]?.toLowerCase() || "";

      let previewRating = player.rating;

      if (mainPos.includes("kaleci") || mainPos.includes("gk")) {
        if (gkMatches.length > 0) previewRating = gkAvg;
      } else {
        if (outfieldMatches.length > 0) previewRating = outfieldAvg;
      }

      const currentCeil = Math.ceil(player.rating);
      const previewCeil = Math.ceil(previewRating);
      const diff = previewCeil - currentCeil;

      return {
        player,
        unappliedCount: unappliedMatches.length,
        gkMatches,
        outfieldMatches,
        gkAvg,
        outfieldAvg,
        currentRating: player.rating,
        previewRating,
        currentCeil,
        previewCeil,
        diff
      };
    })
    .filter(Boolean);

  const totalMatches = pendingPlayers.reduce((sum, p) => sum + (p?.unappliedCount || 0), 0);
  const totalIncreaseCount = pendingPlayers.filter(p => (p?.diff ?? 0) > 0).length;

  const handleBulkDistribute = async () => {
    setLoading(true);
    await bulkReevaluateAll();
    setLoading(false);
    setIsOpen(false);
  };

  const modalContent = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "1.25rem",
        paddingTop: "4vh",
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(8px)"
      }}
      onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
    >
      <div className="bg-white w-full max-w-lg rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[88vh] border border-slate-100 animate-fade-in">
        
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-6 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-black uppercase tracking-wider mb-2">
                <Zap size={12} className="text-yellow-400 fill-yellow-400" /> Toplu Reyting Güncellemesi
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">Yeni OVR Dağıtımı</h2>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                En az 2 tamamlanmış maçı olan oyuncular için yeni reytingler.
              </p>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              disabled={loading}
            >
              <X size={18} />
            </button>
          </div>

          {/* Stat Cards Row */}
          {pendingPlayers.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-5 relative z-10">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-2.5 rounded-xl flex flex-col items-center text-center">
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">Hazır Oyuncu</span>
                <span className="text-xl font-black text-white mt-0.5">{pendingPlayers.length}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-2.5 rounded-xl flex flex-col items-center text-center">
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">İşlenecek Maç</span>
                <span className="text-xl font-black text-blue-300 mt-0.5">{totalMatches}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-2.5 rounded-xl flex flex-col items-center text-center">
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">Yükselen OVR</span>
                <span className="text-xl font-black text-emerald-400 mt-0.5">{totalIncreaseCount} Oyuncu</span>
              </div>
            </div>
          )}
        </div>

        {/* Body List */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-3 bg-slate-50/50">
          {pendingPlayers.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {pendingPlayers.map((item: any) => {
                const isUp = item.diff > 0;
                const isDown = item.diff < 0;

                return (
                  <div
                    key={item.player.id}
                    className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3 group"
                  >
                    {/* Oyuncu Bilgisi */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base text-white shrink-0 shadow-sm ${
                        item.player.positions?.includes("Kaleci") ? 'bg-purple-600' :
                        item.player.positions?.includes("Defans") ? 'bg-blue-600' :
                        item.player.positions?.includes("Forvet") ? 'bg-red-600' : 'bg-emerald-600'
                      }`}>
                        {item.player.name.charAt(0)}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900 truncate">{item.player.name}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.player.positions?.split(',')[0]}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold mt-1">
                          {item.gkMatches.length > 0 && (
                            <span className="text-purple-700 font-bold bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md">
                              🧤 {item.gkMatches.length} Kaleci Maçı (Ort: {Math.ceil(item.gkAvg)})
                            </span>
                          )}
                          {item.outfieldMatches.length > 0 && (
                            <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                              ⚽ {item.outfieldMatches.length} Alan Maçı (Ort: {Math.ceil(item.outfieldAvg)})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* OVR Değişim Kartı */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                        <div className="flex flex-col items-center">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">Eski</span>
                          <span className="text-xs font-black text-slate-500">{item.currentCeil}</span>
                        </div>

                        <ArrowRight size={12} className="text-slate-400 mx-0.5" />

                        <div className="flex flex-col items-center">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">Yeni</span>
                          <span className={`text-base font-black ${
                            isUp ? 'text-emerald-600' : isDown ? 'text-rose-600' : 'text-slate-800'
                          }`}>
                            {item.previewCeil}
                          </span>
                        </div>
                      </div>

                      {/* Fark Rozeti */}
                      <div className={`px-2.5 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 border shadow-xs min-w-[50px] ${
                        isUp
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-500/20'
                          : isDown
                          ? 'bg-rose-500 border-rose-600 text-white shadow-rose-500/20'
                          : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}>
                        {isUp && <TrendingUp size={12} />}
                        {isDown && <TrendingDown size={12} />}
                        {!isUp && !isDown && <Minus size={12} />}
                        <span>{isUp ? `+${item.diff}` : item.diff}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-14 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-3 shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="font-black text-slate-800 text-lg">Tüm Oyuncular Güncel!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs font-medium">
                En az 2 tamamlanmış maçı olup puanı dağıtılmayı bekleyen oyuncu bulunmuyor.
              </p>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        {pendingPlayers.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-white flex flex-col gap-3 shrink-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <ShieldAlert size={14} className="text-amber-500 shrink-0" />
              <span>Onayladığınızda yukarıdaki {pendingPlayers.length} oyuncunun reytingleri kalıcı olarak güncellenir.</span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-2xl hover:bg-slate-200 transition-all"
                disabled={loading}
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={handleBulkDistribute}
                disabled={loading}
                className="flex-2 py-3.5 text-xs font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                {loading ? "Dağıtılıyor..." : "Onayla ve Tüm Puanları Dağıt"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const pendingCount = pendingPlayers.length;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 h-[44px] px-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 transition-all font-bold text-xs shadow-md active:scale-95 border border-slate-700 relative group"
      >
        <RefreshCw size={14} className="text-blue-400 group-hover:rotate-180 transition-transform duration-500" />
        <span>Toplu Puan Dağıt</span>
        {pendingCount > 0 && (
          <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-900 animate-pulse shadow-sm">
            {pendingCount}
          </span>
        )}
      </button>

      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
