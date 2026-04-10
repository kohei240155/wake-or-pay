# PRD: WakeOrPay（寝坊防止ペナルティアラーム）

- **Owner**: Kohei Fujiwara
- **Version**: v0.2 / 2026-04-09
- **Status**: Final
- **Doc Links**: [TRD](./TRD-wake-or-pay.md), [UXS](./UXS-wake-or-pay.md)
- **Traceability Prefix**: PRD-

---

## Summary

WakeOrPay は、寝坊防止のためにブラウザ上で起床時刻を設定し、時刻までに解除しなければ OpenAI API が自動実行されて所有者の API キーに課金（罰金）が発生する、単一所有者向けの Web アプリである。「寝坊すると実際にお金が減る」という心理的ペナルティで起床動機を作ることが目的。MVP は所有者本人1人が使う前提で、認証・マルチユーザー・DB は不要。

---

## Problem Statement

- **Current state**: アラームアプリは無数に存在するが、「無視しても何も起きない」ため寝坊を防ぐ強制力に欠ける。
- **Pain points**: 目覚まし音を止めて二度寝する行為にペナルティがない。意志力だけでは改善しない。
- **Why now**: 個人開発で即構築可能。外部スケジューラ（QStash）と課金 API（OpenAI）を組み合わせることで、サーバーレスかつ DB 不要で実現できる技術環境が整った。

---

## Goals & Non-Goals

### Goals

| ID | Goal |
|---|---|
| PRD-G1 | 設定時刻までに起きなければ実際に課金が発生する仕組みを提供し、起床の動機付けを強化する |
| PRD-G2 | ブラウザだけで完結し、30秒以内にアラームをセットできる低摩擦な体験を提供する |

### Non-Goals

- マルチユーザー対応・認証機能
- モバイルネイティブアプリ
- 音声・通知によるアラーム再生（あれば望ましいが必須ではない）
- ペナルティ金額のカスタマイズ
- 複数アラームの同時管理
- 自動テストの整備（MVP では手動検証）

---

## Target Users & Top Use Cases

**Primary persona**: 所有者本人（開発者。寝坊癖があり、金銭ペナルティで自己を律したい）

| # | Use Case |
|---|---|
| 1 | 就寝前にブラウザで翌朝の起床時刻をセットし、翌朝時刻前に解除する（正常系） |
| 2 | 寝過ごして時刻を超過し、ペナルティ（OpenAI 課金）が自動実行される（ペナルティ系） |
| 3 | ブラウザ再訪時に直近のアラーム結果（解除済 or 執行済）を確認する |

---

## Core Experience / Product Loop

1. ブラウザでアプリを開く
2. 起床時刻を入力して「セット」を押す
3. カウントダウン画面に遷移し、残り時間と「解除」ボタンが表示される
4. **起きた場合**: 時刻前に「解除」を押す → ペナルティなし → 完了
5. **寝坊した場合**: 時刻超過 → サーバー側で OpenAI API が自動呼び出し → 課金発生
6. 次回ブラウザを開くと結果（解除済 / 執行済）が表示される
7. 新しいアラームをセットして翌日に備える

---

## Requirements

| ID | Priority | Requirement | User Value | Acceptance Criteria |
|---|---|---|---|---|
| PRD-R1 | Must | ブラウザ上でアラーム時刻をセットできる | セットに30秒以内、過去時刻はエラー | Given 未設定状態 When 有効な未来時刻を入力しセット Then カウントダウン画面が表示される |
| PRD-R2 | Must | 時刻前に解除ボタンでアラームを解除できる | 起きたらペナルティなし | Given セット済で時刻前 When 解除ボタン押下 Then アラーム解除済になりペナルティ未発生 |
| PRD-R3 | Must | 時刻超過で OpenAI API が1回自動実行され課金が発生する | 寝坊に金銭ペナルティ | Given セット済で未解除 When 時刻到達 Then OpenAI API が1回呼ばれ課金が発生する |
| PRD-R4 | Must | 同一アラームへのペナルティ二重実行がない | 不当な課金を防止 | Given ペナルティ執行済 When 時間経過 Then 二重実行されない |
| PRD-R5 | Must | ブラウザ再訪時にアラーム状態が復元される | 結果を確認できる | Given アラームセット後にブラウザ閉じ When 再訪 Then 状態が復元されている |
| PRD-R6 | Should | ペナルティはブラウザの状態（閉じ・スリープ）に関係なく実行される | 抜け穴を防ぐ | Given セット済 When ブラウザ閉じたまま時刻超過 Then ペナルティが実行される |

