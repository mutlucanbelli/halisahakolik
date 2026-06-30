"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitCouncilVote(formData: FormData) {
  const targetId = formData.get("targetId") as string;
  const voterCode = formData.get("voterCode") as string;
  
  const shooting = parseInt(formData.get("shooting") as string);
  const passing = parseInt(formData.get("passing") as string);
  const dribbling = parseInt(formData.get("dribbling") as string);
  const defending = parseInt(formData.get("defending") as string);
  const physical = parseInt(formData.get("physical") as string);
  const pace = parseInt(formData.get("pace") as string);

  // 1. Oyu veren kişiyi bul
  const voter = await prisma.player.findUnique({
    where: { code: voterCode }
  });

  if (!voter) {
    throw new Error("Geçersiz oyuncu kodu!");
  }

  if (voter.id === targetId) {
    throw new Error("Kendinize oy veremezsiniz!");
  }

  const rating = (shooting + passing + dribbling + defending + physical + pace) / 6;

  // 2. Oyu kaydet veya güncelle
  await prisma.councilVote.upsert({
    where: { voterId_targetId: { voterId: voter.id, targetId } },
    create: {
      voterId: voter.id,
      targetId,
      shooting, passing, dribbling, defending, physical, pace, rating
    },
    update: {
      shooting, passing, dribbling, defending, physical, pace, rating
    }
  });

  // 3. Hedef oyuncunun yeni ortalamasını hesapla ve güncelle
  const allVotes = await prisma.councilVote.findMany({
    where: { targetId }
  });

  const avgShooting = Math.round(allVotes.reduce((acc, curr) => acc + curr.shooting, 0) / allVotes.length);
  const avgPassing = Math.round(allVotes.reduce((acc, curr) => acc + curr.passing, 0) / allVotes.length);
  const avgDribbling = Math.round(allVotes.reduce((acc, curr) => acc + curr.dribbling, 0) / allVotes.length);
  const avgDefending = Math.round(allVotes.reduce((acc, curr) => acc + curr.defending, 0) / allVotes.length);
  const avgPhysical = Math.round(allVotes.reduce((acc, curr) => acc + curr.physical, 0) / allVotes.length);
  const avgPace = Math.round(allVotes.reduce((acc, curr) => acc + curr.pace, 0) / allVotes.length);
  
  const avgRating = allVotes.reduce((acc, curr) => acc + curr.rating, 0) / allVotes.length;

  await prisma.player.update({
    where: { id: targetId },
    data: {
      shooting: avgShooting,
      passing: avgPassing,
      dribbling: avgDribbling,
      defending: avgDefending,
      physical: avgPhysical,
      pace: avgPace,
      rating: avgRating
    }
  });

  revalidatePath(`/admin/players`);
  revalidatePath(`/council/${targetId}`);
}
