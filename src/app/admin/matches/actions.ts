"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createMatch(formData: FormData) {
  const dateStr = formData.get("date") as string;
  const teamAIds = formData.getAll("teamA") as string[];
  const teamBIds = formData.getAll("teamB") as string[];

  if (!dateStr || (teamAIds.length === 0 && teamBIds.length === 0)) return;

  await prisma.$transaction(async (tx: any) => {
    const match = await tx.match.create({
      data: {
        date: new Date(dateStr),
        status: "PENDING" // This status might be unused now, but we keep it for backward compatibility
      }
    });

    const matchPlayersData = [
      ...teamAIds.map(id => ({ matchId: match.id, playerId: id, team: "A" })),
      ...teamBIds.map(id => ({ matchId: match.id, playerId: id, team: "B" }))
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

export async function completeMatch(matchId: string) {
  await prisma.match.update({
    where: { id: matchId },
    data: { status: "COMPLETED" }
  });

  // Calculate MVP
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
       if (avg > highestAvg) {
          highestAvg = avg;
          mvp = { name: scores[tId].name, avg: Math.ceil(avg).toString() };
       }
    }
  }

  revalidatePath("/admin/matches");
  revalidatePath("/admin/reports");

  return { success: true, mvp };
}
