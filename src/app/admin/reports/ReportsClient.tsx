"use client";

import { ClipboardList, Calendar, CheckCircle2, AlertCircle, Star, ArrowRight, Trash2 } from "lucide-react";
import { deleteMatch } from "../matches/actions";
import Link from "next/link";

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

          // Katılımcı sayısı: herhangi bir oyuncuya oy veren max benzersiz kişi sayısı
          const uniqueVoters = match.votes ? new Set(match.votes.map((v: any) => v.voterId)).size : 0;
          
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
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Katılımcı</span>
                  <span className="block text-sm font-black text-black">{uniqueVoters} Kişi</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex justify-between items-center">
                <form action={async () => { 
                  if(confirm("Bu maçı silmek istediğinize emin misiniz? (Oylar ve maç verileri kalıcı olarak silinir!)")) {
                    await deleteMatch(match.id); 
                  }
                }}>
                  <button type="submit" className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 border border-red-100">
                    <Trash2 size={14} /> Maçı Sil
                  </button>
                </form>

                <Link href={`/admin/reports/${match.id}`} className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
                  Detaylı İncele <ArrowRight size={14} />
                </Link>
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
