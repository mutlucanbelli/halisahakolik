"use client";

import { useState } from "react";
import { updatePlayer, reevaluatePlayer, resetPlayerStats } from "./actions";
import { Edit2, X, RefreshCw } from "lucide-react";
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

  const handleReevaluate = async () => {
    if (confirm("Alınan tüm geçmiş maç puanları mevcut oynadığı mevki yeteneğine dağıtılacaktır. Onaylıyor musunuz?")) {
      setLoading(true);
      await reevaluatePlayer(player.id);
      setLoading(false);
      setIsOpen(false);
    }
  };

  // İşlenmemiş maçları hesapla
  const unappliedMatches = player.matches?.filter((m: any) => !m.isApplied && m.earnedRating != null && m.match?.status === "COMPLETED") || [];
  const unappliedCount = unappliedMatches.length;

  // Dağıtım öncesi tahmini yeni OVR hesapla
  const positionsArr = player.positions?.split(',').map((p: string) => p.trim()) || [];
  const mainPos = positionsArr[0]?.toLowerCase() || "";

  let previewRating = player.rating;
  if (unappliedCount > 0) {
    const byPos: Record<string, number[]> = { GK: [], DEF: [], MID: [], FWD: [] };
    unappliedMatches.forEach((m: any) => {
      const pos = m.position;
      const earned = m.earnedRating;
      if (pos === "Kaleci") byPos.GK.push(earned);
      else if (pos === "Defans") byPos.DEF.push(earned);
      else if (pos === "Orta Saha") byPos.MID.push(earned);
      else byPos.FWD.push(earned);
    });
    const avgOf = (arr: number[], fallback: number) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : fallback;
    const new_GK  = byPos.GK.length  > 0 ? avgOf(byPos.GK,  player.rating_GK)  : player.rating_GK;
    const new_DEF = byPos.DEF.length > 0 ? avgOf(byPos.DEF, player.rating_DEF) : player.rating_DEF;
    const new_MID = byPos.MID.length > 0 ? avgOf(byPos.MID, player.rating_MID) : player.rating_MID;
    const new_FWD = byPos.FWD.length > 0 ? avgOf(byPos.FWD, player.rating_FWD) : player.rating_FWD;
    if (mainPos.includes("kaleci") || mainPos.includes("gk")) previewRating = new_GK;
    else if (mainPos.includes("defans") || mainPos.includes("stoper") || mainPos.includes("bek")) previewRating = new_DEF;
    else if (mainPos.includes("forvet") || mainPos.includes("santrfor") || mainPos.includes("kanat")) previewRating = new_FWD;
    else previewRating = new_MID;
  }

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
              <span className="bg-white text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100 shadow-sm">
                {unappliedCount} Maç
              </span>
            </div>

            {/* Dağıtılmamış Maç Listesi */}
            {unappliedCount > 0 ? (
              <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                {unappliedMatches.map((m: any) => (
                  <div key={m.id} className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-blue-100 text-sm">
                    <span className="text-slate-600 font-semibold">
                      {m.match?.date ? new Date(m.match.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }) : '-'}
                      <span className="text-xs text-slate-400 ml-1.5 uppercase">{m.position}</span>
                    </span>
                    <span className="font-black text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">{Math.ceil(m.earnedRating)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-blue-600 font-medium text-center py-1">Dağıtılacak bekleyen puan yok.</p>
            )}

            {/* Tahmini Yeni OVR */}
            {unappliedCount > 0 && (
              <div className="flex justify-between items-center bg-white border border-blue-200 px-4 py-2 rounded-xl shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Mevcut OVR</span>
                  <span className="text-xl font-black text-slate-600">{Math.ceil(player.rating)}</span>
                </div>
                <span className="text-slate-300 font-black text-xl">→</span>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-blue-500 uppercase">Yeni OVR (Tahmini)</span>
                  <span className="text-xl font-black text-blue-700">{Math.ceil(previewRating)}</span>
                </div>
              </div>
            )}
            
            <button 
              type="button" 
              onClick={handleReevaluate}
              className={`w-full font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-sm border ${
                unappliedCount === 0 
                  ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-black text-white border-black hover:bg-slate-800 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
              }`}
              disabled={loading || unappliedCount === 0}
            >
              <RefreshCw size={16} /> Puanları OVR'ye Dağıt
            </button>
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
