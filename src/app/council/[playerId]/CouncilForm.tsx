"use client";

import { useState } from "react";
import { submitCouncilVote } from "./actions";
import { CheckCircle2 } from "lucide-react";

const LABELS = {
  outfield: {
    shooting: "Şut",
    passing: "Pas",
    dribbling: "Dripling",
    defending: "Defans",
    physical: "Fizik",
    pace: "Hız"
  },
  gk: {
    shooting: "Refleks",
    passing: "Top Dağıtma",
    dribbling: "Birebir",
    defending: "Pozisyon Alma",
    physical: "Fizik",
    pace: "Çeviklik"
  }
};

export default function CouncilForm({ targetPlayer }: { targetPlayer: any }) {
  const [voterCode, setVoterCode] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [overall, setOverall] = useState<number>(50);
  const [stats, setStats] = useState({
    shooting: 50,
    passing: 50,
    dribbling: 50,
    defending: 50,
    physical: 50,
    pace: 50
  });

  const isGoalkeeper = targetPlayer.positions.includes("Kaleci");
  const currentLabels = isGoalkeeper ? LABELS.gk : LABELS.outfield;

  const handleOverallChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setOverall(val);
    setStats({
      shooting: val,
      passing: val,
      dribbling: val,
      defending: val,
      physical: val,
      pace: val
    });
  };

  const handleStatChange = (key: keyof typeof stats, value: string) => {
    const val = parseInt(value) || 0;
    setStats(prev => {
      const newStats = { ...prev, [key]: val };
      const avg = Math.round((newStats.shooting + newStats.passing + newStats.dribbling + newStats.defending + newStats.physical + newStats.pace) / 6);
      setOverall(avg);
      return newStats;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("targetId", targetPlayer.id);
      formData.append("voterCode", voterCode.toUpperCase());
      formData.append("shooting", stats.shooting.toString());
      formData.append("passing", stats.passing.toString());
      formData.append("dribbling", stats.dribbling.toString());
      formData.append("defending", stats.defending.toString());
      formData.append("physical", stats.physical.toString());
      formData.append("pace", stats.pace.toString());

      await submitCouncilVote(formData);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="glass-panel text-center flex flex-col items-center gap-3" style={{ padding: "3rem 1.5rem" }}>
        <CheckCircle2 size={48} style={{ color: "var(--primary)" }} />
        <h2 className="title-sub" style={{ margin: 0 }}>Oyunuz Kaydedildi!</h2>
        <p style={{ color: "#64748b", margin: 0, fontSize: "0.9rem" }}>
          Değerlendirmeniz başarıyla sisteme işlendi ve {targetPlayer.name} adlı oyuncunun özellikleri güncellendi.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel flex flex-col gap-3">
      
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#334155" }}>Sizin Oyuncu Kodunuz</label>
        <input 
          type="text" 
          value={voterCode}
          onChange={(e) => setVoterCode(e.target.value)}
          placeholder="Örn: A7X9P" 
          className="input-field" 
          style={{ marginBottom: "0.25rem" }}
          required 
        />
        <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>Kimliğinizi doğrulamak için sistemdeki mevcut kodunuzu girin.</p>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "0.75rem", borderRadius: "8px", fontSize: "0.875rem", fontWeight: "600", border: "1px solid #fee2e2", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <div style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(59,130,246,0.1) 100%)", border: "1px solid rgba(16,185,129,0.2)", padding: "1rem", borderRadius: "12px", marginBottom: "1.5rem" }}>
        <div className="flex justify-between items-center" style={{ marginBottom: "0.5rem" }}>
          <label style={{ fontSize: "0.875rem", fontWeight: "bold", color: "#334155" }}>Genel Ortalama (Overall)</label>
          <span style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--primary)" }}>{overall}</span>
        </div>
        <input 
          type="range" 
          value={overall} 
          onChange={handleOverallChange}
          style={{ width: "100%", accentColor: "var(--primary)" }} 
          min="1" max="100" 
        />
      </div>
      
      <div>
        <h3 style={{ fontSize: "0.875rem", fontWeight: "bold", color: "#334155", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
          {isGoalkeeper ? "Kaleci Özellikleri" : "Oyuncu Özellikleri"}
        </h3>
        <div className="flex flex-col gap-3">
          {Object.keys(stats).map((key) => {
            const statKey = key as keyof typeof stats;
            return (
              <div key={statKey} className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#475569" }}>{currentLabels[statKey]}</label>
                  <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--primary)", background: "#ecfdf5", padding: "0.25rem 0.5rem", borderRadius: "6px" }}>{stats[statKey]}</span>
                </div>
                <input 
                  type="range" 
                  value={stats[statKey]} 
                  onChange={e => handleStatChange(statKey, e.target.value)} 
                  style={{ width: "100%", accentColor: "#3b82f6" }} 
                  min="1" max="100" 
                  required 
                />
              </div>
            )
          })}
        </div>
      </div>

      <button type="submit" className="btn-primary" style={{ marginTop: "1.5rem" }} disabled={loading}>
        {loading ? "Kaydediliyor..." : "Oyu Gönder"}
      </button>
    </form>
  );
}
