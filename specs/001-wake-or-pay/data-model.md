# Phase 1: データモデル — WakeOrPay

**Date**: 2026-04-09

サーバー側 DB は存在しない。以下は **ブラウザ `localStorage` 上のクライアントサイド・エンティティ** と **QStash/OpenAI レスポンスの扱い** を定義する。

---

## エンティティ: Alarm（クライアント側・localStorage）

**ストレージキー**: `wake-or-pay:alarm`（単一キーに最新1件のみを保存。FR-014 によりアクティブ1件制限）

**TypeScript 型（参考、実装時に `lib/alarm-storage.ts` に配置）**:

```ts
export type AlarmStatus =
  | "scheduled"       // 設定済・未到達
  | "cancelled"       // 解除済
  | "punished"        // ペナルティ執行済（推定含む）
  | "failed";         // ペナルティ試行失敗

export interface Alarm {
  id: string;                    // クライアント生成の UUID（表示・再描画用）
  fireAt: number;                // 発火予定時刻 (Unix ms, UTC 絶対)
  status: AlarmStatus;
  createdAt: number;             // 作成日時 (Unix ms)
  cancelledAt: number | null;    // 解除日時 (Unix ms)
  punishedAt: number | null;     // ペナルティ実行日時 (Unix ms)。推定の場合もセット
  lastError: string | null;      // 直近のエラーメッセージ（QStash キャンセル失敗・ペナルティ失敗 等）
  qstashMessageId: string | null;// QStash 返却 messageId（キャンセル時に使用）
}
```

### 属性

| 属性 | 型 | 由来 | 備考 |
|---|---|---|---|
| id | string (UUID) | `crypto.randomUUID()` | 画面表示・React key 等 |
| fireAt | number (Unix ms) | `<input type="datetime-local">` をローカルタイムで解釈→UTC ms | FR-001。QStash には秒単位の Unix 時刻として渡す |
| status | enum | 状態遷移により更新 | FR-005 |
| createdAt | number | セット時に `Date.now()` | — |
| cancelledAt | number \| null | 解除成功時に `Date.now()` | FR-007a |
| punishedAt | number \| null | 再訪時に fireAt 超過なら推定値、または手動反映 | FR-009a |
| lastError | string \| null | エラー時にセット | FR-010 |
| qstashMessageId | string \| null | `/api/schedule` POST の返却 | FR-007 |

### バリデーション規則

- `fireAt > Date.now()`（過去時刻は拒否。FR-002）
- 既存の `status === "scheduled"` Alarm がある状態で新規セットを試みる場合、ユーザーに上書き確認を求める（FR-014）
- `qstashMessageId` が `null` のまま `status` を `scheduled` にしてはいけない（スケジュール登録成功後にのみ `scheduled` へ遷移）

### 状態遷移

```
(none)
  │  ユーザーがセット → POST /api/schedule 成功
  ▼
scheduled
  ├── ユーザーが解除 → DELETE /api/schedule 成功 → cancelled
  ├── fireAt 到達 → QStash が /api/punish を呼ぶ
  │       ├── OpenAI 呼び出し HTTP 200 & usage.prompt_tokens > 0 → punished（サーバーログに記録）
  │       └── OpenAI 失敗 → failed（サーバーログに記録）
  └── ブラウザ再訪時に fireAt 経過 & まだ scheduled → punished（推定。FR-009a）

cancelled / punished / failed は終端状態。新規アラームセットで上書きされるまで残る。
```

クライアントは `punished`/`failed` のうち「推定」か「サーバー確定」かを厳密には区別しない。厳密確認はサーバー標準出力ログ（FR-010a）で行う。

---

## サーバー側で扱うが永続化しないデータ

### `/api/punish` の入力 payload

QStash から POST される body。`alarmId` を含めてログに識別子として出力する。

```ts
interface PunishRequestBody {
  alarmId: string;   // クライアントで生成した UUID
  fireAt: number;    // Unix ms（参考情報。処理には使わない）
}
```

### `/api/punish` のログ出力（標準出力のみ。FR-010a）

```
[punish] alarmId=<uuid> status=success promptTokens=<n> model=gpt-4o
[punish] alarmId=<uuid> status=error reason=<message>
```

### `/api/schedule` POST の入力／出力

- 入力: `{ alarmId: string; fireAt: number }`（ブラウザから）
- 出力: `{ messageId: string }`（QStash から返った ID をそのまま返す）

### `/api/schedule` DELETE の入力／出力

- 入力: クエリ `?id={messageId}`
- 出力: `{ ok: true }` もしくは `{ ok: false, error: string }`

---

## 削除済エンティティ（spec Clarifications 反映）

以下は spec で明示的に削除された：

- **UserSettings**: APIキー・モデル名・プロンプトはサーバー環境変数と定数に統合。ドメインエンティティとしては存在しない。
- **PenaltyLog**: DB を持たないため廃止。実行結果はサーバー標準出力ログと Alarm の `punishedAt`/`lastError` のみで扱う。
