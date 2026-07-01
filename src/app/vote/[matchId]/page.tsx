import prisma from "@/lib/prisma";
import VoteForm from "./VoteForm";

export default async function VotePage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      players: {
        include: { player: true }
      }
    }
  });

  if (!match) {
    return (
      <div className="container flex flex-col justify-center items-center h-screen">
        <div className="glass-panel text-center">
          <h2 className="title-sub" style={{ color: "var(--danger)" }}>Maç Bulunamadı</h2>
          <p className="text-sm">Geçersiz bir linke tıkladınız.</p>
        </div>
      </div>
    );
  }

  const now = new Date().getTime();
  const matchTime = match.date.getTime();
  const isCompleted = now >= matchTime + (60 * 60 * 1000);

  if (!isCompleted) {
    return (
      <div className="container flex flex-col justify-center items-center h-screen">
        <div className="glass-panel text-center">
          <h2 className="title-sub text-yellow-500">Maç Henüz Tamamlanmamış</h2>
          <p className="text-sm">
            Bu maç saat {new Date(matchTime + 60*60*1000).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})}'da oylamaya açılacaktır.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 flex-col flex gap-4 h-full">
      <div className="text-center">
        <h1 className="title-main text-2xl mb-1">Maç Sonu Oylaması</h1>
        <p className="text-sm font-medium text-slate-500">
          {match.date.toLocaleDateString('tr-TR')} Tarihli Maç
        </p>
      </div>

      <VoteForm matchId={match.id} matchPlayers={match.players} />
    </div>
  );
}
