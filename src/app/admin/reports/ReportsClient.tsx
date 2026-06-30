"use client";

import { useState } from "react";
import { ClipboardList, Calendar, CheckCircle2, AlertCircle, ExternalLink, Users, Star, TrendingUp } from "lucide-react";
import { deleteMatch } from "../matches/actions";

export default function ReportsClient({ matches, players }: { matches: any[], players: any[] }) {
  const [activeTab, setActiveTab] = useState<'matches' | 'players'>('matches');

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      
      {/* Header & Tabs */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight">Raporlar</h1>
          <p className="text-sm text-gray-500 font-medium">Sistemdeki tüm maç ve oyuncu detayları</p>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('matches')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'matches' 
                ? 'bg-white text-black shadow-sm' 
                : 'text-gray-500 hover:text-black hover:bg-gray-200/50'
            }`}
          >
            Maç Raporları
          </button>
          <button 
            onClick={() => setActiveTab('players')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'players' 
                ? 'bg-white text-black shadow-sm' 
                : 'text-gray-500 hover:text-black hover:bg-gray-200/50'
            }`}
          >
            Oyuncu Raporları
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'matches' && <MatchReportsTab matches={matches} />}
      {activeTab === 'players' && <PlayerReportsTab players={players} />}

    </div>
  );
}

function MatchReportsTab({ matches }: { matches: any[] }) {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {matches.map((match: any) => {
        const teamA = match.players.filter((mp: any) => mp.team === 'A');
        const teamB = match.players.filter((mp: any) => mp.team === 'B');

        // MVP Hesaplama (O maça ait tüm oyları topla)
        let mvpName = "Belirlenmedi";
        let mvpRating = 0;
        
        if (match.votes && match.votes.length > 0) {
          const scores: Record<string, { total: number, count: number, name: string }> = {};
          
          match.votes.forEach((v: any) => {
            if (!scores[v.targetId]) scores[v.targetId] = { total: 0, count: 0, name: v.target?.name || 'Bilinmiyor' };
            scores[v.targetId].total += v.rating;
            scores[v.targetId].count += 1;
          });

          let highest = 0;
          Object.values(scores).forEach(s => {
            const avg = s.total / s.count;
            if (avg > highest) {
              highest = avg;
              mvpName = s.name;
              mvpRating = Math.ceil(avg);
            }
          });
        }
        
        return (
          <div key={match.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
            {/* Card Header */}
            <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-black">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-black text-sm">{new Date(match.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}</h3>
                  <p className="text-xs text-gray-500 font-medium">{new Date(match.date).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold">
                  <CheckCircle2 size={14} /> Tamamlandı
                </span>
              </div>
            </div>

            {/* Card Body (Teams) */}
            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              <div className="hidden md:block absolute left-1/2 top-5 bottom-5 w-px bg-gray-100 -translate-x-1/2"></div>
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-100 rounded-full items-center justify-center text-[10px] font-black text-gray-400">VS</div>

              <div>
                <h4 className="font-black text-black mb-3">Takım A</h4>
                <div className="flex flex-col gap-2">
                  {teamA.map((mp: any) => (
                    <div key={mp.id} className="flex justify-between items-center text-sm px-3 py-2 bg-gray-50/50 rounded-lg border border-gray-100/50">
                      <span className="font-semibold text-gray-700">{mp.player.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-black text-black mb-3">Takım B</h4>
                <div className="flex flex-col gap-2">
                  {teamB.map((mp: any) => (
                    <div key={mp.id} className="flex justify-between items-center text-sm px-3 py-2 bg-gray-50/50 rounded-lg border border-gray-100/50">
                      <span className="font-semibold text-gray-700">{mp.player.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MVP & Votes Details */}
            <div className="bg-yellow-50/50 border-t border-yellow-100 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                  <Star size={18} className="fill-yellow-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Maçın Adamı (MVP)</span>
                  <span className="text-lg font-black text-black">{mvpName} {mvpRating > 0 && <span className="text-sm font-bold text-gray-400 ml-1">({mvpRating} Puan)</span>}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold bg-white px-4 py-2 border border-yellow-200 rounded-xl shadow-sm">
                <ClipboardList size={16} className="text-gray-400" />
                Toplam Kullanılan Oy: <span className="text-black font-black">{match.votes?.length || 0}</span>
              </div>
            </div>

            {/* Card Footer (Actions) */}
            <div className="bg-white border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row justify-end items-center gap-4">
              <div className="w-full sm:w-auto">
                {new Date().getTime() < new Date(match.date).getTime() + (2 * 60 * 60 * 1000) ? (
                  <form action={async () => { await deleteMatch(match.id); }}>
                    <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-all border border-red-200 text-red-600 bg-white hover:bg-red-50 hover:text-red-700 shadow-sm">
                      <AlertCircle size={14} /> İptal Et
                    </button>
                  </form>
                ) : (
                  <span className="w-full sm:w-auto flex items-center justify-center text-xs text-gray-400 font-semibold bg-gray-50 border border-gray-100 px-4 py-2 rounded-lg cursor-not-allowed" title="Maç saatinin üzerinden 2 saat geçtiği için iptal edilemez">
                    İptal Edilemez
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {matches.length === 0 && (
        <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
          <ClipboardList size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500 font-bold text-lg">Henüz maç raporu yok.</p>
        </div>
      )}
    </div>
  );
}

function PlayerReportsTab({ players }: { players: any[] }) {
  // OVR'ye göre sırala
  const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-bold">Oyuncu</th>
                <th className="p-4 font-bold text-center">Maç</th>
                <th className="p-4 font-bold text-center">Şut</th>
                <th className="p-4 font-bold text-center">Pas</th>
                <th className="p-4 font-bold text-center">Defans</th>
                <th className="p-4 font-bold text-center">Fizik</th>
                <th className="p-4 font-bold text-center">Hız</th>
                <th className="p-4 font-black text-right text-black">OVR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedPlayers.map((player) => (
                <tr key={player.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black text-white font-bold flex items-center justify-center text-xs">
                      {player.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-black text-sm">{player.name}</span>
                      <span className="text-[10px] text-gray-400 font-semibold">{player.positions}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center font-semibold text-gray-600">{player.matches?.length || 0}</td>
                  <td className="p-4 text-center font-semibold text-gray-600">{player.shooting || 0}</td>
                  <td className="p-4 text-center font-semibold text-gray-600">{player.passing || 0}</td>
                  <td className="p-4 text-center font-semibold text-gray-600">{player.defending || 0}</td>
                  <td className="p-4 text-center font-semibold text-gray-600">{player.physical || 0}</td>
                  <td className="p-4 text-center font-semibold text-gray-600">{player.pace || 0}</td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center justify-center px-3 py-1 bg-blue-50 text-blue-700 font-black rounded-lg border border-blue-100">
                      {Math.ceil(player.rating)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedPlayers.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              Sistemde henüz oyuncu bulunmuyor.
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
