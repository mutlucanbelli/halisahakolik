"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function loginPlayer(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  
  if (!username || !password) {
    return { error: "Lütfen kullanıcı adı ve şifrenizi girin." };
  }

  const normalizedUsername = username.trim().toLowerCase();
  
  const player = await prisma.player.findUnique({
    where: { username: normalizedUsername }
  });

  if (player && player.password === password) {
    const cookieStore = await cookies();
    cookieStore.set("player_session", player.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365, // 1 Yıl geçerli
      path: "/",
    });
    
    redirect("/player");
  } else {
    return { error: "Geçersiz kullanıcı adı veya şifre." };
  }
}

export async function logoutPlayer() {
  const cookieStore = await cookies();
  cookieStore.delete("player_session");
  redirect("/");
}

export async function submitLiveVote(matchId: string, voterId: string, targetId: string, rating: number) {
  const existingVote = await prisma.vote.findUnique({
    where: {
      matchId_voterId_targetId: { matchId, voterId, targetId }
    }
  });

  if (existingVote) {
    return { success: false, message: "Zaten oy kullandınız." };
  }

  await prisma.vote.create({
    data: { matchId, voterId, targetId, rating }
  });

  return { success: true };
}
