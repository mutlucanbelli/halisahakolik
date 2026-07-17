"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function changePassword(formData: FormData) {
  const playerId = formData.get("playerId") as string;
  const password = formData.get("password") as string;

  if (!playerId || !password) return { error: "Eksik bilgi." };

  await prisma.player.update({
    where: { id: playerId },
    data: { 
      password,
      mustChangePassword: false
    }
  });

  revalidatePath("/player");
  return { success: true };
}
