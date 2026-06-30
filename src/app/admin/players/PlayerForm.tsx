"use client";

import { useState } from "react";
import { addPlayer } from "./actions";
import { Plus, X } from "lucide-react";
import { createPortal } from "react-dom";

const POSITIONS = ["Kaleci", "Defans", "Orta Saha", "Kanat", "Forvet"];

export default function PlayerForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  // To avoid SSR issues with createPortal
  const [mounted, setMounted] = useState(false);

  // We mount the portal target lazily
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

  const resetForm = () => {
    setSelectedPositions([]);
  };

  const modalContent = (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="title-sub" style={{ margin: 0 }}>Yeni Oyuncu Oluştur</h2>
          <button onClick={() => { setIsOpen(false); resetForm(); }} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        <form action={async (formData) => {
          await addPlayer(formData);
          setIsOpen(false);
          resetForm();
        }} className="modal-body">
          
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "bold", marginBottom: "0.25rem", color: "#334155" }}>Oyuncu Adı</label>
            <input type="text" name="name" placeholder="Örn: Ahmet Yılmaz" className="input-field" style={{ marginBottom: 0 }} required />
          </div>
          
          <input type="hidden" name="positions" value={selectedPositions.join(", ")} required minLength={1} />
          
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

          <div style={{ background: "#eff6ff", padding: "1rem", borderRadius: "12px", border: "1px solid #dbeafe" }}>
            <p style={{ fontSize: "0.875rem", color: "#1e40af", margin: 0 }}>
              <strong>Not:</strong> Oyuncunun özellikleri, konsey tarafından (WhatsApp linki) verilecek ilk oylamaların ortalaması alınarak belirlenecektir.
            </p>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: "0.5rem" }} disabled={selectedPositions.length === 0}>
            Sisteme Kaydet
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
