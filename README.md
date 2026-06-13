# Bramble's Dash / ブランブルのぼうけん

ブラウザで動く横スクロール アクションゲーム。オリジナルIP（マスコット「ブランブル」）。
キノコで大きく、花でファイア。敵は上から踏む。甲羅は蹴れる。土管の花に注意。

🎮 **プレイ:** https://raitopapa.github.io/bramble-dash/

---

## このリポジトリの構成（Phase 1: モジュール化）

ゲーム本体は **ES モジュールに分割** されています。GitHub Pages が配信するのは、
それを1つにまとめた **ビルド済みの `index.html`** です。

```
bramble-dash/
├─ index.html          ← ★Pages が配信する「ビルド済み単一ファイル」（自動生成）
├─ index.dev.html      ← 開発用。src/ をそのまま読み込む（ビルド不要で確認できる）
├─ build.mjs           ← バンドラ。src/ を index.html にまとめる
├─ build.shell.html    ← index.html の外枠（HTML/CSS）。<!--BUNDLE--> にJSが入る
├─ package.json        ← npm run build / npm test
├─ src/                ← ★ここを編集する（ゲームのソース）
│  ├─ main.js                起動・各部品の配線
│  ├─ core/                  constants（定数）・utils（計算）・input（入力）
│  ├─ engine/                canvas（描画基盤/カメラ）・audio（音）・loop（ループ）
│  ├─ game/                  state（状態）・entities（プレイヤー/敵/アイテム）・flow（進行）
│  ├─ content/               levels（ステージ定義）
│  ├─ draw/                  creatures（キャラ描画）・render（背景/タイル/HUD/画面）
│  └─ scenes/                SceneManager + Title/Stage/（WorldMap/Boss/Cutscene は準備中）
├─ test/smoke.mjs      ← 無回帰テスト（全状態を自動でプレイして確認）
└─ reference/original.html  ← リファクタ前の単一ファイル（記録用）
```

---

## ⭐ 変更のしかた（いちばん大事）

**`index.html` を直接いじらないでください。** これは自動生成ファイルです。

1. `src/` の中のファイルを編集する
2. `node build.mjs` を実行して `index.html` を作り直す
3. `src/` の変更と `index.html` の両方をコミットする

```bash
node build.mjs   # または: npm run build
```

ビルドすると `index.html` が更新され、push すれば数十秒後に Pages に反映されます。

## 開発中の確認（ビルドなし）

`index.dev.html` をブラウザで開くと、`src/` を直接読み込んで動きます。
細かい修正の確認はこちらが速いです（公開用の `index.html` は最後に `build` で更新）。

## テスト（無回帰チェック）

```bash
node test/smoke.mjs   # または: npm test
```

DOM/Canvas/音をダミー化して、タイトル→プレイ→ポーズ→クリア→勝利→ミス→ゲームオーバー
までを自動で一通り動かし、エラーが出ないかを確認します。さらにビルド済み
`index.html` も実際に起動して入力を流し込み、二重にチェックします。

---

## 操作

- ← → 移動 / SPACE・↑・Z ジャンプ / X・SHIFT ダッシュ・ファイア
- ↓ しゃがむ / P・ENTER ポーズ / M 音切替
- スマホはタッチ操作（十字キー＋A/Bボタン）が自動表示
