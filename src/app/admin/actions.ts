"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  cookieStore.delete("admin_auth"); // If it exists
  redirect("/admin/login");
}

export async function resetDatabase() {
  // 1. Oyları sil
  await prisma.vote.deleteMany();
  
  // 2. Maçları ve kadroları sil
  await prisma.matchPlayer.deleteMany();
  await prisma.match.deleteMany();
  
  // 3. Oyuncuların özelliklerini sıfırla
  await prisma.player.updateMany({
    data: {
      rating_GK: 50,
      rating_DEF: 50,
      rating_MID: 50,
      rating_FWD: 50,
      rating: 50,
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/players");
  revalidatePath("/admin/matches");
  
  return { success: true };
}
