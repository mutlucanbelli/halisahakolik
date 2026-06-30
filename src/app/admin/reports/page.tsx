import prisma from "@/lib/prisma";
import { deleteMatch } from "../matches/actions";
import { ClipboardList, ExternalLink, Calendar, CheckCircle2, AlertCircle } from "lucide-react";

export default async function ReportsPage() {
  const matches = await prisma.match.findMany({
    where: { status: "COMPLETED" },
    orderBy: { date: 'desc' },
    include: {
      players: {
        include: { player: true }
      },
      votes: true
    }
  });

  return (
    <div className="w-full flex flex-col gap-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col">
        <h1 className="text-3xl font-black text-black tracking-tight">Raporlar</h1>
        <p className="text-sm text-gray-500 font-medium">Tamamlanan maçların detayları ve oylama durumları</p>
      </div>

      <div className="flex flex-col gap-4">
        {matches.map((match: any) => {
          const teamA = match.players.filter((mp: any) => mp.team === 'A');
          const teamB = match.players.filter((mp: any) => mp.team === 'B');
          
          return (
            <div key={match.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
              
              {/* Card Header */}
              <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-black">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-black text-sm">{match.date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}</h3>
                    <p className="text-xs text-gray-500 font-medium">{match.date.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold">
                    <CheckCircle2 size={14} />
                    Tamamlandı
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

              {/* Card Footer (Actions) */}
              <div className="bg-white border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                
                <div className="flex items-center gap-4 text-sm w-full sm:w-auto">
                  <div className="flex items-center gap-2 text-gray-600 font-semibold">
                    <ClipboardList size={16} className="text-gray-400" />
                    Oy Kullanan: <span className="text-black font-black bg-gray-100 px-2 py-0.5 rounded">{new Set(match.votes?.map((v: any) => v.voterId)).size || 0} Kişi</span>
                  </div>
                  
                  <a href={`/vote/${match.id}`} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold transition-colors">
                    Oylama Linki <ExternalLink size={14} />
                  </a>
                </div>

                <div className="w-full sm:w-auto">
                  {new Date().getTime() < match.date.getTime() + (2 * 60 * 60 * 1000) ? (
                    <form action={async () => { "use server"; await deleteMatch(match.id); }}>
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
            <p className="text-sm text-gray-400 mt-1">Maçlar sekmesinden bir maçı bitirdiğinizde burada listelenecektir.</p>
          </div>
        )}
      </div>
    </div>
  );
}
