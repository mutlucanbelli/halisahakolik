import prisma from "@/lib/prisma";
import PlayerForm from "./PlayerForm";
import PlayerListClient from "./PlayerListClient";

export default async function PlayersPage() {
  const players = await prisma.player.findMany({
    orderBy: { createdAt: "desc" },
    include: { votesReceived: true }
  });

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight">Oyuncular</h1>
          <p className="text-sm text-gray-500 font-medium">Sistemdeki tüm kayıtlı oyuncular ({players.length})</p>
        </div>
        <div className="w-full sm:w-auto">
          <PlayerForm />
        </div>
      </div>

      {players.length === 0 ? (
        <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
          <p className="text-gray-500 font-medium">Sistemde henüz kayıtlı oyuncu yok.</p>
          <p className="text-xs text-gray-400 mt-1">Yukarıdaki butonu kullanarak ilk oyuncunuzu ekleyin.</p>
        </div>
      ) : (
        <PlayerListClient initialPlayers={players as any} />
      )}
    </div>
  );
}
