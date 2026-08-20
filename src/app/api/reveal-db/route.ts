import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "NOT_FOUND";
  return NextResponse.json({ databaseUrl: dbUrl });
}
