import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { executePunishment } from "@/lib/openai-punish";

export async function POST(request: NextRequest) {
  // --- 1. Upstash 署名検証 ---
  const signature = request.headers.get("upstash-signature") ?? "";
  const body = await request.text();

  const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
  });

  try {
    await receiver.verify({ signature, body });
  } catch {
    return NextResponse.json(
      { ok: false, reason: "invalid_signature" },
      { status: 401 },
    );
  }

  // --- 2. OPENAI_API_KEY チェック ---
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { ok: false, reason: "openai_key_missing" },
      { status: 500 },
    );
  }

  // --- 3. body パース ---
  let alarmId: string;
  try {
    const parsed: unknown = JSON.parse(body);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("alarmId" in parsed) ||
      typeof (parsed as Record<string, unknown>).alarmId !== "string"
    ) {
      throw new Error("alarmId is required");
    }
    alarmId = (parsed as Record<string, unknown>).alarmId as string;
  } catch {
    return NextResponse.json(
      { ok: false, reason: "invalid_body" },
      { status: 400 },
    );
  }

  // --- 4-6. OpenAI 呼び出し & ログ ---
  const result = await executePunishment(alarmId);

  if (result.success) {
    console.log(
      `[punish] alarmId=${alarmId} status=success promptTokens=${result.promptTokens} model=gpt-4o`,
    );
    return NextResponse.json({ ok: true });
  }

  console.log(
    `[punish] alarmId=${alarmId} status=error reason=${result.error}`,
  );
  return NextResponse.json(
    { ok: false, reason: result.error },
    { status: 500 },
  );
}
