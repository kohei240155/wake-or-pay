# Roadmap: WakeOrPay MVP

- **Owner**: Kohei Fujiwara
- **Version**: v1.0 / 2026-04-09
- **Status**: Final
- **Source**: [PRD](./PRD-wake-or-pay.md) / [TRD](./TRD-wake-or-pay.md) / [UXS](./UXS-wake-or-pay.md)

---

## 1) Decision Lock Summary

### A) Locked Decisions

- **PRD**: 単一所有者、認証なし、OpenAI 課金ペナルティ、同時1アラーム制限、DB 不使用
- **TRD**: Next.js 15 App Router + Vercel、QStash notBefore ワンショット、localStorage のみ、@upstash/qstash + openai の2依存
- **UXS**: Single page（状態遷移で切替）、5画面状態（Set/Countdown/Dismissed/Punished/Failed）、Tailwind ユーティリティベース

### B) Open Decisions

なし（Clarification セッションで全解消済）。

---

## 2) Roadmap Scenario

マイクロプロジェクト（4-5 issue）のため、シナリオは1つ: **Fast Validation**。

| Scenario | Speed | Cost | Risk | Quality | Notes |
|---|---|---|---|---|---|
| Fast Validation | 高 | 低 | 低 | MVP十分 | 全 PRD-R を1ウェーブで Ship |

---

## 3) Recommended Scenario

**Fast Validation** を採用。単一所有者 MVP であり、ウェーブ分割の必要がない。全要件を1ウェーブで実装し、手動検証で品質を確認する。

**Success gate**: quickstart.md のシナリオ A〜D が全て pass。

---

## 4) Roadmap

### 4.1 Waves

| Wave | Goal | Exit Criteria | Validation Activity |
|---|---|---|---|
| W1: MVP Ship | アラーム→ペナルティ完全ループ | 全 SC pass（手動） | Vercel デプロイ後にシナリオ A〜D 実行 |

### 4.2 Milestones

| Wave | Milestone Issue Title | Outcome | Exit Criteria |
|---|---|---|---|
| W1 | 00 - Milestone: WakeOrPay MVP | セット→解除→ペナルティの完全ループ | SC-001〜SC-006 全 pass |

### 4.3 Epics

| Wave | Epic | Objective | DoD | Dependencies |
|---|---|---|---|---|
| W1 | E1: WakeOrPay MVP | PRD-R1〜R6 実装 | 手動シナリオ A〜D pass | なし |

---

## 5) Validation Map

| Metric | Definition | Event(s)/Data | Where Measured | First Measurable |
|---|---|---|---|---|
| Time to set | アプリ表示→セット完了 | 手動ストップウォッチ | ブラウザ | W1 |
| Dismiss reliability | 解除時ペナルティ未発生 | Vercel ログに [punish] なし | Vercel ダッシュボード | W1 |
| Fire reliability | 未解除で60秒以内に発火 | [punish] ログのタイムスタンプ | Vercel ダッシュボード | W1 |
| No double fire | 二重実行 0% | [punish] ログの alarmId 重複なし | Vercel ダッシュボード | W1 |

---

## 6) Issue Pack

### Issue: 00 - Milestone: WakeOrPay MVP
**Form**: Milestone
**Labels**: roadmap

- **Spec Reference**: PRD-R1〜R6 / TRD-R1〜R6 / UXS-F1〜F3
- **Summary**: アラームセット→カウントダウン→解除 or ペナルティ発火→結果表示の完全ループが Vercel 上で動作する。
- **Acceptance Criteria (Gherkin)**:
  ```
  Given WakeOrPay が Vercel にデプロイ済,
  When 所有者がシナリオ A〜D を手動実行,
  Then 全シナリオが pass し SC-001〜SC-006 を満たす.
  ```
- **Test Plan**:
  - [ ] シナリオ A: 正常系（アラームセット→時刻前に解除→ペナルティなし）
  - [ ] シナリオ B: ペナルティ発火（セット→未解除→時刻経過→Vercel ログに success）
  - [ ] シナリオ C: 過去時刻バリデーション（エラー表示、QStash 未呼び出し）
  - [ ] シナリオ D: 解除失敗時のリトライ UI 表示
  - [ ] `tsc --noEmit` エラーなし

