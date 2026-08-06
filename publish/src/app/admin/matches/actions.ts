"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createMatch(formData: FormData) {
  const dateStr = formData.get("date") as string;
  const teamAData = formData.getAll("teamA") as string[];
  const teamBData = formData.getAll("teamB") as string[];

  if (!dateStr || (teamAData.length === 0 && teamBData.length === 0)) return;

  const teamA = teamAData.map(d => JSON.parse(d));
  const teamB = teamBData.map(d => JSON.parse(d));

  await prisma.$transaction(async (tx: any) => {
    const match = await tx.match.create({
      data: {
        date: new Date(dateStr),
        status: "PENDING"
      }
    });

    const matchPlayersData = [
      ...teamA.map(p => ({ matchId: match.id, playerId: p.id, team: "A", position: p.position })),
      ...teamB.map(p => ({ matchId: match.id, playerId: p.id, team: "B", position: p.position }))
    ];

    await Promise.all(
      matchPlayersData.map(data => 
        tx.matchPlayer.create({ data })
      )
    );
  });

  revalidatePath("/admin/matches");
}

export async function deleteMatch(matchId: string) {
  await prisma.$transaction([
    prisma.matchPlayer.deleteMany({ where: { matchId } }),
    prisma.vote.deleteMany({ where: { matchId } }),
    prisma.match.delete({ where: { id: matchId } })
  ]);
  revalidatePath("/admin/matches");
  revalidatePath("/admin/reports");
}

export async function startVoting(matchId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return;

  const matchTime = new Date(match.date).getTime();
  const allowedTime = matchTime + 60000; // Maç saatinden 1 dk sonrası

  if (Date.now() < allowedTime) {
    return; // Maç saatinden 1 dk geçmeden oylama başlatılamaz
  }

  await prisma.match.update({
    where: { id: matchId },
    data: { status: "VOTING", activeVotePlayerId: null }
  });
  revalidatePath("/admin/matches");
}

export async function setActiveVotePlayer(matchId: string, playerId: string | null) {
  await prisma.match.update({
    where: { id: matchId },
    data: { activeVotePlayerId: playerId }
  });
  revalidatePath("/admin/matches");
}

export async function completeMatch(matchId: string) {
  // 1. Maçı tamamla
  await prisma.match.update({
    where: { id: matchId },
    data: { status: "COMPLETED", activeVotePlayerId: null }
  });

  // 2. Oyları hesapla ve oyunculara mevki bazlı dağıt
  const votes = await prisma.vote.findMany({
    where: { matchId },
    include: { target: true }
  });
  
  let mvp = null;
  if (votes.length > 0) {
    const scores: Record<string, { total: number; count: number; name: string }> = {};
    for (const v of votes) {
       if (!scores[v.targetId]) scores[v.targetId] = { total: 0, count: 0, name: v.target.name };
       scores[v.targetId].total += v.rating;
       scores[v.targetId].count += 1;
    }
    
    let highestAvg = 0;
    for (const tId in scores) {
       const avg = scores[tId].total / scores[tId].count;
       
       // MVP Belirleme
       if (avg > highestAvg) {
          highestAvg = avg;
          mvp = { name: scores[tId].name, avg: Math.ceil(avg).toString() };
       }

       // Oyuncuyu ve oynadığı mevkiyi bul
       const player = await prisma.player.findUnique({ where: { id: tId } });
       const matchPlayer = await prisma.matchPlayer.findUnique({
         where: { matchId_playerId: { matchId, playerId: tId } }
       });

       if (player && matchPlayer) {
         // Yeni Overall Hesaplama (Ana Mevkiye göre)
         // --- ARTIK OTOMATİK GÜNCELLEME YAPMIYORUZ ---
         // Puanlar sadece MatchPlayer üzerinde birikiyor. Admin "Puanları Dağıt" diyene kadar overall sabit.

         await prisma.matchPlayer.update({
           where: { id: matchPlayer.id },
           data: { earnedRating: avg }
         });
       }
    }
  }

  revalidatePath("/admin/matches");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/players");

  return { success: true, mvp };
}
