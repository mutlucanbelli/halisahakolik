import prisma from "@/lib/prisma";
import PlayerForm from "./PlayerForm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

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

      <div className="flex flex-col gap-3">
        {players.map((player: any) => (
          <Link href={`/admin/players/${player.id}`} key={player.id} className="group bg-white rounded-2xl p-4 border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-center cursor-pointer active:scale-[0.98]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 group-hover:bg-blue-50 rounded-full flex items-center justify-center font-black text-lg text-black group-hover:text-blue-600 border border-gray-200 group-hover:border-blue-200 transition-colors">
                {player.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-lg text-black leading-tight group-hover:text-blue-700 transition-colors">{player.name}</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{player.positions.split(',')[0]}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black tracking-tighter text-black leading-none">{Math.ceil(player.rating)}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">OVR</span>
                </div>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" size={20} />
            </div>
          </Link>
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