---

### Issue: 01 - Technical Debt: Project - 初期セットアップ
**Form**: Technical Debt
**Labels**: technical-debt

- **Spec Reference**: PRD-R1 / TRD-R1
- **Description**: Effort: 2
- **Acceptance Criteria (Gherkin)**:
  ```
  Given リポジトリのルート,
  When create-next-app でプロジェクトを作成し依存を追加,
  Then Next.js 15 App Router + TypeScript strict + Tailwind CSS が動作し、
  And @upstash/qstash と openai がインストール済で、
  And .env.local に全環境変数のテンプレートが存在し、
  And tsc --noEmit がエラーなしで通る.
  ```
- **Current Impact**: プロジェクト未作成のため全後続 issue がブロックされる。
- **Proposed Solution**:
  1. `npx create-next-app@latest` で Next.js 15 プロジェクト作成（TS, Tailwind, App Router, ESLint）
  2. `npm install @upstash/qstash openai`
  3. `.env.local.example` に環境変数テンプレート（OPENAI_API_KEY, QSTASH_TOKEN, QSTASH_CURRENT_SIGNING_KEY, QSTASH_NEXT_SIGNING_KEY, APP_BASE_URL）
  4. plan.md の Project Structure に従い空ディレクトリ構成を準備
  5. `tsc --noEmit` pass 確認

---

### Issue: 02 - Feature: API - アラームセット・解除 API
**Form**: Feature
**Labels**: enhancement

- **Spec Reference**: PRD-R1, PRD-R2, PRD-R4 / TRD-R1, TRD-R2 / UXS-F1, UXS-F2
- **Description**: Effort: 5
  POST /api/schedule で QStash にアラームスケジュールを登録し、DELETE /api/schedule でキャンセルする Route Handler を実装する。
- **Why**: アラームのセットと解除の裏側で QStash スケジュールを制御する。ブラウザに QStash トークンを露出させないためのサーバー側プロキシ。
- **User Story**: アラーム所有者として、ブラウザからアラーム時刻をセット/解除したい。サーバー側で QStash と安全に通信してほしい。
- **Requirements**:
  - [ ] POST /api/schedule: body `{ alarmId, fireAt }` を受け取り QStash publishJSON で notBefore 付きメッセージを登録
  - [ ] fireAt > Date.now() のサーバー側再検証（過去時刻は 400）
  - [ ] 成功時 `{ ok: true, messageId }` を返却
  - [ ] DELETE /api/schedule?id={messageId}: QStash messages.delete でキャンセル
  - [ ] 成功時 `{ ok: true }`、失敗時 `{ ok: false, reason }` を返却
  - [ ] lib/qstash.ts に QStash Client 操作を分離（1ファイル1責務）
- **Acceptance Criteria (Gherkin)**:
  ```
  Given 有効な未来時刻の alarmId と fireAt,
  When POST /api/schedule を呼ぶ,
  Then QStash に notBefore 付きメッセージが登録され messageId が返る.

  Given 登録済の messageId,
  When DELETE /api/schedule?id={messageId} を呼ぶ,
  Then QStash のメッセージがキャンセルされ { ok: true } が返る.

  Given 過去の fireAt,
  When POST /api/schedule を呼ぶ,
  Then 400 { ok: false, reason: "past_time" } が返り QStash は呼ばれない.
  ```
- **Technical Considerations**:
  - QSTASH_TOKEN, APP_BASE_URL は process.env から取得
  - @upstash/qstash Client SDK を使用
  - QStash への URL は `${APP_BASE_URL}/api/punish`
- **Related Issues**: Depends on #1（プロジェクトセットアップ）、Blocks #4（UI）

---

### Issue: 03 - Feature: API - ペナルティ実行 API
**Form**: Feature
**Labels**: enhancement

