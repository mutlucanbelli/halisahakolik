import prisma from "@/lib/prisma";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
  const matches = await prisma.match.findMany({
    where: { status: "COMPLETED" },
    orderBy: { date: 'desc' },
    include: {
      players: {
        include: { player: true }
      },
      votes: {
        include: { target: true }
      }
    }
  });

  const players = await prisma.player.findMany({
    include: {
      matches: true
    }
  });

  return (
    <ReportsClient matches={matches} players={players} />
  );
}
