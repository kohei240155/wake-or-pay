# Phase 0: 調査結果 — WakeOrPay

**Date**: 2026-04-09
**Status**: NEEDS CLARIFICATION なし（spec.md の Clarifications セッションで全解消済）

本ドキュメントはユーザー指示および spec.md の Clarifications を踏まえ、技術選択を確定させるためのものである。

---

## 決定1: スケジューラは Upstash QStash の「指定時刻ワンショット配信」を使う

- **Decision**: ブラウザからサーバーの `/api/schedule` 経由で、QStash Messages API に `notBefore`（Unix タイムスタンプ秒）を指定し `/api/punish` への POST 配信を1件登録する。返却される `messageId` をブラウザ `localStorage` に保存し、解除時に同 ID を QStash DELETE API でキャンセルする。
- **Rationale**:
  - Constitution V で許可された外部サービスは Upstash QStash と OpenAI のみ。Cron ではなく「1回だけ特定時刻に配信」するのが要件（1アラーム=1発火）と一致する。
  - QStash は「1スケジュール=1発火」の性質を持ち、FR-009 の冪等性要件を追加ストレージなしで満たす。
  - 解除時のキャンセルも公式 API で提供されているため、FR-007a が成立する。
- **Alternatives considered**:
  - QStash Schedules（cron 形式）: 毎分発火などを繰り返すので「1回きり」要件に合わない。
  - Vercel Cron: Constitution V で未承認の外部サービスではないが「最短1分 cron」で、特定 Unix 時刻ワンショットに不向き。加えて spec の Clarifications で QStash 採用が既に決定済。
  - ブラウザ `setTimeout` のみ: タブ閉鎖・スリープ時に発火しない（SC-003 不達）。

## 決定2: QStash 呼び出し先は `POST /api/punish`、署名検証は公式 Receiver を使う

- **Decision**: `@upstash/qstash` の `Receiver` で `Upstash-Signature` を検証。`QSTASH_CURRENT_SIGNING_KEY` / `QSTASH_NEXT_SIGNING_KEY` を環境変数に設定。検証失敗時は 401 を即返し、OpenAI には一切触れない（FR-007c）。
- **Rationale**: 公式 SDK を使うことでキー ローテーションに追従でき、自前の HMAC 実装より簡潔。Constitution VI の「1ファイル1責務」を守りやすい。
- **Alternatives considered**: 自前の crypto 検証実装 → 依存削減にはなるが誤実装リスクと保守負荷が見合わない。

## 決定3: OpenAI 呼び出しは GPT-4o Chat Completions に長文プロンプトを1回

- **Decision**: `openai` 公式 SDK の `chat.completions.create({ model: "gpt-4o", messages: [{ role: "user", content: LONG_PROMPT }] })` を1回だけ呼ぶ。`LONG_PROMPT` は `lib/punish-prompt.ts` に定数として保持（固定長文。MVP ではレビューやパワハラ防止の観点から「十分に長い無害なテキスト」で十分）。
- **Rationale**: ユーザー指示および FR-007b で GPT-4o 指定。FR-008 により「HTTP 200 かつ `usage.prompt_tokens > 0`」のみが課金成立条件で、具体的なトークン数下限は不要。Chat Completions はレスポンスに `usage.prompt_tokens` を含むので判定可能。
- **Alternatives considered**:
  - Responses API: 新 API だが Chat Completions の方が情報が安定しており、`usage` 形状も明確。
  - `gpt-4o-mini`: 罰金額が極小になり罰としての意味が薄れる。ユーザー指定は GPT-4o。

## 決定4: 状態の永続化はブラウザ localStorage のみ、DB なし

- **Decision**: `lib/alarm-storage.ts` を単一の入出口として、Alarm オブジェクト（発火時刻・状態・QStash messageId など）を `localStorage` に JSON で格納する。サーバー側には一切永続化しない。
- **Rationale**: Constitution III（No Database）と spec の FR-009a（localStorage は表示用キャッシュ）を満たす。QStash が事実上の「実行予約の真実の源」となる。
- **Alternatives considered**:
  - Vercel KV / Upstash Redis: Constitution V で未承認。
  - Cookies: サーバーに送られてしまい無駄なトラフィックとセキュリティリスク増。

## 決定5: OpenAI APIキー・QStash トークンはサーバー環境変数のみ

- **Decision**: 以下を Vercel Project の環境変数にのみ格納し、クライアントには露出しない。
  - `OPENAI_API_KEY`
  - `QSTASH_TOKEN`（スケジュール登録・キャンセル用）
  - `QSTASH_CURRENT_SIGNING_KEY` / `QSTASH_NEXT_SIGNING_KEY`（署名検証用）
  - `APP_BASE_URL`（QStash に渡す `/api/punish` の絶対 URL を組み立てるため）
- **Rationale**: FR-003、FR-007c、Constitution Technology 制約に準拠。ブラウザは QStash に直接触れず、`/api/schedule` 経由で操作することでトークン漏洩を防ぐ。
- **Alternatives considered**: ブラウザから直接 QStash を呼ぶ → トークンが露出するため却下。

## 決定6: 解除フローは「サーバー経由キャンセル→成功確認後に UI 反映」

- **Decision**: 解除ボタン押下時に `DELETE /api/schedule?id={messageId}` を叩き、QStash からの 2xx を待ってから localStorage の Alarm 状態を `解除済` に更新し、UI に「解除完了」を表示する。失敗時はエラーメッセージ＋リトライボタンを表示（FR-007a）。
- **Rationale**: 楽観的更新にすると「UI は解除済だが QStash は発火」するリスクがある。罰金機能の性質上、誤課金は許容できない。
- **Alternatives considered**: 楽観的 UI → 誤発火リスクのため却下。

## 決定7: 依存追加は最小限（`@upstash/qstash` と `openai` のみ）

- **Decision**: 追加 npm 依存は `@upstash/qstash` と `openai` の2つだけ。それ以外は Next.js / React / Tailwind の標準機能のみを使う。フォーム状態管理ライブラリ・日付ライブラリは入れない（`Date` と `<input type="datetime-local">` で十分）。
- **Rationale**: Constitution Technology 制約「zero-dependency or Vercel/Next-native を優先」に従う。
- **Alternatives considered**: `date-fns`, `zod`, `react-hook-form` → MVP には不要。