- **Spec Reference**: PRD-R3, PRD-R4, PRD-R6 / TRD-R3, TRD-R4 / UXS-F3
- **Description**: Effort: 5
  POST /api/punish で QStash 署名を検証し、通過後に OpenAI GPT-4o へ長文プロンプトを1回送信してペナルティ（課金）を発生させる。
- **Why**: アプリの核心機能。寝坊時に自動的に OpenAI API 課金を発生させることで起床の動機付けを作る。
- **User Story**: 寝坊した自分に対して、設定時刻に自動で OpenAI API が呼ばれて課金が発生してほしい。
- **Requirements**:
  - [ ] Upstash-Signature ヘッダーを @upstash/qstash Receiver.verify() で検証。失敗→401
  - [ ] OPENAI_API_KEY 未設定→500 で OpenAI 未呼び出し
  - [ ] openai SDK で GPT-4o chat.completions.create を1回呼び出し
  - [ ] lib/punish-prompt.ts に固定長文プロンプトを定数として定義
  - [ ] lib/openai-punish.ts に OpenAI 呼び出しロジックを分離
  - [ ] 成功判定: HTTP 200 & usage.prompt_tokens > 0
  - [ ] サーバー標準出力にログ: `[punish] alarmId=<id> status=success/error ...`
  - [ ] 成功→200 { ok: true }、失敗→500 { ok: false, reason }
- **Acceptance Criteria (Gherkin)**:
  ```
  Given 有効な QStash 署名付きリクエスト,
  When POST /api/punish を呼ぶ,
  Then OpenAI GPT-4o が1回呼ばれ usage.prompt_tokens > 0 で、
  And サーバーログに [punish] status=success が出力される.

  Given 無効な署名のリクエスト,
  When POST /api/punish を呼ぶ,
  Then 401 が返り OpenAI は呼ばれない.

  Given OPENAI_API_KEY 未設定,
  When POST /api/punish を呼ぶ,
  Then 500 が返り OpenAI は呼ばれない.
  ```
- **Technical Considerations**:
  - QSTASH_CURRENT_SIGNING_KEY / QSTASH_NEXT_SIGNING_KEY で署名検証
  - OpenAI のレート制限・残高不足エラーのハンドリング
  - QStash は 2xx を「成功」とみなすため、リトライさせたくない場合は常に 200 を返す選択肢もあるが、失敗時は 500 で QStash のリトライに任せる
- **Related Issues**: Depends on #1（プロジェクトセットアップ）、Blocks #5（手動検証）

---

### Issue: 04 - Feature: UI - アラーム画面
**Form**: Feature
**Labels**: enhancement

- **Spec Reference**: PRD-R1, PRD-R2, PRD-R5 / TRD-R5, TRD-R6 / UXS-F1, UXS-F2, UXS-F3, UXS-S1〜S5
- **Description**: Effort: 5
  app/page.tsx にアラームの全画面状態（セット・カウントダウン・解除・結果表示）を実装する。状態は localStorage で永続化。
- **Why**: ユーザーが実際に操作する唯一の画面。セット→解除→結果確認の体験を提供する。
- **User Story**: 所有者として、ブラウザ1画面でアラームのセット・カウントダウン確認・解除・結果確認を全て行いたい。
- **Requirements**:
  - [ ] 画面状態: Set / Countdown / Dismissed / Punished / Failed を AlarmStatus に応じて切替
  - [ ] Set 画面: datetime-local 入力 + セットボタン。過去時刻バリデーション
  - [ ] 既存アラームがある場合は上書き確認（window.confirm）
  - [ ] セット成功時: POST /api/schedule → localStorage 保存 → Countdown へ遷移
  - [ ] Countdown 画面: HH:MM:SS カウントダウン（毎秒更新）+ 解除ボタン
  - [ ] 解除: DELETE /api/schedule → 成功待ち → Dismissed へ。失敗→エラー + リトライ
  - [ ] ブラウザ再訪時: localStorage から復元。fireAt < now かつ scheduled → punished（推定）へ自動遷移
  - [ ] 各終端状態（Dismissed/Punished/Failed）に「新しいアラームをセット」ボタン
  - [ ] lib/alarm-storage.ts に localStorage 読み書きを分離
  - [ ] aria-live="polite" で状態変化を通知
  - [ ] ボタンの最小タッチターゲット 44×44px
