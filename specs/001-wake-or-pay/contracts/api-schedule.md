# Contract: `POST /api/schedule` / `DELETE /api/schedule`

**Date**: 2026-04-09

ブラウザが QStash トークンを持たずにスケジュール登録・キャンセルを行うためのサーバー側プロキシ Route Handler。

## 共通

- **認証**: なし（単一所有者前提、FR-015）。
- **環境変数依存**: `QSTASH_TOKEN`, `APP_BASE_URL`
- **実装**: `@upstash/qstash` の `Client` を使用。

---

## `POST /api/schedule`

アラームをセットしたときにブラウザから呼ばれる。QStash に「指定時刻に1回だけ `POST {APP_BASE_URL}/api/punish` する」配信を登録する。

### リクエスト

```json
{ "alarmId": "string (UUID)", "fireAt": 1712620800000 }
```

- `fireAt` は Unix ms。
- サーバー側で `fireAt > Date.now()` を再検証し、過去なら `400 { "ok": false, "reason": "past_time" }`。

### 処理

```ts
const client = new Client({ token: process.env.QSTASH_TOKEN! });
const res = await client.publishJSON({
  url: `${process.env.APP_BASE_URL}/api/punish`,
  body: { alarmId, fireAt },
  notBefore: Math.floor(fireAt / 1000), // Unix 秒
});
return { messageId: res.messageId };
```

### レスポンス

- **200**: `{ "ok": true, "messageId": "<string>" }`
- **400**: `{ "ok": false, "reason": "past_time" | "bad_request" }`
- **500**: `{ "ok": false, "reason": "qstash_error", "detail": "<message>" }`

---

## `DELETE /api/schedule?id={messageId}`

ユーザーが解除ボタンを押したときに呼ばれる。QStash の該当メッセージをキャンセルする。

### リクエスト

- クエリ `id`: 必須。`POST /api/schedule` で返却された `messageId`。

### 処理

```ts
const client = new Client({ token: process.env.QSTASH_TOKEN! });
await client.messages.delete(messageId);
```

### レスポンス

- **200**: `{ "ok": true }` — クライアントはこの 2xx を確認してから UI を「解除完了」に更新する（FR-007a）。
- **404**: `{ "ok": false, "reason": "not_found" }` — 既に配信済みなどの可能性。クライアントはリトライを提示。
- **500**: `{ "ok": false, "reason": "qstash_error", "detail": "<message>" }`

## 注意

- この Route Handler は **QStash 署名検証の対象ではない**（QStash からの呼び出しではないため）。署名検証が必要なのは `/api/punish` のみ。
- 冪等性は QStash 側に委ねる。DELETE が 404 を返しても、既に発火済なら冪等性は維持される。
