# TRD: WakeOrPay（寝坊防止ペナルティアラーム）

- **Owner**: Kohei Fujiwara
- **Version**: v0.2 / 2026-04-09
- **Status**: Final
- **Links**: [PRD](./PRD-wake-or-pay.md), [UXS](./UXS-wake-or-pay.md)
- **Traceability Prefix**: TRD-
- **PRD Mapping**: PRD-R1〜R6

---

## Problem & Scope (Technical)

**What the system must do**: ブラウザからアラーム時刻をセットすると、サーバー側スケジューラ（QStash）が指定時刻に `/api/punish` を1回呼び出し、OpenAI GPT-4o に長文プロンプトを投げて課金を発生させる。時刻前にユーザーが解除すればスケジュールをキャンセルする。状態は localStorage のみに保持。

**Out of scope**: DB、認証、マルチユーザー、ネイティブアプリ、自動テスト

**Key assumptions**: QStash の1メッセージ=1配信で冪等性を担保。所有者1人。OpenAI APIキーはサーバー環境変数のみ。

---

## System Overview

```
Browser (localStorage)
  ↕ HTTP
Next.js App Router (Vercel Serverless)
  ├── POST /api/schedule  → QStash Messages API (notBefore)
  ├── DELETE /api/schedule → QStash Messages DELETE
  └── POST /api/punish    ← QStash (指定時刻に1回配信)
                               ↓
                           OpenAI GPT-4o Chat Completions
```

**Components**:
- **Client**: ブラウザ。React 19 SPA（Next.js App Router）。状態は localStorage。
- **API Layer**: Next.js Route Handlers（`/api/schedule`, `/api/punish`）
- **External**: Upstash QStash（スケジューラ）、OpenAI API（ペナルティ実行）

---

## Requirements

### Functional Technical Requirements

| ID | Requirement | PRD Mapping | Acceptance Criteria |
|---|---|---|---|
| TRD-R1 | POST /api/schedule で QStash に notBefore 付きメッセージを登録し messageId を返す | PRD-R1 | QStash API が 2xx を返し messageId が取得できる |
| TRD-R2 | DELETE /api/schedule で QStash メッセージをキャンセルする | PRD-R2 | QStash DELETE が 2xx を返す。失敗時はエラーを返す |
| TRD-R3 | POST /api/punish で Upstash-Signature を検証し、通過後に OpenAI GPT-4o を1回呼ぶ | PRD-R3, R6 | 署名不正→401。正常→OpenAI 200 & usage.prompt_tokens > 0 |
| TRD-R4 | /api/punish は環境変数 OPENAI_API_KEY 未設定時に 500 を返し OpenAI を呼ばない | PRD-R3 | 500 レスポンス + サーバーログにエラー出力 |
| TRD-R5 | Alarm 状態を localStorage に JSON 永続化。再訪時に復元する | PRD-R5 | ブラウザ閉じ→再訪で Alarm オブジェクトが復元される |
| TRD-R6 | 再訪時に fireAt < now() かつ status=scheduled なら punished（推定）に自動遷移 | PRD-R5, R4 | ブラウザ再訪でステータスが自動更新される |

### Non-Functional Requirements

| Category | Requirement | Target | Measurement |
|---|---|---|---|
| Reliability | ペナルティ発火遅延 | fireAt から 60 秒以内 | Vercel ログのタイムスタンプ差 |
| Security | OpenAI/QStash キーはクライアントに露出しない | 0 件の漏洩 | コードレビュー + ブラウザ DevTools 確認 |
| Security | /api/punish は QStash 署名検証必須 | 不正リクエスト 100% 拒否 | curl で署名なしリクエスト→401 |
| Performance | UI 操作応答 | < 200ms | 手動体感 |
| Cost | 追加外部サービス | QStash + OpenAI のみ | 依存一覧確認 |

---

## Options & Tradeoffs

| Option | Summary | Pros | Cons | Cost | Complexity | Risk | When to Choose |
|---|---|---|---|---|---|---|---|
| **A: Next.js + QStash + localStorage** | Vercel サーバーレス。DB なし。状態は localStorage | 最小構成。デプロイ即可。DB 運用不要 | ブラウザ乗り換え時に状態喪失 | 低 | 低 | 低 | ✅ 単一所有者 MVP |
| B: Next.js + Redis + QStash | Upstash Redis でサーバー側にも状態保持 | 複数デバイス対応可。ペナルティ結果をサーバーで確認可 | 外部サービス追加。Constitution III 違反 | 中 | 中 | 中 | マルチデバイス必要時 |

### Recommended Path

**Option A** を採用。理由: Constitution III（No Database）に準拠し、単一所有者 MVP として最小構成で十分。状態喪失リスクは「1ブラウザ・1デバイス」前提で許容。

---

## ADR Stubs

### ADR-001: スケジューラ選択 — QStash Messages API（notBefore ワンショット）