- **Acceptance Criteria (Gherkin)**:
  ```
  Given 初回表示（アラーム未設定）,
  When ページを開く,
  Then 時刻入力とセットボタンが表示される.

  Given 有効な未来時刻を入力,
  When セットボタンを押す,
  Then カウントダウン画面に遷移し残り時間と解除ボタンが表示される.

  Given カウントダウン中,
  When 解除ボタンを押し API が成功,
  Then 「解除完了」画面が表示される.

  Given セット済でブラウザを閉じ,
  When 時刻経過後にブラウザを再度開く,
  Then 「ペナルティ執行済（推定）」画面が表示される.

  Given 解除 API が失敗,
  When 解除ボタンを押す,
  Then エラーメッセージとリトライボタンが表示される.
  ```
- **Technical Considerations**:
  - React 19 の use client ディレクティブ（localStorage アクセスのため）
  - setInterval で毎秒カウントダウン更新。cleanup で clearInterval
  - Tailwind CSS でスタイリング。色: blue-600 / green-600 / red-600 / yellow-600
- **Related Issues**: Depends on #2（Schedule API）, Depends on #1（プロジェクトセットアップ）

---

### Issue: 05 - Docs: Verification - 手動 E2E 検証 + Vercel デプロイ
**Form**: Docs
**Labels**: documentation

- **Spec Reference**: PRD-R1〜R6 / TRD-R1〜R6 / UXS-F1〜F3
- **Description**: Effort: 3
  Vercel にデプロイし、quickstart.md のシナリオ A〜D を手動実行して全 SC を検証する。結果を記録する。
- **Acceptance Criteria (Gherkin)**:
  ```
  Given 全実装が完了し Vercel にデプロイ済,
  When シナリオ A（正常解除）を実行,
  Then ペナルティが発生せず解除完了が表示される.

  Given Vercel デプロイ済,
  When シナリオ B（ペナルティ発火）を実行,
  Then Vercel ログに [punish] status=success が出力され OpenAI 課金が確認できる.

  Given Vercel デプロイ済,
  When シナリオ C（過去時刻）を実行,
  Then バリデーションエラーが表示され QStash は呼ばれない.

  Given Vercel デプロイ済,
  When シナリオ D（解除失敗リトライ）を実行,
  Then エラーメッセージとリトライボタンが表示される.
  ```
- **Topics to Cover**:
  - [ ] Vercel デプロイ手順と環境変数設定
  - [ ] シナリオ A〜D の実行結果記録
  - [ ] SC-001〜SC-006 の検証結果
  - [ ] 発見された問題と対応（あれば）

---

## Roadmap Hygiene

### First 5 Issues to Create（順序）

1. `#1` 00 - Milestone: WakeOrPay MVP
2. `#2` 01 - Technical Debt: 初期セットアップ
3. `#3` 02 - Feature: アラームセット・解除 API
4. `#4` 03 - Feature: ペナルティ実行 API
5. `#5` 04 - Feature: アラーム UI
6. `#6` 05 - Docs: 手動 E2E 検証 + デプロイ

### Dependencies / Critical Path

```
#2 (セットアップ) → #3 (Schedule API) → #5 (UI) → #6 (検証)
#2 (セットアップ) → #4 (Punish API) → #6 (検証)
```

### What to Validate After Each Merge

- #2: `tsc --noEmit` pass、`npm run dev` で Next.js 起動
- #3: curl で POST/DELETE /api/schedule が期待レスポンスを返す
- #4: curl で POST /api/punish が署名なし→401、署名あり→200
- #5: ブラウザで全画面状態遷移を目視確認
- #6: シナリオ A〜D pass

### What Must Be Documented

- [ ] .env.local.example（環境変数テンプレート）
- [ ] quickstart.md の検証結果更新
