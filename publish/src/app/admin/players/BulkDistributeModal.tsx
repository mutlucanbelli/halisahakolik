"use client";

import { useState, useEffect } from "react";
import { bulkReevaluateAll } from "./actions";
import { RefreshCw, X, CheckCircle2, ArrowRight } from "lucide-react";
import { createPortal } from "react-dom";

export default function BulkDistributeModal({ players }: { players: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bekleyen puanı olan oyuncuları ve değişim önizlemelerini hesapla
  const pendingPlayers = players
    .map(player => {
      const unappliedMatches = player.matches?.filter(
        (m: any) => !m.isApplied && m.earnedRating != null && m.match?.status === "COMPLETED"
      ) || [];

      if (unappliedMatches.length === 0) return null;

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

      return {
        player,
        unappliedCount: unappliedMatches.length,
        gkMatches,
        outfieldMatches,
        gkAvg,
        outfieldAvg,
        currentRating: player.rating,
        previewRating
      };
    })
    .filter(Boolean);

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
        padding: "1.5rem",
        paddingTop: "5vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)"
      }}
      onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <RefreshCw size={18} className="text-blue-600" /> Toplu Puan Dağıtımı
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Tüm oyuncuların dağıtılmamış maç puanları OVR değerlerine aktarılacaktır.
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-3">
          {pendingPlayers.length > 0 ? (
            <>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between text-xs font-bold text-amber-800">
                <span>Bekleyen Dağıtımlar: {pendingPlayers.length} Oyuncu</span>
                <span>{pendingPlayers.reduce((s, p) => s + (p?.unappliedCount || 0), 0)} Toplam Maç</span>
              </div>

              <div className="flex flex-col gap-2">
                {pendingPlayers.map((item: any) => (
                  <div
                    key={item.player.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm text-slate-900 truncate">{item.player.name}</span>
                      <div className="flex gap-2 text-[10px] text-slate-400 font-semibold mt-0.5">
                        {item.gkMatches.length > 0 && (
                          <span className="text-violet-600 font-bold bg-violet-50 px-1.5 py-0.5 rounded">
                            🧤 {item.gkMatches.length} Kaleci Maçı (Ort: {Math.ceil(item.gkAvg)})
                          </span>
                        )}
                        {item.outfieldMatches.length > 0 && (
                          <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                            ⚽ {item.outfieldMatches.length} Alan Maçı (Ort: {Math.ceil(item.outfieldAvg)})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <span className="text-xs font-black text-slate-500">{Math.ceil(item.currentRating)}</span>
                      <ArrowRight size={12} className="text-slate-400" />
                      <span className="text-sm font-black text-blue-600">{Math.ceil(item.previewRating)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <CheckCircle2 size={40} className="text-emerald-500 mb-2" />
              <h3 className="font-bold text-slate-800">Dağıtılacak Bekleyen Puan Yok</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Tüm oyuncuların tamamlanmış maç puanları güncel durumdadır.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {pendingPlayers.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 py-3 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
              disabled={loading}
            >
              Vazgeç
            </button>

            <button
              type="button"
              onClick={handleBulkDistribute}
              disabled={loading}
              className="flex-1 py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              {loading ? "Dağıtılıyor..." : "Onayla ve Tümünü Dağıt"}
            </button>
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
        className="flex items-center justify-center gap-2 h-[42px] px-4 rounded-xl border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all font-bold text-xs shadow-sm relative"
      >
        <RefreshCw size={14} />
        Toplu Puan Dağıt
        {pendingCount > 0 && (
          <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white">
            {pendingCount}
          </span>
        )}
      </button>

      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