- **Context**: アラーム時刻に1回だけサーバー側からペナルティを発火する必要がある
- **Options**: QStash Messages（notBefore）/ QStash Schedules（cron）/ Vercel Cron / ブラウザ setTimeout
- **Decision**: QStash Messages API の notBefore パラメータで1回配信。1スケジュール=1発火で冪等性を構造的に保証。
- **Consequences**: QStash の可用性に依存。ブラウザ閉鎖・スリープの影響を受けない。

### ADR-002: 状態永続化 — ブラウザ localStorage のみ

- **Context**: Alarm の状態をどこに保持するか
- **Options**: localStorage / Upstash Redis / Vercel KV / Cookie
- **Decision**: localStorage。DB 不要の Constitution 制約に準拠。
- **Consequences**: デバイス・ブラウザをまたいだ状態共有不可。クリアで状態喪失。MVP では許容。

### ADR-003: 署名検証 — @upstash/qstash Receiver

- **Context**: /api/punish は QStash からのみ呼び出し可にする
- **Options**: 公式 Receiver / 自前 HMAC 検証
- **Decision**: 公式 SDK の Receiver.verify()。キーローテーション対応が自動。
- **Consequences**: @upstash/qstash への依存。ただし既にスケジュール操作で依存しているため追加コストなし。

---

## Data Model & Contracts

### Key Entities

- **Alarm**（クライアント localStorage）: id, fireAt, status, createdAt, cancelledAt, punishedAt, lastError, qstashMessageId

### API Endpoints

| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| /api/schedule | POST | QStash にアラームスケジュール登録 | なし（単一所有者） |
| /api/schedule | DELETE | QStash スケジュールキャンセル | なし |
| /api/punish | POST | ペナルティ実行（OpenAI 呼び出し） | QStash 署名検証 |

### Data Validation

- `fireAt > Date.now()`（サーバー側で再検証）
- `alarmId` は UUID 形式
- QStash 署名は Receiver.verify() で検証

---

## Observability & Instrumentation

- **ログ**: `/api/punish` の実行結果を `console.log` で標準出力（Vercel Functions ログで閲覧）
  - 成功: `[punish] alarmId=<id> status=success promptTokens=<n> model=gpt-4o`
  - 失敗: `[punish] alarmId=<id> status=error reason=<message>`
- **メトリクス**: Vercel Functions の呼び出し回数・レイテンシ（Vercel ダッシュボード標準）
- **アラート**: MVP ではなし

---

## Security & Privacy

- **Threats**: APIキー漏洩、不正なペナルティ発火
- **Controls**:
  - OPENAI_API_KEY, QSTASH_TOKEN, SIGNING_KEY はサーバー環境変数のみ
  - /api/punish は QStash 署名検証必須（Receiver.verify）
  - ブラウザから QStash 直接呼び出し禁止（/api/schedule 経由）
- **Data minimization**: PII なし。localStorage に保持するのは Alarm 状態のみ。

---

## Test Strategy

- **MVP**: 自動テストなし（Constitution IV）
- **型チェック**: `tsc --noEmit` でコンパイルエラーゼロ
- **手動検証**: quickstart.md のシナリオ A〜D を実施
- **将来**: E2E テスト（Playwright）、API 統合テスト

---

## Delivery Plan: Thin Slice

### Walking Skeleton

1. Next.js プロジェクト + 環境変数セットアップ
2. /api/punish（署名検証 + OpenAI 呼び出し）
3. /api/schedule（QStash 登録・キャンセル）
4. UI（セット→カウントダウン→解除→結果表示）
5. Vercel デプロイ + 手動検証

### Rollout

- Vercel Preview → 手動テスト → Production デプロイ
- Rollback: Vercel の即時ロールバック機能

---

## Backlog Mapping

| Epic | Objective | DoD | PRD/TRD IDs |
|---|---|---|---|
| E1: WakeOrPay MVP | アラーム→ペナルティの完全ループ | 全手動シナリオ pass | PRD-R1〜R6, TRD-R1〜R6 |

---

## GitHub Issue Readiness

### Milestone

- **M1**: WakeOrPay MVP — アラーム→ペナルティ完全ループ

### First-Slice Issues

| # | Title | Type | PRD IDs | TRD IDs | Effort |
|---|---|---|---|---|---|
| 01 | プロジェクト初期セットアップ（Next.js 15 + 依存 + 環境変数） | Technical Debt | PRD-R1 | TRD-R1 | 2 |
| 02 | アラームセット・解除 API（POST/DELETE /api/schedule） | Feature | PRD-R1, R2, R4 | TRD-R1, R2 | 5 |
| 03 | ペナルティ実行 API（POST /api/punish + QStash 署名検証） | Feature | PRD-R3, R4, R6 | TRD-R3, R4 | 5 |
| 04 | アラーム UI（セット・カウントダウン・解除・状態表示 + localStorage） | Feature | PRD-R1, R2, R5 | TRD-R5, R6 | 5 |
| 05 | 手動 E2E 検証 + Vercel デプロイ | Docs | PRD-R1〜R6 | TRD-R1〜R6 | 3 |

---

## What UXS Must Specify Next

- 画面の状態遷移詳細（empty / loading / error / success の各状態）
- 解除失敗時のリトライ UI パターン
- カウントダウン表示の更新頻度と表示形式
