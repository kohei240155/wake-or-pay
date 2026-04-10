import { NextRequest, NextResponse } from "next/server";
import { scheduleAlarm, cancelAlarm, findPendingAlarm } from "@/lib/qstash";

export async function GET() {
  try {
    const pending = await findPendingAlarm();

    if (!pending) {
      return NextResponse.json({ ok: true, alarm: null });
    }

    return NextResponse.json({
      ok: true,
      alarm: {
        alarmId: pending.alarmId,
        fireAt: pending.fireAt,
        messageId: pending.messageId,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unexpected error";
    return NextResponse.json(
      { ok: false, reason: message },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { alarmId?: string; fireAt?: number };
    const { alarmId, fireAt } = body;

    if (!alarmId || typeof alarmId !== "string") {
      return NextResponse.json(
        { ok: false, reason: "invalid_alarm_id" },
        { status: 400 }
      );
    }

    if (!fireAt || typeof fireAt !== "number") {
      return NextResponse.json(
        { ok: false, reason: "invalid_fire_at" },
        { status: 400 }
      );
    }

    if (fireAt <= Date.now()) {
      return NextResponse.json(
        { ok: false, reason: "past_time" },
        { status: 400 }
      );
    }

    const { messageId } = await scheduleAlarm(alarmId, fireAt);

    return NextResponse.json({ ok: true, messageId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unexpected error";
    return NextResponse.json(
      { ok: false, reason: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, reason: "missing_message_id" },
        { status: 400 }
      );
    }

    await cancelAlarm(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unexpected error";
    return NextResponse.json(
      { ok: false, reason: message },
      { status: 500 }
    );
  }
}
