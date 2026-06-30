import prisma from "@/lib/prisma";
import { deletePlayer } from "./actions";
import PlayerForm from "./PlayerForm";
import PlayerEditModal from "./PlayerEditModal";
import CopyCouncilLink from "./CopyCouncilLink";
import PlayerCode from "./PlayerCode";
import { Trash2 } from "lucide-react";

export default async function PlayersPage() {
  const players = await prisma.player.findMany({
    orderBy: { createdAt: "desc" },
    include: { votesReceived: true }
  });

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight">Oyuncular</h1>
          <p className="text-sm text-gray-500 font-medium">Sistemdeki tüm kayıtlı oyuncular ({players.length})</p>
        </div>
        <div className="w-full sm:w-auto">
          <PlayerForm />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {players.map((player: any) => (
          <div key={player.id} className="group bg-white rounded-[20px] p-5 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col">
            
            {/* Top Section: Name, OVR, Code */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3 z-10">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-black text-xl text-black border border-gray-200 shadow-inner">
                  {player.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-black leading-tight">{player.name}</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{player.positions.split(',')[0]}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end z-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tighter text-black leading-none">{player.rating.toFixed(0)}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">OVR</span>
                </div>
                <PlayerCode code={player.code} />
              </div>
            </div>
            
            {/* Stats Grid - FIFA Style */}
            <div className="grid grid-cols-3 gap-x-2 gap-y-3 mt-2 mb-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
              <StatItem label="PAC" value={player.pace} />
              <StatItem label="SHO" value={player.shooting} />
              <StatItem label="PAS" value={player.passing} />
              <StatItem label="DRI" value={player.dribbling} />
              <StatItem label="DEF" value={player.defending} />
              <StatItem label="PHY" value={player.physical} />
            </div>

            {/* Actions Bar (Fades in on Hover on desktop, always visible on mobile but subtle) */}
            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity duration-300">
              <CopyCouncilLink playerId={player.id} />
              <div className="flex gap-2 items-center">
                <PlayerEditModal player={player} />
                <form action={async () => {
                  "use server";
                  await deletePlayer(player.id);
                }}>
                  <button type="submit" className="flex items-center justify-center w-8 h-8 rounded-lg border border-red-100 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all shadow-sm" title="Sil">
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
            </div>

            {/* Background Accent */}
            <div className="absolute -bottom-10 -right-10 text-[120px] font-black text-gray-50 opacity-[0.03] pointer-events-none select-none z-0 transform -rotate-12">
              {player.rating.toFixed(0)}
            </div>
          </div>
        ))}

        {players.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <p className="text-gray-500 font-medium">Sistemde henüz kayıtlı oyuncu yok.</p>
            <p className="text-xs text-gray-400 mt-1">Yukarıdaki butonu kullanarak ilk oyuncunuzu ekleyin.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Minimalist Stat Item Component
function StatItem({ label, value }: { label: string, value: number }) {
  // Determine color based on value (FIFA style)
  let colorClass = "text-gray-800";
  if (value >= 80) colorClass = "text-emerald-600";
  else if (value >= 70) colorClass = "text-blue-600";
  else if (value < 50) colorClass = "text-red-500";

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-black text-gray-400 w-6">{label}</span>
      <span className={`text-sm font-black ${colorClass}`}>{value}</span>
    </div>
  );
}
