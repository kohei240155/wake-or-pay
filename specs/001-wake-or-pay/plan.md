# Implementation Plan: WakeOrPay（寝坊防止ペナルティアラーム）

**Branch**: `001-wake-or-pay` | **Date**: 2026-04-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-wake-or-pay/spec.md`

## Summary

ブラウザ上でアラーム時刻をセットし、時刻までに解除されなければ Upstash QStash が `/api/punish` を1回叩き、OpenAI GPT-4o に長文プロンプトを1回投げて所有者の OpenAI APIキーに課金（罰金）を発生させる、単一所有者・認証不要の Next.js 15 / Vercel サーバーレス MVP。状態はブラウザ localStorage のみで保持し、DB は持たない。冪等性は「QStash の1スケジュール=1発火 + 解除時キャンセル」で担保する。

## Technical Context

**Language/Version**: TypeScript 5.x (strict), Node.js 20 (Vercel default)
**Primary Dependencies**: Next.js 15 (App Router), React 19, Tailwind CSS, `@upstash/qstash`（署名検証・スケジュール作成/キャンセル用公式SDK）, `openai` 公式 SDK
**Storage**: なし（サーバー側 DB 不使用）。ブラウザ `localStorage` のみ（Alarm 状態・QStash スケジュールID の表示用キャッシュ）
**Testing**: MVP ではなし（Constitution 原則 IV により自動テスト延期）。`tsc --noEmit` と手動検証で代替
**Target Platform**: Vercel（Node サーバーレス関数 / App Router Route Handlers）+ デスクトップブラウザ
**Project Type**: Web アプリ（単一 Next.js プロジェクト。frontend/backend 分割はしない）
**Performance Goals**: 発火時刻から 60 秒以内に `/api/punish` 呼び出し（QStash 保証）、UI 操作応答 < 200ms
**Constraints**: 追加の外部サービス禁止（QStash・OpenAI のみ）、DB 禁止、OpenAI APIキーはサーバー環境変数のみ、QStash 署名検証必須
**Scale/Scope**: 単一所有者1ユーザー、同時アクティブアラーム1件、画面2〜3（アラームセット / カウントダウン・解除 / 執行済表示）

## Constitution Check

| 原則 | 判定 | メモ |
|---|---|---|
| I. Next.js 15 App Router + TS + Tailwind | ✅ | 本計画はこのスタックのみを使用 |
| II. Vercel-Native Deployment | ✅ | Route Handlers と環境変数のみ。Vercel 外依存なし |
| III. Serverless, No Database | ✅ | DB なし。状態は localStorage と QStash 自身に集約 |
| IV. MVP First — Tests Deferred | ✅ | 自動テストは作成しない。手動検証のみ |
| V. Approved External Services Only | ✅ | Upstash QStash と OpenAI API のみ |
| VI. One File, One Responsibility | ✅ | 後述の Project Structure で責務分離 |

**ゲート結果**: PASS（Phase 0 に進む）。違反・正当化必要事項なし。

## Project Structure

### Documentation (this feature)

```text
specs/001-wake-or-pay/
├── plan.md              # 本ファイル
├── research.md          # Phase 0 出力
├── data-model.md        # Phase 1 出力
├── quickstart.md        # Phase 1 出力
├── contracts/           # Phase 1 出力
│   ├── api-punish.md
│   └── qstash-schedule.md
└── tasks.md             # /speckit.tasks により後続生成
```

### Source Code (repository root)

```text
app/
├── layout.tsx                  # ルートレイアウト（Tailwind 適用）
├── page.tsx                    # 唯一の画面：アラームセット / カウントダウン / 解除 / 執行済表示
└── api/
    └── punish/
        └── route.ts            # POST /api/punish : QStash 署名検証 → OpenAI GPT-4o 呼び出し

lib/
├── qstash.ts                   # QStash スケジュール登録・キャンセル（サーバー側ユーティリティ）
├── openai-punish.ts            # OpenAI GPT-4o へ長文プロンプトを1回送信する関数
├── punish-prompt.ts            # 固定長文プロンプト（定数）
└── alarm-storage.ts            # localStorage 読み書き（Alarm 状態・スケジュールID）

app/api/schedule/
└── route.ts                    # POST: QStash にスケジュール登録 / DELETE: キャンセル（ブラウザ→サーバー経由）
```

**Structure Decision**: Next.js 15 App Router 単一プロジェクト構成を採用。frontend/backend 分割はせず、`app/` 配下にページと Route Handlers を同居させる。`lib/` は責務単位で1ファイル1役（Constitution 原則 VI）に分ける。QStash トークンはブラウザに漏らさないため、スケジュール登録・キャンセルはブラウザから直接 QStash を叩かず、`/api/schedule` 経由でサーバー側から行う。

## Complexity Tracking

*違反なし。空欄。*
