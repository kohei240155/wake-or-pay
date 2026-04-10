# Quickstart — WakeOrPay

**Date**: 2026-04-09

本ドキュメントは所有者本人（単一ユーザー）が WakeOrPay をローカル開発し、Vercel にデプロイし、実際に「2分後アラーム」で動作確認するまでの最短手順を示す。

## 1. 前提

- Node.js 20+、`pnpm` または `npm`
- Vercel アカウント
- Upstash アカウント（QStash 有効化済）
- OpenAI アカウント（課金有効な API キー）

## 2. プロジェクト作成

```bash
npx create-next-app@latest wake-or-pay \
  --ts --tailwind --app --eslint --src-dir=false --import-alias "@/*"
cd wake-or-pay
npm install @upstash/qstash openai
```

## 3. 環境変数

`.env.local`（ローカル開発用）と Vercel Project Settings の両方に同じ値を設定する。

```env
OPENAI_API_KEY=sk-...
QSTASH_TOKEN=...
QSTASH_CURRENT_SIGNING_KEY=...
QSTASH_NEXT_SIGNING_KEY=...
APP_BASE_URL=https://<your-vercel-deployment>.vercel.app
```

- `APP_BASE_URL` は **QStash から到達できる絶対 URL**。ローカル開発で QStash 発火を試したい場合は `ngrok` などでトンネルしたホスト名を指定するか、Vercel Preview を使う。
- ローカルでは QStash 発火自体は省略し、`/api/punish` を手で叩く検証でも可。

## 4. 実装ファイル（plan.md の Project Structure 参照）

次のファイルを順に実装する（1ファイル1責務、Constitution VI）:

1. `lib/punish-prompt.ts` — 固定長文プロンプト定数
2. `lib/openai-punish.ts` — GPT-4o を1回呼ぶ関数
3. `lib/qstash.ts` — QStash Client のスケジュール登録・キャンセル関数
4. `lib/alarm-storage.ts` — localStorage 読み書き（`"use client"`）
5. `app/api/punish/route.ts` — QStash 署名検証 → OpenAI 呼び出し → ログ出力
6. `app/api/schedule/route.ts` — `POST`/`DELETE` で QStash を操作
7. `app/page.tsx` — 画面（セット・カウントダウン・解除・状態表示）
8. `app/layout.tsx` — Tailwind 適用のルートレイアウト

## 5. 型チェック

```bash
npx tsc --noEmit
```

エラーなしを確認（Constitution Development Workflow）。

## 6. Vercel デプロイ

```bash
npx vercel
npx vercel --prod
```

Vercel の環境変数画面で `.env.local` と同じ値を全環境に設定してから再デプロイする。`APP_BASE_URL` は本番 URL と一致させる。

## 7. 動作確認シナリオ

### シナリオA: 正常系（解除成功、P1 ユーザーストーリー1）

1. デプロイ済 URL をブラウザで開く。
2. 現在時刻の **2分後** を指定して「セット」。
3. カウントダウンと解除ボタンが出ることを確認。
4. 1分経った頃に「解除」を押す。
5. UI に「解除完了」が表示されることを確認。
6. 指定時刻を過ぎても Vercel のログに `[punish]` が出ていないこと、OpenAI の Usage ダッシュボードで追加課金が無いことを確認。

### シナリオB: ペナルティ発火（P1 ユーザーストーリー2）

1. 現在時刻の **2分後** をセット。
2. **解除せずに** 2分待つ。
3. Vercel Functions ログに `[punish] alarmId=<id> status=success promptTokens=<n> model=gpt-4o` が出力されることを確認。
4. OpenAI Usage ダッシュボードに GPT-4o の課金が1件追加されていることを確認。
5. ブラウザを再読み込みすると UI が「ペナルティ執行済（推定）」表示に切り替わることを確認（FR-009a）。

### シナリオC: 過去時刻バリデーション

1. 現在時刻より前の時刻をセットしようとする。
2. バリデーションエラーが出て、QStash リクエストが発生していないことを確認（FR-002）。

### シナリオD: 解除キャンセル失敗

1. アラームをセット。
2. ネットワークを一時的に切断し、解除ボタンを押す。
3. 「解除完了」が表示されず、エラーメッセージとリトライボタンが出ることを確認（FR-007a）。
4. ネットワークを戻してリトライし、キャンセル成功＝「解除完了」になることを確認。

## 8. 既知の運用上の注意

- **OpenAI APIキーの扱い**: Vercel 環境変数のみ。リポジトリ・ブラウザ・クライアントログに出してはならない。
- **罰金の冪等性**: QStash の「1スケジュール=1発火」と解除時キャンセルのみに依存。DB は追加しないこと（Constitution III）。
- **自動テスト**: MVP では作成しない（Constitution IV）。型チェックと本手順の手動確認を実施。
