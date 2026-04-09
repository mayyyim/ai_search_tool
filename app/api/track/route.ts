import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { id?: string };
    const id = (body?.id || "").trim();
    if (!id) return NextResponse.json({ ok: false }, { status: 400 });

    if (kv) {
      await kv.incr(`tool_clicks:${id}`);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

