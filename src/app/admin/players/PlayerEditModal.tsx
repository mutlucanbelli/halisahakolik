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
  
  // Mevcut mevkileri diziye çevirme
  const initialPositions = player.positions ? player.positions.split(",").map((p: string) => p.trim()) : [];
  const [selectedPositions, setSelectedPositions] = useState<string[]>(initialPositions);
  
  if (typeof window !== "undefined" && !mounted) {
    setMounted(true);
  }

  const togglePosition = (pos: string) => {
    if (selectedPositions.includes(pos)) {
      setSelectedPositions(selectedPositions.filter(p => p !== pos));
    } else {
      setSelectedPositions([...selectedPositions, pos]);
    }
  };

  const handleUpdate = async (formData: FormData) => {
    setLoading(true);
    // Mevkileri manuel ekliyoruz
    formData.set("positions", selectedPositions.join(", "));
    await updatePlayer(player.id, formData);
    setLoading(false);
    setIsOpen(false);
  };

  const handleReevaluate = async () => {
    if (confirm("Alınan tüm maç puanları mevcut yeteneklere dağıtılacak ve ardından geçmiş maç oyları temizlenecektir. Onaylıyor musunuz?")) {
      setLoading(true);
      await reevaluatePlayer(player.id);
      setLoading(false);
      setIsOpen(false);
    }
  };

  const handleResetStats = async () => {
    if (confirm("Oyuncunun tüm yetenek puanları 0'a sıfırlanacaktır. Bu işlem geri alınamaz. Onaylıyor musunuz?")) {
      setLoading(true);
      await resetPlayerStats(player.id);
      setLoading(false);
      setIsOpen(false);
    }
  };

  // Maç Oyları Hesaplaması
  const matchVotes = player.votesReceived || [];
  const totalVotesCount = matchVotes.length;
  const matchOverall = totalVotesCount > 0 
    ? (matchVotes.reduce((acc: number, v: any) => acc + v.rating, 0) / totalVotesCount).toFixed(1)
    : "Oylama Yok";

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

            <div className="bg-slate-50 border p-3 rounded-lg mt-2">
              <h3 className="font-bold text-sm mb-2 text-slate-700">Mevcut İstatistikler</h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                <div className="flex justify-between items-center border-b pb-1">
                  <span className="text-xs text-slate-500 font-bold">Şut / Refleks:</span>
                  <span className="font-mono text-sm text-slate-800 bg-white px-2 py-0.5 rounded shadow-sm border">{player.shooting}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-1">
                  <span className="text-xs text-slate-500 font-bold">Pas / Dağıtma:</span>
                  <span className="font-mono text-sm text-slate-800 bg-white px-2 py-0.5 rounded shadow-sm border">{player.passing}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-1">
                  <span className="text-xs text-slate-500 font-bold">Dripling / Birebir:</span>
                  <span className="font-mono text-sm text-slate-800 bg-white px-2 py-0.5 rounded shadow-sm border">{player.dribbling}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-1">
                  <span className="text-xs text-slate-500 font-bold">Defans / Poz:</span>
                  <span className="font-mono text-sm text-slate-800 bg-white px-2 py-0.5 rounded shadow-sm border">{player.defending}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-1">
                  <span className="text-xs text-slate-500 font-bold">Fizik:</span>
                  <span className="font-mono text-sm text-slate-800 bg-white px-2 py-0.5 rounded shadow-sm border">{player.physical}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-1">
                  <span className="text-xs text-slate-500 font-bold">Hız / Çeviklik:</span>
                  <span className="font-mono text-sm text-slate-800 bg-white px-2 py-0.5 rounded shadow-sm border">{player.pace}</span>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary mt-2" disabled={loading || selectedPositions.length === 0}>
              {loading ? "Kaydediliyor..." : "Ad ve Mevki Bilgilerini Kaydet"}
            </button>
            {selectedPositions.length === 0 && (
              <p style={{ fontSize: "0.75rem", textAlign: "center", color: "var(--danger)", margin: 0 }}>Lütfen en az 1 mevki seçin.</p>
            )}
          </form>

          <hr className="my-4 border-slate-200" />

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-blue-800 text-sm">Bekleyen Maç Puanları</h3>
              <span className="bg-white text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100 shadow-sm">
                Ort: {matchOverall} ({totalVotesCount} oy)
              </span>
            </div>
            <p className="text-xs text-blue-600">
              Bu oyların ortalamasını mevcut özelliklere dağıtır ve geçmiş oyları tamamen temizler.
            </p>
            
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={handleReevaluate}
                className={`flex-1 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-sm border ${
                  totalVotesCount === 0 
                    ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-black text-white border-black hover:bg-slate-800 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
                }`}
                disabled={loading || totalVotesCount === 0}
              >
                <RefreshCw size={16} /> Puanları Dağıt ve Temizle
              </button>

              <button 
                type="button" 
                onClick={handleResetStats}
                className="font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-sm border border-red-200 text-red-600 bg-white hover:bg-red-50 hover:border-red-300 hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
                title="Tüm Yetenek Puanlarını 0'a Sıfırla"
              >
                Sıfırla
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold shadow-sm active:scale-95"
      >
        <Edit2 size={14} /> Düzenle
      </button>

      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
