import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import CouncilForm from "./CouncilForm";

export default async function CouncilVotePage({ params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = await params;
  
  const targetPlayer = await prisma.player.findUnique({
    where: { id: playerId }
  });

  if (!targetPlayer) {
    notFound();
  }

  // Yeni oyuncunun henüz konsey tarafından hiç puanlanıp puanlanmadığını bulalım
  const votes = await prisma.councilVote.findMany({
    where: { targetId: targetPlayer.id }
  });

  return (
    <main className="container py-8 flex flex-col gap-6" style={{ minHeight: "calc(100vh - 70px)" }}>
      
      <div className="text-center">
        <h1 className="title-main mb-1 text-2xl">Konsey Değerlendirmesi</h1>
        <p className="text-slate-500 text-sm">
          Aşağıdaki oyuncunun güçlerini konsey olarak değerlendirin.
        </p>
      </div>

      <div className="glass-panel text-center p-4">
        <h2 className="text-xl font-bold text-primary mb-1">{targetPlayer.name}</h2>
        <p className="text-sm text-slate-500 font-semibold mb-3">{targetPlayer.positions}</p>
        
        <div className="flex justify-center items-center gap-2 text-xs">
          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100">
            Mevcut Konsey Oyu: {votes.length}
          </span>
          {votes.length > 0 && (
            <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-100">
              Ortalama: {targetPlayer.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      <CouncilForm targetPlayer={targetPlayer} />

    </main>
  );
}
