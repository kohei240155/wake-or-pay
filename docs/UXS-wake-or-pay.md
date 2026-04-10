# UXS: WakeOrPay（寝坊防止ペナルティアラーム）

- **Owner**: Kohei Fujiwara
- **Version**: v0.2 / 2026-04-09
- **Status**: Final
- **Links**: [PRD](./PRD-wake-or-pay.md), [TRD](./TRD-wake-or-pay.md)
- **Platforms**: Web（デスクトップブラウザ。モバイル対応は任意）
- **Traceability Prefix**: UXS-
- **PRD/TRD Mapping**: PRD-R1〜R6, TRD-R1〜R6

---

## UX Goals

| ID | Goal | PRD Mapping |
|---|---|---|
| UXS-G1 | 30秒以内にアラームをセットできる最小摩擦の体験 | PRD-G2 |
| UXS-G2 | 「寝坊したら課金される」という緊張感を画面から伝える | PRD-G1 |
| UXS-G3 | 結果（解除済 / 執行済 / 失敗）を一目で把握できる | PRD-R5 |

---

## Experience Principles

1. **One screen, one action**: 画面は1つ。状態に応じて表示が切り替わる。
2. **No shame, just stakes**: 脅しではなく「金銭的インセンティブ」としてフレーミングする。
3. **Fail-visible**: エラーは隠さず、リトライ手段を明示する。
4. **Progressive disclosure**: 最初はセットフォームのみ。セット後にカウントダウン表示。
5. **Trust through transparency**: ペナルティの仕組み（QStash → OpenAI）を画面下部に簡潔に説明。

---

## Users & Scenarios

### Persona

- **所有者（開発者）**: 寝坊癖がある。技術的バックグラウンドあり。1台のデスクトップ PC で使用。

### Primary Scenario（Happy Path）

就寝前にブラウザを開く → 翌朝6:30をセット → 就寝 → 翌朝6:20に起床 → ブラウザを開いて「解除」を押す → 「解除完了」表示 → 安心して一日を始める

### Secondary Scenario

寝過ごして7:00に起床 → ブラウザを開くと「ペナルティ執行済（推定）」表示 → 次回は気をつけようと思う

---

## Information Architecture

- **Single page app**（`app/page.tsx` のみ）
- ナビゲーション不要。Alarm の status に応じて1画面の表示が切り替わる。

---

## Core Flows

### UXS-F1: アラームセット（PRD-R1, TRD-R1）

- **Trigger**: アプリ初回表示 or 前回アラーム終了後
- **Steps**:
  1. 日時入力フィールド（`datetime-local`）が表示される
  2. 未来の時刻を入力
  3. 「セット」ボタンを押す
  4. /api/schedule POST → 成功 → localStorage に保存 → カウントダウン画面へ
- **Success state**: カウントダウン + 解除ボタンが表示
- **Failure/Edge states**:
  - 過去時刻 → バリデーションエラー「過去の時刻は設定できません」
  - 既存アラームあり → 上書き確認ダイアログ「既存のアラームを上書きしますか？」
  - /api/schedule 失敗 → エラーメッセージ + リトライボタン
- **Events**: `alarm_set`（時刻、成功/失敗）

### UXS-F2: カウントダウン & 解除（PRD-R2, TRD-R2）

- **Trigger**: アラームが scheduled 状態
- **Steps**:
  1. 残り時間のカウントダウンが1秒ごとに更新される
  2. 「解除」ボタンが常時表示
  3. ボタン押下 → DELETE /api/schedule → 成功待ち → 「解除完了」
- **Success state**: 「解除完了！ペナルティは発生しません。」+ 新規セットボタン
- **Failure/Edge states**:
  - キャンセル API 失敗 → 「解除に失敗しました」+ リトライボタン（FR-007a）
  - カウントダウン中にブラウザリロード → localStorage から復元して継続
- **Events**: `alarm_dismissed`（成功/失敗）

### UXS-F3: ペナルティ執行結果表示（PRD-R3, R5, TRD-R6）

- **Trigger**: ブラウザ再訪時に fireAt < now() かつ status === scheduled
- **Steps**:
  1. ページ読み込み時に localStorage の Alarm を確認
  2. 時刻超過 & 未解除 → status を punished（推定）に自動更新
  3. 結果画面を表示
- **Success state**: 「ペナルティ執行済（推定）」+ 執行日時 + 新規セットボタン
- **Failure/Edge states**:
  - status が failed → 「ペナルティ実行に失敗しました。詳細はサーバーログを確認してください。」
- **Events**: `penalty_result_viewed`

---

## Screen Inventory & Behavior Specs

| ID | Screen State | Purpose | Primary Action | Secondary Action | Key States |
|---|---|---|---|---|---|
| UXS-S1 | Set（初期 / リセット後） | アラーム時刻をセットする | 「セット」ボタン | なし | Empty（初期表示）、Error（過去時刻・API失敗）、Loading（API呼び出し中） |
| UXS-S2 | Countdown（scheduled） | 残り時間を表示し解除を待つ | 「解除」ボタン | なし | Active（カウントダウン中）、Loading（解除API呼び出し中）、Error（解除失敗） |
| UXS-S3 | Dismissed（cancelled） | 解除成功を伝える | 「新しいアラームをセット」 | なし | Success |
| UXS-S4 | Punished（punished） | ペナルティ執行済を伝える | 「新しいアラームをセット」 | なし | Punished（推定 or 確定） |
| UXS-S5 | Failed（failed） | ペナルティ失敗を伝える | 「新しいアラームをセット」 | なし | Error |

