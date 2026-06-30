"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteVote(voteId: string, playerId: string) {
  try {
    await prisma.vote.delete({
      where: { id: voteId }
    });

    // O oyuncunun detay sayfasını yenile
    revalidatePath(`/admin/players/${playerId}`);
    return { success: true };
  } catch (error) {
    console.error("Oy silme hatası:", error);
    return { error: "Oy silinirken bir hata oluştu." };
  }
}
