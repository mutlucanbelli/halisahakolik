"use client";

import { useState } from "react";
import { addPlayer } from "./actions";
import { Plus, X } from "lucide-react";
import { createPortal } from "react-dom";

const POSITIONS = ["Kaleci", "Defans", "Orta Saha", "Kanat", "Forvet"];

export default function PlayerForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [mainPosition, setMainPosition] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const resetForm = () => {
    setSelectedPositions([]);
    setMainPosition("");
  };

  const modalContent = (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "500px" }}>
        <div className="modal-header">
          <h2 className="title-sub" style={{ margin: 0 }}>Yeni Oyuncu Oluştur</h2>
          <button onClick={() => { setIsOpen(false); resetForm(); }} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        <form action={async (formData) => {
          if (loading) return; // Çift tıklama koruması
          setLoading(true);
          try {
            await addPlayer(formData);
            setIsOpen(false);
            resetForm();
          } catch (error) {
            console.error("Kaydetme hatası:", error);
          } finally {
            setLoading(false);
          }
        }} className="modal-body">
          
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "bold", marginBottom: "0.25rem", color: "#334155" }}>Oyuncu Adı</label>
            <input type="text" name="name" placeholder="Örn: Ahmet Yılmaz" className="input-field" style={{ marginBottom: 0 }} required />
          </div>
          
          <input type="hidden" name="positions" value={mainPosition ? [mainPosition, ...selectedPositions.filter(p => p !== mainPosition)].join(", ") : ""} required minLength={1} />
          
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#334155" }}>
              Mevkiler <span style={{ fontSize: "0.75rem", fontWeight: "normal", color: "#94a3b8" }}>(En az 1 seçin)</span>
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
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mt-3 flex flex-col gap-2">
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
              <h3 className="font-bold text-sm mb-2 text-slate-700">Seçilen Mevki Puanlarını Girin</h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedPositions.includes("Kaleci") && (
                  <div>
                    <label className="text-xs font-bold text-slate-500">Kaleci (GK)</label>
                    <input type="number" step="0.1" name="rating_GK" defaultValue="50" className="input-field !mb-0" />
                  </div>
                )}
                {selectedPositions.includes("Defans") && (
                  <div>
                    <label className="text-xs font-bold text-slate-500">Defans (DEF)</label>
                    <input type="number" step="0.1" name="rating_DEF" defaultValue="50" className="input-field !mb-0" />
                  </div>
                )}
                {selectedPositions.includes("Orta Saha") && (
                  <div>
                    <label className="text-xs font-bold text-slate-500">Orta Saha (MID)</label>
                    <input type="number" step="0.1" name="rating_MID" defaultValue="50" className="input-field !mb-0" />
                  </div>
                )}
                {(selectedPositions.includes("Forvet") || selectedPositions.includes("Kanat")) && (
                  <div>
                    <label className="text-xs font-bold text-slate-500">Forvet/Kanat (FWD)</label>
                    <input type="number" step="0.1" name="rating_FWD" defaultValue="50" className="input-field !mb-0" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{ background: "#eff6ff", padding: "1rem", borderRadius: "12px", border: "1px solid #dbeafe" }}>
            <p style={{ fontSize: "0.875rem", color: "#1e40af", margin: 0 }}>
              <strong>Not:</strong> Oyuncunun kullanıcı adı ve şifresi oluşturulduktan sonra oyuncu detayında görülebilir.
            </p>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: "0.5rem" }} disabled={selectedPositions.length === 0 || loading}>
            {loading ? "Kaydediliyor..." : "Sisteme Kaydet"}
          </button>
          {selectedPositions.length === 0 && (
            <p style={{ fontSize: "0.75rem", textAlign: "center", color: "var(--danger)", margin: 0 }}>Lütfen en az 1 mevki seçin.</p>
          )}
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="btn-primary flex items-center justify-center gap-2"
      >
        <Plus size={20} /> Yeni Oyuncu Ekle
      </button>
      
      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