---

## Components & Design System Direction

### Design System Direction

**Recommended**: Lightweight custom（Tailwind CSS ユーティリティベース）

| Option | Best For | Pros | Cons | When to Choose |
|---|---|---|---|---|
| **Lightweight custom (Tailwind)** | 個人PoC / 内部ツール | 高速開発。依存最小。柔軟 | デザイン一貫性は自己管理 | ✅ 単一所有者 MVP |
| shadcn/ui | プロダクト品質の Web アプリ | アクセシビリティ内蔵。一貫した UI | 追加セットアップ。MVP にはオーバー | 公開配布時 |

### Component Inventory

- **DateTime input**: `<input type="datetime-local">`（ネイティブ）
- **Primary button**: セット / 解除 / リトライ / 新規セット
- **Countdown display**: `HH:MM:SS` 形式。毎秒更新
- **Status banner**: 状態に応じた色付きメッセージ（scheduled=青、cancelled=緑、punished=赤、failed=黄）
- **Confirm dialog**: 上書き確認（ネイティブ `window.confirm` で十分）
- **Error message**: 赤テキスト + リトライボタン

### Design Tokens（Lightweight）

- **Typography**: システムフォント。見出し: text-2xl bold、本文: text-base
- **Spacing**: Tailwind デフォルト（4px 単位）
- **Color roles**:
  - Primary（セット/解除ボタン）: blue-600
  - Success（解除完了）: green-600
  - Danger（ペナルティ執行済）: red-600
  - Warning（失敗）: yellow-600
  - Surface: white / gray-50
- **Motion**: ボタン hover 時の opacity 遷移のみ。過度なアニメーションなし

---

## Accessibility Requirements

- [x] すべてのインタラクティブ要素にキーボード操作対応（Tab / Enter / Escape）
- [x] フォーカスインジケータの可視化（Tailwind `focus:ring`）
- [x] ボタンの最小タッチターゲット 44×44 CSS px
- [x] テキストコントラスト比 4.5:1 以上
- [x] 状態変化を `aria-live="polite"` でスクリーンリーダーに通知
- [x] datetime-local 入力のラベル (`<label>`) を明示

---

## Content, Tone & Microcopy

### Tone: 実用的、淡々、ほんの少しユーモア

| Context | Do | Don't |
|---|---|---|
| セット成功 | 「アラームをセットしました。おやすみなさい。」 | 「アラームが正常に登録されました！」 |
| 解除成功 | 「解除完了！ペナルティなし。いい朝ですね。」 | 「アラームの解除処理が正常に完了しました。」 |
| ペナルティ執行 | 「ペナルティ執行済。次は起きましょう。」 | 「罰金が発生しました！！！」 |
| エラー | 「解除に失敗しました。もう一度お試しください。」 | 「エラーが発生しました。管理者に連絡してください。」 |

### Empty States

- 初回表示: 「起床時刻をセットしてください。時刻までに解除しないと OpenAI API が呼ばれて課金されます。」

---

## Instrumentation Requirements

| Event | Trigger | PRD Metric |
|---|---|---|
| `alarm_set` | セットボタン押下 → API 成功 | Time to set |
| `alarm_dismissed` | 解除ボタン → API 成功 | Dismiss reliability |
| `alarm_dismiss_failed` | 解除ボタン → API 失敗 | Dismiss reliability |
| `penalty_result_viewed` | 再訪時にペナルティ状態を表示 | — |

MVP ではブラウザ console.log レベル。Analytics SDK は導入しない。

---

## UX Acceptance Criteria

画面/フローが「完了」と見なせる条件:
- [x] 全状態（Set / Countdown / Dismissed / Punished / Failed）が定義済
- [x] 各状態の Empty / Loading / Error / Success が定義済
- [x] アクセシビリティチェックリスト充足
- [x] イベント計測ポイントが指定済
- [x] マイクロコピーが決定済

---

## GitHub Issue Readiness

### Milestone

- **M1**: WakeOrPay MVP — アラーム→ペナルティ完全ループ

### First-Slice Issues

| # | Title | Type | PRD IDs | TRD IDs | UXS IDs | Effort |
|---|---|---|---|---|---|---|
| 01 | プロジェクト初期セットアップ（Next.js 15 + 依存 + 環境変数） | Technical Debt | PRD-R1 | TRD-R1 | — | 2 |
| 02 | アラームセット・解除 API（POST/DELETE /api/schedule） | Feature | PRD-R1, R2, R4 | TRD-R1, R2 | UXS-F1, F2 | 5 |
| 03 | ペナルティ実行 API（POST /api/punish + QStash 署名検証） | Feature | PRD-R3, R4, R6 | TRD-R3, R4 | UXS-F3 | 5 |
| 04 | アラーム UI（セット・カウントダウン・解除・状態表示 + localStorage） | Feature | PRD-R1, R2, R5 | TRD-R5, R6 | UXS-F1, F2, F3, UXS-S1〜S5 | 5 |
| 05 | 手動 E2E 検証 + Vercel デプロイ | Docs | PRD-R1〜R6 | TRD-R1〜R6 | UXS-F1〜F3 | 3 |

---

## Open Questions

なし（既存仕様の Clarification セッションで全解消済）。

---

## Handoff Checklist

- [x] Screen inventory complete（UXS-S1〜S5）
- [x] Flow specs complete（UXS-F1〜F3）
- [x] Component inventory defined
- [x] Accessibility checklist completed
- [x] Instrumentation events listed
- [x] Thin slice scope explicitly called out
