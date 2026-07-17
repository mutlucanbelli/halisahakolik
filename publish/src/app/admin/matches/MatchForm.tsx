"use client";

import { useState } from "react";
import { createMatch } from "./actions";
import { ArrowLeftRight, Users, Calendar, Clock, Shirt } from "lucide-react";
import PitchView from "@/components/PitchView";

export default function MatchForm({ players }: { players: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Hangi oyuncunun hangi mevkide oynayacağı bilgisi:
  const [selectedPositions, setSelectedPositions] = useState<Record<string, string>>({});
  
  // Varsayılan tarihi bugün olarak ayarla (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  const [dateStr, setDateStr] = useState(today);
  
  const [hourStr, setHourStr] = useState("20:00");
  const [teamA, setTeamA] = useState<any[]>([]);
  const [teamB, setTeamB] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePlayer = (id: string, defaultPos: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(pid => pid !== id));
      const newPos = { ...selectedPositions };
      delete newPos[id];
      setSelectedPositions(newPos);
    } else {
      setSelectedIds([...selectedIds, id]);
      setSelectedPositions({ ...selectedPositions, [id]: defaultPos });
    }
  };

  const updatePosition = (id: string, pos: string) => {
    setSelectedPositions({ ...selectedPositions, [id]: pos });
  };

  const generateDraft = () => {
    if (!dateStr || !hourStr || selectedIds.length === 0) return;

    const selectedPlayers = players
      .filter(p => selectedIds.includes(p.id))
      .map(p => ({ ...p, positions: selectedPositions[p.id] || p.positions.split(',')[0].trim() }));

    const getPosRating = (p: any) => {
      const pos = (p.positions || "").toLowerCase();
      if (pos.includes("kaleci") || pos.includes("gk")) return p.rating_GK;
      if (pos.includes("defans") || pos.includes("stoper") || pos.includes("bek")) return p.rating_DEF;
      if (pos.includes("forvet") || pos.includes("santrfor") || pos.includes("kanat")) return p.rating_FWD;
      return p.rating_MID;
    };

    const getPosCategory = (pos: string) => {
      const p = (pos || "").toLowerCase();
      if (p.includes("kaleci") || p.includes("gk")) return "GK";
      if (p.includes("defans") || p.includes("stoper") || p.includes("bek")) return "DEF";
      if (p.includes("forvet") || p.includes("santrfor") || p.includes("kanat")) return "FWD";
      return "MID";
    };

    const N = selectedPlayers.length;
    
    // 22 kişiden fazlaysa (çok nadir) tarayıcıyı dondurmamak için hızlı greedy algoritması
    if (N > 22) {
      const sorted = [...selectedPlayers].sort((a, b) => getPosRating(b) - getPosRating(a));
      const a: any[] = [];
      const b: any[] = [];
      let sumA = 0; let sumB = 0;
      sorted.forEach(p => {
        if (a.length >= Math.ceil(N/2)) { b.push(p); sumB += getPosRating(p); }
        else if (b.length >= Math.ceil(N/2)) { a.push(p); sumA += getPosRating(p); }
        else if (sumA <= sumB) { a.push(p); sumA += getPosRating(p); }
        else { b.push(p); sumB += getPosRating(p); }
      });
      setTeamA(a);
      setTeamB(b);
      setShowPreview(true);
      return;
    }

    // --- YAPAY ZEKA DESTEKLİ MATEMATİKSEL KOMBİNASYON ALGORİTMASI ---
    const half = Math.ceil(N / 2);
    let bestScore = Infinity;
    let eliteCombinations: { teamA: number[], score: number }[] = [];

    const totalSum = selectedPlayers.reduce((s, p) => s + getPosRating(p), 0);

    const playersWithData = selectedPlayers.map(p => ({
      ...p,
      _rating: getPosRating(p),
      _cat: getPosCategory(p.positions)
    }));

    let gk_tot = 0, def_tot = 0, mid_tot = 0, fwd_tot = 0;
    for (let i=0; i<N; i++) {
      const c = playersWithData[i]._cat;
      if (c === "GK") gk_tot++;
      else if (c === "DEF") def_tot++;
      else if (c === "MID") mid_tot++;
      else fwd_tot++;
    }

    const evaluate = (teamAIndices: number[]) => {
      let sumA = 0;
      let gk_a = 0, def_a = 0, mid_a = 0, fwd_a = 0;
      
      for (let i = 0; i < teamAIndices.length; i++) {
        const p = playersWithData[teamAIndices[i]];
        sumA += p._rating;
        if (p._cat === "GK") gk_a++;
        else if (p._cat === "DEF") def_a++;
        else if (p._cat === "MID") mid_a++;
        else fwd_a++;
      }

      const sumB = totalSum - sumA;
      const ratingDiff = Math.abs(sumA - sumB);

      const gk_b = gk_tot - gk_a;
      const def_b = def_tot - def_a;
      const mid_b = mid_tot - mid_a;
      const fwd_b = fwd_tot - fwd_a;

      const posDiff = Math.abs(gk_a - gk_b) + Math.abs(def_a - def_b) + Math.abs(mid_a - mid_b) + Math.abs(fwd_a - fwd_b);

      // Öncelik OVERALL (ratingDiff). Ancak mevki sapmaları da dikkate alınıyor (posDiff * 3)
      // 3 puanlık overall fark feda edilerek 1 mevki hatası düzeltilebilir.
      const score = ratingDiff + (posDiff * 3);

      if (score < bestScore) {
        bestScore = score;
        // Yeni bir en iyi skor bulduğumuzda, havuzu temizle (en iyi skora çok yakın olanları tut)
        eliteCombinations = eliteCombinations.filter(c => c.score <= bestScore + 3);
        eliteCombinations.push({ teamA: [...teamAIndices], score });
      } else if (score <= bestScore + 3) {
        // En iyi skora maksimum 3 puan uzaklıktaysa (yani neredeyse eşitse) bu ihtimali de listeye al
        eliteCombinations.push({ teamA: [...teamAIndices], score });
      }
    };

    const getCombinations = (start: number, currentCombo: number[]) => {
      if (currentCombo.length === half) {
        evaluate(currentCombo);
        return;
      }
      if (currentCombo.length + (N - start) < half) return;

      for (let i = start; i < N; i++) {
        currentCombo.push(i);
        getCombinations(i + 1, currentCombo);
        currentCombo.pop();
      }
    };

    getCombinations(0, []);

    // Elit (neredeyse kusursuz) kombinasyonlar havuzundan RASTGELE birini seç
    // Bu sayede aynı oyuncular seçilse bile her seferinde farklı bir adil dağılım çıkar
    const randomIndex = Math.floor(Math.random() * eliteCombinations.length);
    const chosenCombo = eliteCombinations[randomIndex].teamA;

    const finalTeamA = chosenCombo.map(idx => selectedPlayers[idx]);
    const finalTeamB = [];
    for (let i = 0; i < N; i++) {
      if (!chosenCombo.includes(i)) finalTeamB.push(selectedPlayers[i]);
    }

    // Takımları kendi içinde en yüksek reytingden düşüğe sırala ki ekranda güzel görünsün
    finalTeamA.sort((a, b) => getPosRating(b) - getPosRating(a));
    finalTeamB.sort((a, b) => getPosRating(b) - getPosRating(a));

    setTeamA(finalTeamA);
    setTeamB(finalTeamB);
    setShowPreview(true);
  };

  const getPosRating = (p: any) => {
    const pos = (p.positions || "").toLowerCase();
    if (pos.includes("kaleci") || pos.includes("gk")) return p.rating_GK;
    if (pos.includes("defans") || pos.includes("stoper") || pos.includes("bek")) return p.rating_DEF;
    if (pos.includes("forvet") || pos.includes("santrfor") || pos.includes("kanat")) return p.rating_FWD;
    return p.rating_MID;
  };

  const swapToB = (player: any) => {
    setTeamA(teamA.filter(p => p.id !== player.id));
    setTeamB([...teamB, player].sort((a, b) => getPosRating(b) - getPosRating(a)));
  };

  const swapToA = (player: any) => {
    setTeamB(teamB.filter(p => p.id !== player.id));
    setTeamA([...teamA, player].sort((a, b) => getPosRating(b) - getPosRating(a)));
  };

  if (showPreview) {
    const finalDateTime = `${dateStr}T${hourStr}`;
    const avgA = teamA.length > 0 ? Math.ceil(teamA.reduce((sum, p) => sum + getPosRating(p), 0) / teamA.length) : 0;
    const avgB = teamB.length > 0 ? Math.ceil(teamB.reduce((sum, p) => sum + getPosRating(p), 0) / teamB.length) : 0;

    return (
      <form action={async (formData) => {
        setLoading(true);
        teamA.forEach(p => formData.append("teamA", JSON.stringify({ id: p.id, position: p.positions })));
        teamB.forEach(p => formData.append("teamB", JSON.stringify({ id: p.id, position: p.positions })));
        formData.append("date", finalDateTime);
        await createMatch(formData);
        
        setShowPreview(false);
        setSelectedIds([]);
        setDateStr("");
        setTeamA([]);
        setTeamB([]);
        setLoading(false);
      }} className="flex flex-col gap-4">
        
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-sm">
          Kadro, oyuncuların <strong>güçlerine ve seçilen mevkilerine göre</strong> dengeli şekilde dağıtıldı. İsterseniz aşağıdaki listeden manuel değişiklik yapabilirsiniz.
        </div>

        {/* Pitch View */}
        <div className="w-full">
          <PitchView teamA={teamA} teamB={teamB} />
        </div>

        {/* Swap List */}
        <div className="flex gap-2 mt-4 w-full">
          {/* Takım A Sütunu */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="text-center mb-1 text-xs">
              <strong className="text-blue-600">Takım A (Mavi)</strong>
              <div className="text-slate-500">OVR: {avgA}</div>
            </div>
            {teamA.map(p => (
              <div key={p.id} className="bg-white border rounded-lg p-2 flex justify-between items-center shadow-sm">
                <div className="flex flex-col">
                  <span className="text-xs font-bold">{p.name} <span className="text-[10px] text-gray-400 font-normal">({Math.ceil(getPosRating(p))})</span></span>
                  <span className="text-[9px] text-slate-400 uppercase">{p.positions}</span>
                </div>
                <button type="button" onClick={() => swapToB(p)} className="p-1 text-blue-500 hover:bg-blue-50 rounded-full transition" title="B Takımına Gönder">
                  <ArrowLeftRight size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Takım B Sütunu */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="text-center mb-1 text-xs">
              <strong className="text-red-500">Takım B (Kırmızı)</strong>
              <div className="text-slate-500">OVR: {avgB}</div>
            </div>
            {teamB.map(p => (
              <div key={p.id} className="bg-white border rounded-lg p-2 flex justify-between items-center shadow-sm">
                <button type="button" onClick={() => swapToA(p)} className="p-1 text-red-500 hover:bg-red-50 rounded-full transition" title="A Takımına Gönder">
                  <ArrowLeftRight size={14} />
                </button>
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold"><span className="text-[10px] text-gray-400 font-normal">({Math.ceil(getPosRating(p))})</span> {p.name}</span>
                  <span className="text-[9px] text-slate-400 uppercase">{p.positions}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <button type="button" onClick={() => setShowPreview(false)} className="bg-slate-200 text-slate-700 font-bold px-4 py-4 rounded-xl hover:bg-slate-300 transition-all shadow-sm" style={{ flex: 0.5 }}>
            Geri Dön
          </button>
          <button type="submit" className="flex-1 bg-black text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98]" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Maçı Kesinleştir"}
          </button>
        </div>
      </form>
    );
  }

  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-xs font-bold block mb-1 text-slate-700 flex items-center gap-1"><Calendar size={14} /> Maç Tarihi</label>
          <input 
            type="date" 
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="input-field mb-0 w-full" 
            required 
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-bold block mb-1 text-slate-700 flex items-center gap-1"><Clock size={14} /> Maç Saati (Tam)</label>
          <select 
            value={hourStr}
            onChange={(e) => setHourStr(e.target.value)}
            className="input-field mb-0 w-full bg-white" 
            required
          >
            {hours.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-bold text-slate-700">Maça Gelecek Oyuncular</label>
          <div className="flex gap-2 items-center">
            {selectedIds.length === players.length && players.length > 0 ? (
              <button 
                type="button" 
                onClick={() => {
                  setSelectedIds([]);
                  setSelectedPositions({});
                }} 
                className="text-xs text-red-500 hover:text-red-700 font-semibold"
              >
                Temizle
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => {
                  setSelectedIds(players.map(p => p.id));
                  const newPos: Record<string, string> = {};
                  players.forEach(p => newPos[p.id] = p.positions.split(',')[0].trim());
                  setSelectedPositions(newPos);
                }} 
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                Tümünü Seç
              </button>
            )}
            <span className="text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-600 font-bold">{selectedIds.length} / {players.length} Seçildi</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-2" style={{ scrollbarWidth: "thin" }}>
          {players.map((p: any) => {
            const isSelected = selectedIds.includes(p.id);
            const availablePositions = p.positions.split(',').map((pos: string) => pos.trim());
            const defaultPos = availablePositions[0];

            return (
              <div key={p.id} className={`flex flex-col gap-2 p-3 rounded-xl border transition-colors ${
                isSelected ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 hover:bg-slate-50'
              }`}>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={() => togglePlayer(p.id, defaultPos)}
                    className="w-5 h-5 accent-emerald-500 cursor-pointer" 
                  />
                  <div className="flex-1 flex flex-col cursor-pointer" onClick={() => togglePlayer(p.id, defaultPos)}>
                    <span className={`font-bold text-sm ${isSelected ? 'text-emerald-800' : 'text-slate-700'}`}>{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{p.positions}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded shadow-sm border border-slate-200">
                    OVR {Math.ceil(p.rating)}
                  </span>
                </div>
                
                {/* Mevki Seçimi (Yalnızca Seçiliyse) */}
                {isSelected && (
                  <div className="ml-8 flex items-center gap-2 mt-1 animate-fade-in">
                    <Shirt size={14} className="text-emerald-600" />
                    <select 
                      value={selectedPositions[p.id] || defaultPos}
                      onChange={(e) => updatePosition(p.id, e.target.value)}
                      className="text-xs font-bold bg-white border border-emerald-200 text-emerald-800 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {availablePositions.map((pos: string) => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
          {players.length === 0 && <span className="text-sm text-slate-400 text-center py-4">Önce sisteme oyuncu eklemelisiniz.</span>}
        </div>
      </div>

      <button 
        type="button" 
        onClick={generateDraft} 
        className="w-full bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-2 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed"
        disabled={selectedIds.length < 2 || !dateStr || !hourStr}
      >
        <Users size={18} /> Kadroları Dağıt ve Önizle
      </button>
    </div>
  );
}
