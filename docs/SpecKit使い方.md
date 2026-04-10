# Spec Kit 使い方ガイド（Claude Code 版）

本リポジトリには [GitHub Spec Kit](https://github.com/github/spec-kit) が導入済みです。Claude Code のスラッシュコマンドとして `/speckit-*` が使えるようになっており、仕様駆動開発のワークフローを対話的に進められます。

---

## 1. 導入済みのもの

- `.claude/skills/speckit-*` — Claude Code から呼び出せるスキル群
- `.specify/` — Spec Kit の設定・テンプレート・メモリ
  - `templates/` — 仕様書テンプレート
  - `memory/` — プロジェクト原則（constitution）保存先
  - `scripts/` — 内部スクリプト
  - `integrations/` — Git 連携等

---

## 2. コマンド一覧

### コアワークフロー（この順に実行）

| # | コマンド | 役割 |
|---|---|---|
| 1 | `/speckit-constitution` | プロジェクトの **原則・制約** を策定（最初に 1 回） |
| 2 | `/speckit-specify` | 機能の **仕様書**（PRD 相当）を作成 |
| 3 | `/speckit-clarify` *(任意)* | 曖昧点を構造化された質問で潰す（`plan` の前推奨） |
| 4 | `/speckit-plan` | **実装プラン**（アーキ設計）を作成 |
| 5 | `/speckit-checklist` *(任意)* | 要件の網羅性・整合性を検証するチェックリスト生成 |
| 6 | `/speckit-tasks` | プランから **実行可能タスク** に分解 |
| 7 | `/speckit-analyze` *(任意)* | 仕様・プラン・タスクの整合性レポート |
| 8 | `/speckit-implement` | タスクに沿って **実装を実行** |

### Git 連携コマンド

| コマンド | 役割 |
|---|---|
| `/speckit-git-initialize` | Git リポジトリの初期化 |
| `/speckit-git-feature` | Feature ブランチを作成 |
| `/speckit-git-validate` | コミット前の検証 |
| `/speckit-git-commit` | 規約に沿ったコミット作成 |
| `/speckit-git-remote` | リモート push / PR 関連 |
| `/speckit-taskstoissues` | `tasks.md` を GitHub Issue に変換 |

---

## 3. 基本の進め方

### Step 0：Claude Code を起動

このディレクトリ（`/Users/kohei/dev/wake-or-pay`）で Claude Code を開きます。スキルは自動で読み込まれます。

### Step 1：プロジェクト原則を定める（1 回だけ）

```
/speckit-constitution
```

- アーキテクチャ方針、品質基準、禁止事項などを対話で策定
- 結果は `.specify/memory/` 配下に保存され、以降のすべてのコマンドが参照

### Step 2：機能仕様を作成

```
/speckit-specify
```

- 「何を・なぜ作るか」を対話で固める
- Gherkin 形式の受け入れ基準付きで仕様書が生成される
- 出力先：`specs/NNN-feature-slug/spec.md`

（任意）仕様に曖昧さが残っていそうなら：

```
/speckit-clarify
```

### Step 3：実装プラン作成

```
/speckit-plan
```

- 技術選定、モジュール分割、データモデル等を設計
- 出力：`specs/NNN-feature-slug/plan.md`

（任意）品質チェックリストを作成：

```
/speckit-checklist
```

### Step 4：タスク分解

```
/speckit-tasks
```

- `plan.md` から順序付きの実行可能タスクを生成
- 出力：`specs/NNN-feature-slug/tasks.md`

（任意）仕様 / プラン / タスクの不整合を検出：

```
/speckit-analyze
```

### Step 5：GitHub Issue 化（任意）

```
/speckit-taskstoissues
```

- `tasks.md` の各タスクを GitHub Issue として作成

### Step 6：実装

```
/speckit-implement
```

- `tasks.md` に沿って順番にコードを生成・編集
- 必要に応じて Git 連携コマンドでコミット & PR

---

## 4. 典型的なセッションの流れ

```
# プロジェクト初回（1 回だけ）
/speckit-constitution

# 機能ごとにループ
/speckit-specify            # 仕様
/speckit-clarify            # （任意）曖昧点の解消
/speckit-plan               # 設計
/speckit-checklist          # （任意）品質チェック
/speckit-tasks              # タスク分解
/speckit-analyze            # （任意）整合性確認
/speckit-taskstoissues      # （任意）Issue 化
/speckit-git-feature        # feature ブランチ作成
/speckit-implement          # 実装
/speckit-git-validate       # 検証
/speckit-git-commit         # コミット
/speckit-git-remote         # push / PR
```

---

## 5. 生成物の置き場所

```
.specify/
├── memory/          # constitution（プロジェクト原則）
├── templates/       # 仕様書テンプレート
├── scripts/         # 内部スクリプト
└── integrations/    # Git 等の連携

specs/
└── NNN-feature-slug/
    ├── spec.md      # /speckit-specify の出力
    ├── plan.md      # /speckit-plan の出力
    └── tasks.md     # /speckit-tasks の出力
```

本リポジトリ独自の `docs/PRD-TRD-USX/`・`docs/prompts/` 系ワークフローと Spec Kit は **併用可能** です。使い分けの目安：

- **手動でプロンプトを当てたい / 学習目的** → `docs/` 配下のプロンプト群（`docs/仕様駆動開発ガイド.md` 参照）
- **対話で自動生成したい / スピード重視** → `/speckit-*` コマンド

---

## 6. トラブルシュート

- **スラッシュコマンドが出ない** → Claude Code を再起動。`.claude/skills/speckit-*` があることを確認
- **Spec Kit を再インストールしたい**：
  ```bash
  uv tool install specify-cli --force --from git+https://github.com/github/spec-kit.git
  specify init --here --force --ai claude
  ```
- **バージョン確認**：`specify --help`

---

## 7. 参考

- Spec Kit: https://github.com/github/spec-kit
- 本リポジトリの仕様駆動開発フロー全体像：`docs/仕様駆動開発ガイド.md`
- エージェント向けクイックリファレンス：`AGENTS.md`
- 完全 SOP：`docs/contributing/AGENT-WORKFLOW.md`
