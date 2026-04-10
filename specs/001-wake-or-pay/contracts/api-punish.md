# Contract: `POST /api/punish`

**Date**: 2026-04-09

QStash がアラーム発火時刻に1回だけ呼び出す、ペナルティ実行用 Route Handler。ブラウザからは直接叩かない。

## 呼び出し元

- **許可**: Upstash QStash からの配信のみ。
- **拒否**: それ以外の呼び出しはすべて 401。

## リクエスト

- **Method**: `POST`
- **Path**: `/api/punish`
- **Headers (必須)**:
  - `Upstash-Signature: <JWT>` — QStash 署名。`@upstash/qstash` の `Receiver.verify()` で検証。
  - `Content-Type: application/json`
- **Body**:
  ```json
  { "alarmId": "string (UUID)", "fireAt": 1712620800000 }
  ```

## 処理フロー

1. 環境変数チェック
   - `OPENAI_API_KEY` 未設定 → サーバー標準出力にエラーログ → `500 { "ok": false, "reason": "missing_openai_key" }` を返す（FR-004）。
2. `@upstash/qstash` の `Receiver` で `Upstash-Signature` を検証
   - 失敗 → `401 { "ok": false, "reason": "invalid_signature" }`（FR-007c）。
   - この時点で OpenAI API は絶対に呼び出さない。
3. Body を JSON パースし `alarmId` を取得（不正でもログに残して処理続行可否を決める）。
4. OpenAI GPT-4o に長文プロンプトを1回送信
   - `openai.chat.completions.create({ model: "gpt-4o", messages: [{ role: "user", content: LONG_PROMPT }] })`
   - `LONG_PROMPT` は `lib/punish-prompt.ts` の固定定数。
5. 判定（FR-008）
   - `response.usage.prompt_tokens > 0` かつ HTTP 200 → **成功**
   - それ以外（エラー・`usage` 欠落） → **失敗**
6. ログ出力（FR-010a、標準出力のみ）
   - 成功: `[punish] alarmId=<id> status=success promptTokens=<n> model=gpt-4o`
   - 失敗: `[punish] alarmId=<id> status=error reason=<message>`
7. レスポンスを返す（QStash は 2xx を成功とみなす）
   - 成功: `200 { "ok": true }`
   - 失敗: `500 { "ok": false, "reason": "<message>" }`

## 冪等性

- サーバー側では重複検知を行わない（DB なし）。
- QStash は1スケジュール=1配信であり、解除時はスケジュール自体がキャンセルされるため、同一アラームへの二重実行は構造的に発生しない（FR-009）。

## 失敗時のクライアント影響

- クライアントは `/api/punish` を直接叩かないため、レスポンスを見ない。
- ブラウザ側は次回起動時、`fireAt < now() && status === "scheduled"` なら `status = "punished"`（推定）として表示を更新する（FR-009a）。厳密な成否はサーバーログで確認。
