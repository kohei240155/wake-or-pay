import { Client } from "@upstash/qstash";

const client = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export async function scheduleAlarm(
  alarmId: string,
  fireAt: number
): Promise<{ messageId: string }> {
  const result = await client.publishJSON({
    url: `${process.env.APP_BASE_URL}/api/punish`,
    body: { alarmId },
    notBefore: Math.floor(fireAt / 1000),
  });

  return { messageId: result.messageId };
}

export async function cancelAlarm(messageId: string): Promise<void> {
  try {
    await client.messages.cancel(messageId);
  } catch (e) {
    // "not found" = 既に配信済み or キャンセル済み → 正常扱い
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("not found")) return;
    throw e;
  }
}

export interface PendingAlarm {
  messageId: string;
  alarmId: string;
  fireAt: number; // Unixミリ秒
}

/** 終了状態: これらの状態のメッセージはもうキャンセルできない */
const TERMINAL_STATES = new Set([
  "DELIVERED",
  "ERROR",
  "FAILED",
  "CANCELLED",
  "CANCEL_REQUESTED",
]);

/**
 * QStash のログから未実行（配信待ち）のアラームを検索する。
 * localStorage を失った場合のリカバリー用。
 */
export async function findPendingAlarm(): Promise<PendingAlarm | null> {
  const punishUrl = `${process.env.APP_BASE_URL}/api/punish`;

  const res = await client.logs();

  // messageId ごとに最新の状態を集約（ログは時系列で複数エントリがある）
  const latestState = new Map<string, string>();
  for (const log of res.logs) {
    if (log.url !== punishUrl) continue;
    const existing = latestState.get(log.messageId);
    // ログは新しい順に返るので、最初に見つかったものが最新
    if (!existing) {
      latestState.set(log.messageId, log.state);
    }
  }

  // CREATED かつ終了状態でないメッセージを探す
  for (const [messageId, state] of latestState) {
    if (TERMINAL_STATES.has(state)) continue;

    try {
      const msg = await client.messages.get(messageId);
      const body =
        typeof msg.body === "string" ? JSON.parse(msg.body) : msg.body;
      const alarmId =
        typeof body?.alarmId === "string" ? body.alarmId : null;

      if (!alarmId) continue;

      // notBefore は Unix秒 → ミリ秒に変換
      const fireAt =
        typeof msg.notBefore === "number" ? msg.notBefore * 1000 : 0;

      // 既に発火時刻を過ぎているものはスキップ
      if (fireAt > 0 && fireAt < Date.now()) continue;

      return { messageId, alarmId, fireAt };
    } catch {
      // メッセージが既に配信/削除済み → スキップ
      continue;
    }
  }

  return null;
}
