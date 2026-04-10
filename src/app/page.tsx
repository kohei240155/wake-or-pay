"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type Alarm,
  type AlarmStatus,
  clearAlarm,
  loadAlarm,
  saveAlarm,
} from "@/lib/alarm-storage";

/* ---------- helpers ---------- */

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/** datetime-local の min 用（現在時刻を ISO-local 形式で返す） */
function toLocalISOString(date: Date): string {
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/* ---------- types ---------- */

type Screen = "set" | AlarmStatus;

/* ---------- component ---------- */

export default function Home() {
  const [screen, setScreen] = useState<Screen>("set");
  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const [dateValue, setDateValue] = useState("");
  const [remaining, setRemaining] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* --- 初回マウント: localStorage から復元 --- */
  useEffect(() => {
    const stored = loadAlarm();
    if (!stored) return;

    if (stored.status === "scheduled" && stored.fireAt < Date.now()) {
      // 期限切れ → punished と推定
      const updated: Alarm = {
        ...stored,
        status: "punished",
        punishedAt: Date.now(),
      };
      saveAlarm(updated);
      setAlarm(updated);
      setScreen("punished");
    } else {
      setAlarm(stored);
      setScreen(stored.status === "scheduled" ? "scheduled" : stored.status);
    }
  }, []);

  /* --- カウントダウンタイマー --- */
  useEffect(() => {
    if (screen !== "scheduled" || !alarm) return;

    const tick = (): void => {
      const diff = alarm.fireAt - Date.now();
      setRemaining(formatCountdown(diff));

      if (diff <= 0) {
        // タイマー切れ → punished
        const updated: Alarm = {
          ...alarm,
          status: "punished",
          punishedAt: Date.now(),
        };
        saveAlarm(updated);
        setAlarm(updated);
        setScreen("punished");
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [screen, alarm]);

  /* --- handlers --- */

  const handleSet = useCallback(async () => {
    setError("");

    if (!dateValue) {
      setError("日時を入力してください");
      return;
    }

    const fireAt = new Date(dateValue).getTime();
    if (fireAt <= Date.now()) {
      setError("過去の時刻は設定できません");
      return;
    }

    // 既存アラームがある場合は上書き確認
    const existing = loadAlarm();
    if (existing) {
      const ok = window.confirm(
        "既存のアラームを上書きしますか？",
      );
      if (!ok) return;
    }

    const alarmId = crypto.randomUUID();
    setLoading(true);

    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alarmId, fireAt }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? `APIエラー (${res.status})`);
      }

      const data = (await res.json()) as { ok: boolean; messageId: string };

      const newAlarm: Alarm = {
        id: alarmId,
        fireAt,
        status: "scheduled",
        createdAt: Date.now(),
        qstashMessageId: data.messageId,
      };

      saveAlarm(newAlarm);
      setAlarm(newAlarm);
      setScreen("scheduled");
      setDateValue("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "不明なエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [dateValue]);

  const handleDismiss = useCallback(async () => {
    if (!alarm) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `/api/schedule?id=${encodeURIComponent(alarm.qstashMessageId)}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? `APIエラー (${res.status})`);
      }

      const updated: Alarm = {
        ...alarm,
        status: "cancelled",
        cancelledAt: Date.now(),
      };
      saveAlarm(updated);
      setAlarm(updated);
      setScreen("cancelled");
    } catch (e) {
      setError(e instanceof Error ? e.message : "不明なエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [alarm]);

  const handleReset = useCallback(() => {
    clearAlarm();
    setAlarm(null);
    setScreen("set");
    setError("");
    setDateValue("");
  }, []);

  /* --- render helpers --- */

  const buttonBase =
    "min-h-11 min-w-11 rounded-lg px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <main
        className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        aria-live="polite"
      >
        <h1 className="text-2xl font-bold tracking-tight">WakeOrPay</h1>

        {/* ---- S1: Set ---- */}
        {screen === "set" && (
          <div className="flex w-full flex-col items-center gap-4">
            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              起床時刻をセットしてください。時刻までに解除しないと OpenAI API
              が呼ばれて課金されます。
            </p>

            <div className="flex w-full flex-col gap-1">
              <label
                htmlFor="alarm-time"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                アラーム時刻
              </label>
              <input
                id="alarm-time"
                type="datetime-local"
                value={dateValue}
                min={toLocalISOString(new Date())}
                onChange={(e) => {
                  setDateValue(e.target.value);
                  setError("");
                }}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleSet}
              className={`${buttonBase} w-full bg-blue-600 focus:ring-blue-600`}
            >
              {loading ? "送信中…" : "セット"}
            </button>
          </div>
        )}

        {/* ---- S2: Countdown ---- */}
        {screen === "scheduled" && (
          <div className="flex w-full flex-col items-center gap-4">
            <div className="rounded-lg bg-blue-50 px-4 py-2 dark:bg-blue-950">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                アラーム作動中
              </span>
            </div>

            <p
              className="font-mono text-5xl font-bold tracking-widest text-zinc-900 dark:text-zinc-100"
              aria-label={`残り時間 ${remaining}`}
            >
              {remaining}
            </p>

            <button
              type="button"
              disabled={loading}
              onClick={handleDismiss}
              className={`${buttonBase} w-full bg-blue-600 focus:ring-blue-600`}
            >
              {loading ? "解除中…" : "解除"}
            </button>
          </div>
        )}

        {/* ---- S3: Dismissed ---- */}
        {screen === "cancelled" && (
          <div className="flex w-full flex-col items-center gap-4">
            <div className="rounded-lg bg-green-50 px-4 py-2 dark:bg-green-950">
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                解除済み
              </span>
            </div>

            <p className="text-center font-semibold text-green-600 dark:text-green-400">
              解除完了！ペナルティなし。いい朝ですね。
            </p>

            <button
              type="button"
              onClick={handleReset}
              className={`${buttonBase} w-full bg-blue-600 focus:ring-blue-600`}
            >
              新しいアラームをセット
            </button>
          </div>
        )}

        {/* ---- S4: Punished ---- */}
        {screen === "punished" && (
          <div className="flex w-full flex-col items-center gap-4">
            <div className="rounded-lg bg-red-50 px-4 py-2 dark:bg-red-950">
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                ペナルティ執行済
              </span>
            </div>

            <p className="text-center font-semibold text-red-600 dark:text-red-400">
              ペナルティ執行済。次は起きましょう。
            </p>

            <button
              type="button"
              onClick={handleReset}
              className={`${buttonBase} w-full bg-blue-600 focus:ring-blue-600`}
            >
              新しいアラームをセット
            </button>
          </div>
        )}

        {/* ---- S5: Failed ---- */}
        {screen === "failed" && (
          <div className="flex w-full flex-col items-center gap-4">
            <div className="rounded-lg bg-yellow-50 px-4 py-2 dark:bg-yellow-950">
              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                エラー
              </span>
            </div>

            <p className="text-center font-semibold text-yellow-600 dark:text-yellow-400">
              ペナルティ実行に失敗しました。詳細はサーバーログを確認してください。
            </p>

            <button
              type="button"
              onClick={handleReset}
              className={`${buttonBase} w-full bg-blue-600 focus:ring-blue-600`}
            >
              新しいアラームをセット
            </button>
          </div>
        )}

        {/* ---- エラー表示 ---- */}
        {error && (
          <p className="w-full text-center text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}
      </main>
    </div>
  );
}
