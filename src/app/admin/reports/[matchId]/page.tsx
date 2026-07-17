import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import MatchReportClient from "./MatchReportClient";

export default async function MatchReportPage({ params }: { params: Promise<{ matchId: string }> }) {
  const resolvedParams = await params;
  
  const match = await prisma.match.findUnique({
    where: { id: resolvedParams.matchId },
    include: {
      players: {
        include: { player: true }
      },
      votes: {
        include: {
          voter: true,
          target: true
        }
      }
    }
  });

  if (!match) return notFound();

  return <MatchReportClient match={match} />;
}
