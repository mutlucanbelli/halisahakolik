"use client";

import { useState } from "react";
import { createMatch } from "./actions";
import { ArrowLeftRight, Users } from "lucide-react";

export default function MatchForm({ players }: { players: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dateStr, setDateStr] = useState("");
  const [teamA, setTeamA] = useState<any[]>([]);
  const [teamB, setTeamB] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePlayer = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(pid => pid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const generateDraft = () => {
    if (!dateStr || selectedIds.length === 0) return;

    // Seçili oyuncuları bul ve puana göre (büyükten küçüğe) sırala
    const selectedPlayers = players
      .filter(p => selectedIds.includes(p.id))
      .sort((a, b) => b.rating - a.rating);

    const a: any[] = [];
    const b: any[] = [];

    // Snake Draft: A, B, B, A, A, B...
    selectedPlayers.forEach((p, index) => {
      if (index % 4 === 0 || index % 4 === 3) {
        a.push(p);
      } else {
        b.push(p);
      }
    });

    setTeamA(a);
    setTeamB(b);
    setShowPreview(true);
  };

  const swapToB = (player: any) => {
    setTeamA(teamA.filter(p => p.id !== player.id));
    setTeamB([...teamB, player].sort((a, b) => b.rating - a.rating));
  };

  const swapToA = (player: any) => {
    setTeamB(teamB.filter(p => p.id !== player.id));
    setTeamA([...teamA, player].sort((a, b) => b.rating - a.rating));
  };

  if (showPreview) {
    const avgA = teamA.length > 0 ? (teamA.reduce((sum, p) => sum + p.rating, 0) / teamA.length).toFixed(1) : 0;
    const avgB = teamB.length > 0 ? (teamB.reduce((sum, p) => sum + p.rating, 0) / teamB.length).toFixed(1) : 0;

    return (
      <form action={async (formData) => {
        setLoading(true);
        // add teams to formData manually since they are state
        teamA.forEach(p => formData.append("teamA", p.id));
        teamB.forEach(p => formData.append("teamB", p.id));
        formData.append("date", dateStr);
        await createMatch(formData);
        
        // Reset after submission
        setShowPreview(false);
        setSelectedIds([]);
        setDateStr("");
        setTeamA([]);
        setTeamB([]);
        setLoading(false);
      }} className="flex flex-col gap-4">
        
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-sm">
          Aşağıdaki kadrolar sistem tarafından otomatik dengelenmiştir. Dilerseniz <strong>⇄</strong> tuşuna basarak oyuncuları diğer takıma kaydırabilirsiniz.
        </div>

        <div className="flex gap-2">
          {/* Takım A Sütunu */}
          <div className="flex-1 flex flex-col gap-2" style={{ background: "rgba(59, 130, 246, 0.05)", padding: "0.75rem", borderRadius: "12px", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
            <div className="text-center mb-2">
              <strong style={{ color: "#3b82f6" }}>Takım A</strong>
              <div className="text-xs text-slate-500">Ortalama: {avgA}</div>
            </div>
            {teamA.map(p => (
              <div key={p.id} className="bg-white border rounded-lg p-2 flex justify-between items-center shadow-sm">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{p.name}</span>
                  <span className="text-xs text-slate-400">{p.positions} - Ort: {p.rating.toFixed(1)}</span>
                </div>
                <button type="button" onClick={() => swapToB(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition" title="B Takımına Gönder">
                  <ArrowLeftRight size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Takım B Sütunu */}
          <div className="flex-1 flex flex-col gap-2" style={{ background: "rgba(239, 68, 68, 0.05)", padding: "0.75rem", borderRadius: "12px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            <div className="text-center mb-2">
              <strong style={{ color: "#ef4444" }}>Takım B</strong>
              <div className="text-xs text-slate-500">Ortalama: {avgB}</div>
            </div>
            {teamB.map(p => (
              <div key={p.id} className="bg-white border rounded-lg p-2 flex justify-between items-center shadow-sm">
                <button type="button" onClick={() => swapToA(p)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition" title="A Takımına Gönder">
                  <ArrowLeftRight size={16} />
                </button>
                <div className="flex flex-col text-right">
                  <span className="text-sm font-bold">{p.name}</span>
                  <span className="text-xs text-slate-400">Ort: {p.rating.toFixed(1)} - {p.positions}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <button type="button" onClick={() => setShowPreview(false)} className="bg-slate-200 text-slate-700 font-bold px-4 py-3 rounded-full hover:bg-slate-300 transition-all shadow-sm" style={{ flex: 0.5 }}>
            İptal
          </button>
          <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
            {loading ? "Kaydediliyor..." : "Maçı Kaydet"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-bold block mb-1 text-slate-700">Maç Tarihi ve Saati</label>
        <input 
          type="datetime-local" 
          value={dateStr}
          onChange={(e) => setDateStr(e.target.value)}
          className="input-field mb-0" 
          required 
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-bold text-slate-700">Maça Gelecek Oyuncular</label>
          <div className="flex gap-2 items-center">
            {selectedIds.length === players.length && players.length > 0 ? (
              <button 
                type="button" 
                onClick={() => setSelectedIds([])} 
                className="text-xs text-red-500 hover:text-red-700 font-semibold"
              >
                Temizle
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => setSelectedIds(players.map(p => p.id))} 
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                Tümünü Seç
              </button>
            )}
            <span className="text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-600 font-bold">{selectedIds.length} / {players.length} Seçildi</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2" style={{ scrollbarWidth: "thin" }}>
          {players.map((p: any) => (
            <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
              selectedIds.includes(p.id) ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100 hover:bg-slate-50'
            }`}>
              <input 
                type="checkbox" 
                checked={selectedIds.includes(p.id)}
                onChange={() => togglePlayer(p.id)}
                style={{ width: "1.2rem", height: "1.2rem", accentColor: "var(--primary)" }} 
              />
              <div className="flex-1 flex flex-col">
                <span className={`font-bold text-sm ${selectedIds.includes(p.id) ? 'text-green-800' : 'text-slate-700'}`}>{p.name}</span>
                <span className="text-xs text-slate-400">{p.positions}</span>
              </div>
              <span className="text-xs font-bold text-primary bg-white px-2 py-1 rounded shadow-sm border border-slate-100">
                Ort: {p.rating.toFixed(1)}
              </span>
            </label>
          ))}
          {players.length === 0 && <span className="text-sm text-slate-400 text-center py-4">Önce sisteme oyuncu eklemelisiniz.</span>}
        </div>
      </div>

      <button 
        type="button" 
        onClick={generateDraft} 
        className="btn-primary mt-2 flex items-center justify-center gap-2"
        disabled={selectedIds.length < 2 || !dateStr}
      >
        <Users size={18} /> Kadroları Dağıt (Önizleme)
      </button>
      {selectedIds.length < 2 && (
        <p className="text-xs text-center text-slate-400">Takım kurabilmek için en az 2 kişi seçmelisiniz.</p>
      )}
    </div>
  );
}