---

## Success Metrics

| Metric | Definition | Target | Measurement Method | Notes |
|---|---|---|---|---|
| Time to set | アプリ表示からアラームセット完了まで | < 30秒 | 手動計測 | SC-001 |
| Dismiss reliability | 解除時にペナルティが発生しない割合 | 100% | 手動テスト + ログ確認 | SC-002 |
| Fire reliability | 未解除アラームが60秒以内に発火する割合 | ≥ 95% | Vercel ログの発火タイムスタンプ | SC-003（QStash 依存） |
| No double fire | 同一アラームへの二重実行発生率 | 0% | ログ確認 | SC-004 |

---

## Assumptions & Options

| Assumption | Why It Matters | How We'll Test | Options If False |
|---|---|---|---|
| QStash は notBefore 指定で60秒以内に発火する | SC-003 の保証 | 2分後アラームで実測 | cron ベースに変更 or 許容時間を拡大 |
| 所有者1人だけが使う | 認証・マルチテナント不要の根拠 | 前提条件として固定 | 認証を追加する（PRD-R7 以降） |
| OpenAI GPT-4o 呼び出し1回で十分な課金が発生する | 罰金の実効性 | 実際に呼んで Usage ダッシュボード確認 | プロンプトを長くする or 複数回呼ぶ |

---

## Risks & Mitigations

- **Engagement risk**: 自分しか使わないので N/A。
- **Safety/Trust risk**: OpenAI APIキーの漏洩 → サーバー環境変数のみに保持し、クライアントに露出しない。
- **Feasibility risk**: QStash の発火遅延 → QStash 公式の SLA に依存。60秒許容で設計。
- **Measurement risk**: ペナルティ成否はサーバーログでしか確認できない → MVP では許容。

---

## Out of Scope（再掲）

- 認証、マルチユーザー、DB、モバイルアプリ、音声アラーム、金額カスタマイズ、複数アラーム同時管理、自動テスト

---

## Open Questions

なし（Clarification セッションで全解消済）。

---

## Release Slice

- **Ship first**: アラームセット → 解除 or ペナルティ発火 → 状態表示の一連のループ（PRD-R1〜R6 全て）
- **Delay**: マルチアラーム、認証、通知音、テスト自動化
- **Prototype**: N/A

---

## Roadmap Readiness Pack

### A) Decision Lock Summary

- **Fixed**: 単一所有者、認証なし、DB なし、QStash + OpenAI のみ、localStorage で状態保持
- **Open**: なし

### B) PRD → Backlog Mapping

| Epic | Goal | Key Acceptance | PRD IDs |
|---|---|---|---|
| E1: WakeOrPay MVP | アラームセット→解除→ペナルティ発火→状態表示の完全ループ | 全 SC を満たす | PRD-R1〜R6 |

### C) First Release Slice

PRD-R1〜R6 全て（マイクロプロジェクトのため分割不要）

### D) Inputs Needed for TRD

- QStash Messages API の `notBefore` パラメータの精度
- `@upstash/qstash` SDK の Receiver 署名検証 API

### E) Inputs Needed for UXS

- 画面数と状態遷移（セット画面 / カウントダウン / 結果表示）
- エラー時の UI パターン

---

## GitHub Issue Readiness

### Milestone

- **M1**: WakeOrPay MVP — アラーム→ペナルティ完全ループ

### First-Slice Issues

| # | Title | Type | PRD IDs | Effort |
|---|---|---|---|---|
| 01 | プロジェクト初期セットアップ（Next.js 15 + 依存 + 環境変数） | Technical Debt | PRD-R1 | 2 |
| 02 | アラームセット・解除 API（POST/DELETE /api/schedule） | Feature | PRD-R1, R2, R4 | 5 |
| 03 | ペナルティ実行 API（POST /api/punish + QStash 署名検証） | Feature | PRD-R3, R4, R6 | 5 |
| 04 | アラーム UI（セット・カウントダウン・解除・状態表示） | Feature | PRD-R1, R2, R5 | 5 |
| 05 | 手動 E2E 検証 + デプロイ | Docs | PRD-R1〜R6 | 3 |
