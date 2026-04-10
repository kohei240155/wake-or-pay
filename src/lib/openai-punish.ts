import OpenAI from "openai";
import { PUNISH_PROMPT } from "./punish-prompt";

interface PunishResult {
  success: boolean;
  promptTokens: number;
  error?: string;
}

/**
 * OpenAI o1 を呼び出してペナルティを実行する。
 * 課金（~10円/回）を発生させることが目的。
 */
export async function executePunishment(alarmId: string): Promise<PunishResult> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await client.chat.completions.create({
      model: "o1",
      messages: [
        {
          role: "user",
          content: `${PUNISH_PROMPT}\n\nalarmId: ${alarmId} - 寝坊しました。ペナルティを実行してください。`,
        },
      ],
    });

    const promptTokens = response.usage?.prompt_tokens ?? 0;

    if (promptTokens > 0) {
      return { success: true, promptTokens };
    }

    return {
      success: false,
      promptTokens,
      error: "prompt_tokens was 0",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, promptTokens: 0, error: message };
  }
}
