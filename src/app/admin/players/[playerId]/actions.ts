"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteCouncilVote(voteId: string, playerId: string) {
  try {
    await prisma.councilVote.delete({
      where: { id: voteId }
    });

    // Silindikten sonra kalan tüm konsey oylarını bulup oyuncunun puanını tekrar hesapla
    const allVotes = await prisma.councilVote.findMany({
      where: { targetId: playerId }
    });

    if (allVotes.length > 0) {
      const avgShooting = Math.round(allVotes.reduce((acc, curr) => acc + curr.shooting, 0) / allVotes.length);
      const avgPassing = Math.round(allVotes.reduce((acc, curr) => acc + curr.passing, 0) / allVotes.length);
      const avgDribbling = Math.round(allVotes.reduce((acc, curr) => acc + curr.dribbling, 0) / allVotes.length);
      const avgDefending = Math.round(allVotes.reduce((acc, curr) => acc + curr.defending, 0) / allVotes.length);
      const avgPhysical = Math.round(allVotes.reduce((acc, curr) => acc + curr.physical, 0) / allVotes.length);
      const avgPace = Math.round(allVotes.reduce((acc, curr) => acc + curr.pace, 0) / allVotes.length);
      const avgRating = allVotes.reduce((acc, curr) => acc + curr.rating, 0) / allVotes.length;

      await prisma.player.update({
        where: { id: playerId },
        data: {
          shooting: avgShooting, passing: avgPassing, dribbling: avgDribbling,
          defending: avgDefending, physical: avgPhysical, pace: avgPace, rating: avgRating
        }
      });
    } else {
      // Eğer hiç oy kalmadıysa 0'la veya varsayılana çek
      await prisma.player.update({
        where: { id: playerId },
        data: {
          shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0, pace: 0, rating: 0
        }
      });
    }

    revalidatePath(`/admin/players/${playerId}`);
    revalidatePath(`/admin/players`);
    return { success: true };
  } catch (error) {
    console.error("Oy silme hatası:", error);
    return { error: "Oy silinirken bir hata oluştu." };
  }
}
