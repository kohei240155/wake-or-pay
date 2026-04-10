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
  await client.messages.cancel(messageId);
}

export interface PendingAlarm {
  messageId: string;
  alarmId: string;
  fireAt: number; // Unixミリ秒
}

/**
 * QStash のログから未実行（配信待ち）のアラームを検索する。
 * localStorage を失った場合のリカバリー用。
 */
export async function findPendingAlarm(): Promise<PendingAlarm | null> {
  const punishUrl = `${process.env.APP_BASE_URL}/api/punish`;

  // ログを取得し、CREATED 状態（未配信）のメッセージを探す
  const res = await client.logs();

  for (const log of res.logs) {
    if (log.url === punishUrl && log.state === "CREATED") {
      // messages.get() で body（alarmId）と notBefore を取得
      try {
        const msg = await client.messages.get(log.messageId);
        const body =
          typeof msg.body === "string" ? JSON.parse(msg.body) : msg.body;
        const alarmId =
          typeof body?.alarmId === "string" ? body.alarmId : null;

        if (!alarmId) continue;

        // notBefore は Unix秒 → ミリ秒に変換
        const fireAt =
          typeof msg.notBefore === "number" ? msg.notBefore * 1000 : 0;

        return {
          messageId: log.messageId,
          alarmId,
          fireAt,
        };
      } catch {
        // メッセージが既に削除済みなど → スキップ
        continue;
      }
    }
  }

  return null;
}
