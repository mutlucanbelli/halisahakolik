"use client";

import { useState } from "react";
import { updatePlayer, reevaluatePlayer, resetPlayerStats } from "./actions";
import { Edit2, X, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { createPortal } from "react-dom";

const POSITIONS = ["Kaleci", "Defans", "Orta Saha", "Kanat", "Forvet"];

export default function PlayerEditModal({ player }: { player: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const initialPositions = player.positions ? player.positions.split(",").map((p: string) => p.trim()) : [];
  const [selectedPositions, setSelectedPositions] = useState<string[]>(initialPositions);
  const [mainPosition, setMainPosition] = useState<string>(initialPositions.length > 0 ? initialPositions[0] : "");
  
  if (typeof window !== "undefined" && !mounted) {
    setMounted(true);
  }

  const togglePosition = (pos: string) => {
    if (selectedPositions.includes(pos)) {
      const newPos = selectedPositions.filter(p => p !== pos);
      setSelectedPositions(newPos);
      if (mainPosition === pos) {
        setMainPosition(newPos.length > 0 ? newPos[0] : "");
      }
    } else {
      setSelectedPositions([...selectedPositions, pos]);
      if (selectedPositions.length === 0) {
        setMainPosition(pos);
      }
    }
  };

  const handleUpdate = async (formData: FormData) => {
    setLoading(true);
    formData.set("positions", mainPosition ? [mainPosition, ...selectedPositions.filter(p => p !== mainPosition)].join(", ") : "");
    await updatePlayer(player.id, formData);
    setLoading(false);
    setIsOpen(false);
  };

  const handleReevaluate = async (type: 'gk' | 'outfield') => {
    const label = type === 'gk' ? 'Kaleci' : 'Alan Oyuncusu';
    if (confirm(`${label} maç puanları dağıtılacak. Onaylıyor musunuz?`)) {
      setLoading(true);
      await reevaluatePlayer(player.id, type);
      setLoading(false);
      setIsOpen(false);
    }
  };

  // Dağıtılmamış maçları hesapla
  const unappliedMatches = player.matches?.filter((m: any) => !m.isApplied && m.earnedRating != null && m.match?.status === "COMPLETED") || [];
  const unappliedCount = unappliedMatches.length;
  const gkMatches = unappliedMatches.filter((m: any) => m.position === "Kaleci");
  const outfieldMatches = unappliedMatches.filter((m: any) => m.position !== "Kaleci");

  const isEligible = unappliedCount >= 2;

  // Ortalama hesaplama yardımcısı
  const calcAvg = (arr: any[]) => arr.length > 0 ? arr.reduce((s: number, m: any) => s + m.earnedRating, 0) / arr.length : 0;
  const gkAvg = calcAvg(gkMatches);
  const outfieldAvg = calcAvg(outfieldMatches);

  // Tahmini yeni OVR’ler
  const positionsArr = player.positions?.split(',').map((p: string) => p.trim()) || [];
  const mainPos = positionsArr[0]?.toLowerCase() || "";
  const previewGK = gkMatches.length > 0 ? gkAvg : player.rating_GK;
  let previewOutfield = player.rating;
  if (outfieldMatches.length > 0) {
    if (mainPos.includes("defans") || mainPos.includes("stoper") || mainPos.includes("bek")) previewOutfield = outfieldAvg;
    else if (mainPos.includes("forvet") || mainPos.includes("santrfor") || mainPos.includes("kanat")) previewOutfield = outfieldAvg;
    else if (!mainPos.includes("kaleci") && !mainPos.includes("gk")) previewOutfield = outfieldAvg;
  }

  const gkDiff = Math.ceil(previewGK) - Math.ceil(player.rating_GK);
  const outfieldDiff = Math.ceil(previewOutfield) - Math.ceil(player.rating);

  const modalContent = (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "500px" }}>
        <div className="modal-header">
          <h2 className="title-sub" style={{ margin: 0 }}>{player.name} Detayları</h2>
          <button onClick={() => setIsOpen(false)} className="modal-close-btn" disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <form action={handleUpdate} className="flex flex-col gap-3">
            <div>
              <label className="text-sm font-bold block mb-1">Oyuncu Adı</label>
              <input type="text" name="name" defaultValue={player.name} className="input-field mb-0" required />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#334155" }}>
                Mevkiler
              </label>
              <div className="flex flex-wrap gap-2">
                {POSITIONS.map(pos => {
                  const isSelected = selectedPositions.includes(pos);
                  return (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => togglePosition(pos)}
                      className={`pos-badge ${isSelected ? 'selected' : ''}`}
                    >
                      {pos}
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedPositions.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex flex-col gap-2">
                <label className="text-xs font-bold text-amber-800">Ana Mevki Seçimi (OVR bu mevkiye göre belirlenir)</label>
                <div className="flex flex-wrap gap-2">
                  {selectedPositions.map(pos => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setMainPosition(pos)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all border ${
                        mainPosition === pos 
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {pos} {mainPosition === pos && "★"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedPositions.length > 0 && (
              <div className="bg-slate-50 border p-3 rounded-lg mt-2">
                <h3 className="font-bold text-sm mb-2 text-slate-700">Mevki Puanları</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedPositions.includes("Kaleci") && (
                    <div>
                      <label className="text-xs font-bold text-slate-500">Kaleci (GK)</label>
                      <input type="number" step="0.1" name="rating_GK" defaultValue={player.rating_GK} className="input-field !mb-0" />
                    </div>
                  )}
                  {selectedPositions.includes("Defans") && (
                    <div>
                      <label className="text-xs font-bold text-slate-500">Defans (DEF)</label>
                      <input type="number" step="0.1" name="rating_DEF" defaultValue={player.rating_DEF} className="input-field !mb-0" />
                    </div>
                  )}
                  {selectedPositions.includes("Orta Saha") && (
                    <div>
                      <label className="text-xs font-bold text-slate-500">Orta Saha (MID)</label>
                      <input type="number" step="0.1" name="rating_MID" defaultValue={player.rating_MID} className="input-field !mb-0" />
                    </div>
                  )}
                  {(selectedPositions.includes("Forvet") || selectedPositions.includes("Kanat")) && (
                    <div>
                      <label className="text-xs font-bold text-slate-500">Forvet/Kanat (FWD)</label>
                      <input type="number" step="0.1" name="rating_FWD" defaultValue={player.rating_FWD} className="input-field !mb-0" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary mt-2" disabled={loading || selectedPositions.length === 0}>
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </form>

          <hr className="my-4 border-slate-200" />

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-blue-800 text-sm">Dağıtılmamış Maç Puanları</h3>
              <span className="bg-white text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100 shadow-sm">{unappliedCount} Maç</span>
            </div>

            {/* Maç listesi */}
            {unappliedCount > 0 ? (
              <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                {unappliedMatches.map((m: any) => (
                  <div key={m.id} className={`flex justify-between items-center px-3 py-2 rounded-lg border text-sm ${
                    m.position === 'Kaleci' ? 'bg-violet-50 border-violet-100' : 'bg-white border-blue-100'
                  }`}>
                    <span className="text-slate-600 font-semibold">
                      {m.match?.date ? new Date(m.match.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }) : '-'}
                      <span className={`text-xs ml-1.5 uppercase font-bold ${
                        m.position === 'Kaleci' ? 'text-violet-400' : 'text-slate-400'
                      }`}>{m.position}</span>
                    </span>
                    <span className={`font-black px-2 py-0.5 rounded-lg border ${
                      m.position === 'Kaleci'
                        ? 'text-violet-700 bg-violet-50 border-violet-200'
                        : 'text-blue-700 bg-blue-50 border-blue-200'
                    }`}>{Math.ceil(m.earnedRating)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-blue-600 font-medium text-center py-1">Dağıtılacak bekleyen puan yok.</p>
            )}

            {!isEligible && unappliedCount > 0 && (
              <p className="text-xs font-bold text-amber-700 bg-amber-100/80 p-2 rounded-lg text-center border border-amber-200">
                ⚠️ Puan dağıtımı yapabilmek için en az 2 tamamlanmış maç gereklidir. (Mevcut: {unappliedCount} Maç)
              </p>
            )}

            {/* Dağıt butonları */}
            {isEligible && (
              <div className="flex flex-col gap-2">

                {/* Kaleci dağıt butonu */}
                {gkMatches.length > 0 && (
                  <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-violet-700 uppercase tracking-wide">🧤 Kaleci Maçları</span>
                        <span className="text-[10px] text-violet-500">{gkMatches.length} maç · Ort: {Math.ceil(gkAvg)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-400">{Math.ceil(player.rating_GK)}</span>
                        <span className="text-slate-300">→</span>
                        <span className={`text-sm font-black ${
                          gkDiff > 0 ? 'text-emerald-600' : gkDiff < 0 ? 'text-rose-600' : 'text-slate-700'
                        }`}>{Math.ceil(previewGK)}</span>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                          gkDiff > 0 ? 'bg-emerald-100 text-emerald-700' : gkDiff < 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'
                        }`}>{gkDiff > 0 ? `+${gkDiff}` : gkDiff}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleReevaluate('gk')}
                      disabled={loading}
                      className="w-full font-bold py-2.5 px-4 rounded-lg bg-violet-600 text-white hover:bg-violet-700 flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
                    >
                      <RefreshCw size={14} /> Kaleci OVR'yi Dağıt
                    </button>
                  </div>
                )}

                {/* Alan oyuncusu dağıt butonu */}
                {outfieldMatches.length > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-emerald-700 uppercase tracking-wide">⚽ Alan Oyuncusu Maçları</span>
                        <span className="text-[10px] text-emerald-500">{outfieldMatches.length} maç · Ort: {Math.ceil(outfieldAvg)}</span>
                      </div>
                      {!mainPos.includes("kaleci") && !mainPos.includes("gk") && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-400">{Math.ceil(player.rating)}</span>
                          <span className="text-slate-300">→</span>
                          <span className={`text-sm font-black ${
                            outfieldDiff > 0 ? 'text-emerald-600' : outfieldDiff < 0 ? 'text-rose-600' : 'text-slate-700'
                          }`}>{Math.ceil(previewOutfield)}</span>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            outfieldDiff > 0 ? 'bg-emerald-100 text-emerald-700' : outfieldDiff < 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'
                          }`}>{outfieldDiff > 0 ? `+${outfieldDiff}` : outfieldDiff}</span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleReevaluate('outfield')}
                      disabled={loading}
                      className="w-full font-bold py-2.5 px-4 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
                    >
                      <RefreshCw size={14} /> Alan Oyuncusu OVR'yi Dağıt
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 h-[46px] px-5 rounded-xl border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-500 hover:text-white transition-all shadow-sm font-bold w-full"
      >
        <Edit2 size={16} /> Düzenle
      </button>

      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
