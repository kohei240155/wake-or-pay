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
  await client.messages.delete(messageId);
}
