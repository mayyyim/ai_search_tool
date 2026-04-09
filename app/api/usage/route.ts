import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import toolsData from "@/data/tools.json";

export async function GET() {
  if (!kv) return NextResponse.json({ usage: {} as Record<string, number> });

  const keys = toolsData.tools.map((t) => `tool_clicks:${t.id}`);
  const values = keys.length ? await kv.mget<number[]>(...keys) : [];

  const usage: Record<string, number> = {};
  toolsData.tools.forEach((t, i) => {
    const v = values[i];
    usage[t.id] = typeof v === "number" && Number.isFinite(v) ? v : 0;
  });

  return NextResponse.json({ usage });
}

