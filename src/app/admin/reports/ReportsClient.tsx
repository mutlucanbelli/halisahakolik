"use client";

import { ClipboardList, Calendar, CheckCircle2, AlertCircle, Star } from "lucide-react";
import { deleteMatch } from "../matches/actions";

export default function ReportsClient({ matches }: { matches: any[] }) {
  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-black tracking-tight">Maç Raporları</h1>
        <p className="text-sm text-gray-500 font-medium">Sistemdeki tamamlanmış tüm maçlar</p>
      </div>

      <div className="flex flex-col gap-4 animate-fade-in">
        {matches.map((match: any) => {
          const teamA = match.players.filter((mp: any) => mp.team === 'A');
          const teamB = match.players.filter((mp: any) => mp.team === 'B');

          // MVP Hesaplama
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
            <div key={match.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
              {/* Card Header */}
              <div className="bg-gray-50/50 border-b border-gray-100 px-5 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-black shadow-sm">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-black text-sm">{new Date(match.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}</h3>
                    <p className="text-xs text-gray-500 font-medium">{new Date(match.date).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold shadow-sm">
                    <CheckCircle2 size={14} /> Tamamlandı
                  </span>
                </div>
              </div>

              {/* MVP Banner */}
              <div className="bg-yellow-50/50 border-b border-yellow-100 px-5 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center shadow-inner">
                    <Star size={14} className="fill-yellow-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider">Maçın Adamı (MVP)</span>
                    <span className="text-sm font-black text-black">{mvpName} {mvpRating > 0 && <span className="text-xs font-bold text-gray-400 ml-1">({mvpRating})</span>}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Kullanılan Oy</span>
                  <span className="block text-sm font-black text-black">{match.votes?.length || 0}</span>
                </div>
              </div>

              {/* Card Body (Teams - Mobile Optimized) */}
              <div className="px-5 py-4 flex flex-col gap-4">
                <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50">
                  <h4 className="font-black text-blue-800 text-xs uppercase tracking-wider mb-2">Takım A (Mavi)</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {teamA.map((mp: any) => (
                      <span key={mp.id} className="text-xs font-semibold px-2 py-1 bg-white border border-blue-100 text-blue-700 rounded-md shadow-sm">
                        {mp.player.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-red-50/50 rounded-xl p-3 border border-red-100/50">
                  <h4 className="font-black text-red-800 text-xs uppercase tracking-wider mb-2">Takım B (Kırmızı)</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {teamB.map((mp: any) => (
                      <span key={mp.id} className="text-xs font-semibold px-2 py-1 bg-white border border-red-100 text-red-700 rounded-md shadow-sm">
                        {mp.player.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex justify-end">
                {new Date().getTime() < new Date(match.date).getTime() + (2 * 60 * 60 * 1000) ? (
                  <form action={async () => { await deleteMatch(match.id); }}>
                    <button type="submit" className="flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all border border-red-200 text-red-600 bg-white hover:bg-red-50 hover:text-red-700 shadow-sm">
                      <AlertCircle size={14} /> Maçı İptal Et
                    </button>
                  </form>
                ) : (
                  <span className="flex items-center justify-center text-xs text-gray-400 font-semibold px-4 py-2 rounded-lg cursor-not-allowed">
                    İptal Süresi Doldu
                  </span>
                )}
              </div>
            </div>
          );
        })}
        
        {matches.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <ClipboardList size={40} className="text-gray-300 mb-3" />
            <p className="text-gray-500 font-bold text-base">Henüz tamamlanmış maç yok.</p>
          </div>
        )}
      </div>

    </div>
  );
}
