# アーキテクチャ・技術スタック（ARCHITECTURE）

## 技術スタック

- **言語/描画**: 素の JavaScript（ES Modules）＋ Canvas 2D。フレームワーク・ゲームエンジンなし。
- **依存ライブラリ**: ゼロ（`package.json` の dependencies は常に空）。ビルドは Node 標準のみ。
- **音**: Web Audio API によるプロシージャルなチップチューン（外部音源ファイルなし）。
- **配信形態**: 自作バンドラが `src/` を連結し、**単一の自己完結 `index.html`** を生成（GitHub Pages 直下に置くだけ）。
- **保存**: ブラウザ localStorage。
- **実行環境**: モダンブラウザ（モバイル/PC）。Node v22 で開発・テスト。

## ビルドの仕組み（重要な制約）

`node build.mjs` は:
1. `ORDER` 配列の順に各ファイルを読み、行頭が `import ` / `export ` の行を**削除**。
2. 全体を `(()=>{'use strict'; ... })();` の IIFE で包み、`build.shell.html` の `<!--BUNDLE-->` に注入 → `index.html`。
3. 同じ外殻に `<script type="module" src="src/main.js">` を注入 → `index.dev.html`（開発用）。

このための**コード規約**:
- `import` は行頭1行。`export { ... };` は**ファイル末尾に1行**（複数行 export 禁止）。
- バンドル後は全ファイルが**同一スコープ** → **トップレベルの関数/変数/クラス名は全ファイルでユニーク**にする
  （例: 汎用名 `star()` ではなく `bStar()` / `mapStar()`）。
- 新モジュール追加時は **`build.mjs` の `ORDER` に依存順で追記**（`main.js` は常に最後）。例: `OpeningScene.js` を追加した際も ORDER 更新が必須。
- 循環参照は不可。参照方向: constants/utils → engine(canvas/audio/loop/input) → state → entities → ai → flow → content → draw → scenes → main。

## モジュール構成

| ファイル | 責務 |
|---|---|
| `core/constants.js` | 全数値・テーマ・難易度・**キャラ(SKINS)**（仕様変更はまずここ） |
| `core/utils.js` | clamp/lerp/rand/mulberry32/aabb 等 |
| `core/input.js` | キーボード＋タッチ。`input`=押下中、`edge`=押した瞬間。各updateで `inputBegin/End` |
| `engine/canvas.js` | canvas/ctx/resize/rr/ellipse |
| `engine/audio.js` | BGM/SFXエンジン（このプロジェクト専用。`TRACKS`/`buildSeq`/各 sfx） |
| `engine/loop.js` | 固定ステップ(1/60)ループ、`animClock` |
| `game/state.js` | 中央の `game` オブジェクト（全状態）＋ `skinUnlocked` |
| `game/entities.js` | Player / 敵各種 / Boss / **BossShot** / **Gem** / アイテム / 物理(collideX/Y) |
| `game/ai.js` | （ボス等の挙動補助） |
| `game/flow.js` | startLevel / updatePlaying / 勝敗 / セーブ(save/load/has/wipe) / ボーナス / ギミック適用 |
| `content/levels.js` | 全ステージ生成（Grid＋ヘルパー pipe/row/stair/makeDecor/warpPipe/makeBossArena） |
| `content/worldmap.js` | 12ノード（world/boss）＋ WORLD_COLORS/NAMES |
| `draw/creatures.js` | プレイヤー描画 `drawCreature`（カービィ風・スキン適用） |
| `draw/render.js` | 背景/タイル/HUD/タイトル/オープニング/マップ補助/各オーバーレイ |
| `scenes/*` | Opening / Title / WorldMap / Stage / Boss / Cutscene / SceneManager |
| `main.js` | 起動・上部ボタン（❚❚/♪/⛶）配線・ポーズ/オープニングのタップ判定 |

## シーン管理

`SceneManager.sync()` が `game.state` → シーン名を対応付け（opening/title/worldmap/stage）。
`update()`→各シーン更新→sync、`render()`→各シーン描画。新stateを足したら sync の分岐も更新。

## テスト（`test/smoke.mjs`）

```bash
node build.mjs && node test/smoke.mjs
```
- **Part A**: DOM/Audio/localStorage をスタブし実モジュールで実プレイ駆動
  （オープニング→タイトル→マップ→各面→アイテム→ギミック→ボス攻撃→撃破→勝利、
  キャラ別速度/ジャンプ、ジェム取得/コスチューム解放、ポーズ/リタイヤ確認 などをアサート）。
- **Part B**: ビルド済み `index.html` から IIFE を抽出して起動し、描画ループが回ることを確認。
- **機能追加時は必ず Part A にケースを足す**。決定的にしたい所は座標/状態を直接セットして検証。

## ビジュアル確認

開発者が実機/ブラウザで直接確認する運用（このリポジトリでは PNG 自動生成ツールは使わない）。

## デプロイ（落とし穴）

- 公開対象は**ビルド済み `index.html`** のみで完結。GitHub Pages: main / (root)。
- **`index.dev.html` を `index.html` として置かない**（JSソースがそのまま表示される事故の原因）。
- 変更フロー: `src/` 編集 → `node build.mjs` → `node test/smoke.mjs` 緑 → `index.html`（＋増えた `src/` ファイル）をコミット。
