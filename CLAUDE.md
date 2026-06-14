# CLAUDE.md — このリポジトリで作業する Claude / 開発者へ

Bramble's Dash の開発ガイドです。**まずここを読んでください。**

## 最重要ルール

- **`index.html` を直接編集しない。** これは `build.mjs` が `src/` から生成する
  ビルド済み単一ファイルです。手で変えても次のビルドで上書きされます。
- 変更は必ず **`src/` を編集 → `node build.mjs` → `index.html` と `src/` を両方コミット**。
- コミット前に **`node test/smoke.mjs`** を通すこと（全状態の無回帰チェック）。
- 認証情報（OAuth トークン等）をコード・Issue・PR に書かない。秘密は GitHub Secrets のみ。

## アーキテクチャ（依存の向き）

ゲームは ES モジュール。読み込みの土台から順に：

- `core/constants.js` … 物理定数・`THEMES`・`STEP` など（純粋データ）
- `core/utils.js` … `clamp/lerp/rand/mulberry32/aabb`（純粋関数）
- `engine/canvas.js` … `canvas/ctx`、カメラ寸法 `camW/camH/scale`、`resize()`、
  `worldTransform()`、描画プリミティブ `rr/ellipse`
- `engine/audio.js` … Web Audio による効果音・BGM（外部依存なし・自己完結）
- `game/state.js` … 中心となる `game` 状態オブジェクト、タイル/当たり判定
  （`solidTile/collideX/collideY`）、スコアや生成のヘルパ
- `content/levels.js` … `Grid` とステージ生成（`buildLevel1..3`, `LEVELS`）
- `draw/creatures.js` … キャラ描画（`drawCreature` ほか）
- `game/entities.js` … `Player` と敵/アイテム/弾/粒子クラス
- `draw/render.js` … 背景・タイル・HUD・各画面の描画、`renderTitle()/renderStage()`
- `game/flow.js` … 進行ロジック（`newGame/startLevel/nextLevel/updatePlaying` ほか）
- `scenes/` … `SceneManager` と `TitleScene`/`StageScene`/`WorldMapScene`（実装済み）、
  および未実装の `BossScene`/`CutsceneScene`（「準備中」表示）

タイトルで開始 → ワールドマップ（`game.state==='worldmap'`）→ ノードでジャンプ/スタート
→ そのステージへ。クリアすると地図へ戻り次が解放されます（`flow.js` の
`newGame`/`nextLevel`、`scenes/WorldMapScene.js`、`content/worldmap.js` が担当）。
- `engine/loop.js` … 固定タイムステップの `frame()`（`scenes` に委譲）+ `startLoop()`
- `main.js` … 起動。UIボタン配線 → `scenes.set('title')` → `resize()` → `startLoop()`

`game/state.js` と `game/entities.js` は相互に参照しますが、参照は全て関数/メソッド
の内側（遅延）なので循環は安全です。読み込み時に他モジュールの値へ即アクセスする
トップレベルコードを書かないでください（循環の壊れる原因になります）。

## シーン（状態機械）

- 実際の状態遷移は従来どおり `game.state`（title/playing/paused/dying/levelclear/
  gameover/win）が駆動します。
- `SceneManager` は毎フレーム、`game.state==='title'` なら `TitleScene`、それ以外は
  `StageScene` を選びます（`update` 後に `sync()`）。`TitleScene`+`StageScene` の分岐の
  合計が、元の `update()` と完全に一致します（＝挙動は不変）。
- 将来ワールドマップ等を足すときは、`scenes/` にシーンを追加し、`SceneManager` の
  選び方（または `set()` 呼び出し）を拡張します。

## バンドラの約束ごと（build.mjs）

- `build.mjs` の `ORDER` 配列の順に各モジュールを連結し、`import`/`export` 行を除去、
  `(() => { 'use strict'; … })();` で包んで `build.shell.html` の `<!--BUNDLE-->` に
  差し込み、`index.html` を出力します。
- 新しいモジュールを足したら **`ORDER` に追加** すること。`main.js` は必ず最後。
  トップレベルで実行されるコード（リスナ登録など）を含むモジュールは、参照先より後ろに。
- 各モジュールは「行頭が `import ` / `export ` の行」を除去される前提です。`export` は
  ファイル末尾の `export { ... };` 形式で書いてください（インラインの `export const` は不可）。

## よくある変更

- **ステージ追加:** ①`content/levels.js` に `buildLevelN()` を作り `LEVELS` に追加。
  ②`content/worldmap.js` の `MAP_NODES` に対応ノードを1つ追加（`name` は表示名）。
  クリアで地図に戻り、次のノードが解放されます（最後をクリアすると勝利）。
- **敵/アイテム追加:** `game/entities.js` にクラス、`draw/creatures.js` に描画、
  必要なら `game/state.js` の生成/衝突、`game/flow.js` の `resolvePlayerEnemies()` を更新。
- **音追加:** `engine/audio.js` に `sfxXxx` を作り、必要箇所で呼ぶ。

## タイル・マーカー早見表（content/levels.js）

ソリッドなタイル: `X`地面 `S`石 `B`こわせるレンガ `?`/`!`はてな `U`使用済み `P`土管
`o`コイン（非ソリッド） `T`ジャンプ台（バネ） `D`崩れる足場（乗ると約0.55秒で落下）
敵/仕掛けマーカー（`startLevel` で実体化し床から除去）: `g`ノコ歩き `k`甲羅亀 `c`土管パックン
`p`トゲ亀（踏めない・炎/甲羅/下からブロック殴りで倒す） `b`コウモリ（飛行・上から踏める）
`F`ファイアバー（その升が石の軸になり炎が回転。`game.hazards` に入る） `H`チェックポイント旗 `O`ボス

## 動く床・チェックポイント・進行保存

- **動く床:** `finalize` の `opts.platforms` に `{tx,ty,w,axis:'h'|'v',range,speed}` を並べる。
  `startLevel` が `MovingPlatform` 化（`game.platforms`）。上面だけソリッド（横から/下からは通過）で、
  乗るとプレイヤーを運ぶ。当たり/運搬処理は `flow.js` の `updatePlaying`。
- **チェックポイント:** `H` マーカーを床の上（`gy-1`）に置く。通過で `game.checkpointX` 更新。
  ミス後の復活は `startLevel(idx, true)` で最後のチェックポイントから。**必ず足場のある列に置く**こと。
- **進行保存:** `flow.js` の `saveProgress()`/`loadProgress()` が `localStorage('brambleDash.save')` に
  クリア状況(`mapCleared`)・解放数(`mapMaxUnlocked`)・コイン・ライフ・スコア・難易度を保存。
  クリア時／ミス・復活時／ゲームオーバー時に自動保存、起動時に自動読込。
  `newGame` は進行を消さず、カーソルを最後の解放ノードに置く（ライフは0以下なら難易度の初期数に補充）。

## 難易度（`constants.js` の `DIFFICULTY`）

3段階。タイトルで ←→ で選択し（即 `saveProgress`）、`newGame` で適用。`game.difficulty`(0-2) と
`game.diff`(設定オブジェクト、初期値 `DIFFICULTY[0]` なので常に定義済み)。

| id | 表示 | lives | timeMul | enemyMul | noHurt | noGameOver | startBig |
|---|---|---|---|---|---|---|---|
| normal | ふつう | 3 | 1.0 | 1.0 | × | × | × |
| age5 | やさしい（5さい） | 5 | 0.5 | 0.6 | × | × | ○ |
| age3 | とてもやさしい（3さい） | 99 | 0.0 | 0.42 | ○ | ○ | ○ |

ジャンプ難度の緩和フィールド（`Player.update` で適用、すべて既定1.0/0.45）: `jumpMul`(ジャンプ初速)・
`gravityMul`(重力＝浮遊感)・`fallMul`(落下上限)・`coyoteMul`(崖際の猶予)・`bufferMul`(早押し受付)・
`cutKeep`(離した時の減速、1.0で短押しでも全力ジャンプ)。やさしいほど高く長く飛び、崖越えが楽になる。
age5≈1.12/0.86、age3≈1.20/0.74＋`cutKeep`1.0。`enemyMul`はボスにも効く。

適用箇所: `timeMul`→`updatePlaying` のタイマー減少（0なら時間切れ無し）。`enemyMul`→敵の歩き速度
（Stomper/Shellback歩き・滑り/Spiker/Bat の `vx` に乗算）。`noHurt`→`Player.hurt()` 冒頭で早期 return。
`noGameOver`→`updateDying` でライフ<0でもゲームオーバーにせず0に補正して復活。`startBig`→開始/復活時に大きい状態。

## ボス戦（最終ステージ `ボス` = `LEVELS[6]`）

- **アリーナ:** `buildLevel7`。左右が石壁で囲まれた城ホール。`O` マーカーで `Boss` を `game.boss` に生成。
  フラグ無し（`updatePlaying` のゴール判定は `!game.boss` でスキップ）。クリアはボス撃破でのみ発生。
- **ボス挙動:** 左右に跳ねて壁で反転、HP3。頭を踏む（上から）と1ダメージ＋約1秒の無敵点滅、
  ダメージごとに移動が速く＝凶暴化。ファイアボールでもダメージ可。横から触れるとプレイヤーが `hurt()`。
  速度は `game.diff.enemyMul` でも緩む（やさしいほどゆっくり）。
- **撃破→勝利:** HP0で `bossDefeated()`（紙吹雪＋3000点）→ `game.bossWinTimer` 後に
  `levelclear`(`clearPhase='tally'`)へ。`nextLevel` が最終面なので `win`。マップに `ボス` ノード(6)を追加済み。
- HUD: `drawBossHP()` が画面上部に「ボス」とHPオーブを表示（`game.boss && !dead` の間）。

## タッチ操作・全画面（`build.shell.html` ＝ `index.html` の元）

- `#touch` 内に `#btn-left/#btn-right`（大きな矢印）と `#btn-a`（ジャンプ＝緑の大ボタン）・`#btn-b`（ダッシュ＝橙）。
  `#btn-down` は子供向けに非表示（`display:none`、`input.js` の `bindBtn` は存在すれば束縛）。ボタンIDは不変なので
  `input.js` は変更不要。サイズは CSS 変数 `--moveSize/--jumpSize/--dashSize`（`vmin` ベースでタブレットでは特大）。
- 配置は `position:absolute` ＋ `env(safe-area-inset-*)`（iPadのノッチ/ホームインジケータ対応）。
- 全画面: `.stage:fullscreen` で `aspect-ratio:auto; width/height:100vw/vh` にして画面いっぱいに。
  `resize()` がカメラ比率を自動調整（レターボックスではなく可視範囲が伸縮、歪み無し）。ボタンは画面四隅に来る。
- タイトル/クリア/ゲームオーバー画面では、緑の「ジャンプ」ボタンがそのまま開始/リスタート（`updateMenu` の `edge.jump`）。
  タイトルで矢印は難易度切替（←→）。`index.dev.html` も同じ見た目に同期済み。

## ビジュアル／アートディレクション（統一された世界観）

ふんわり絵本調。共通ルール: 上から光、影は薄め、輪郭は黒でなく各パレットの濃色、アクセントは金 `#ffd23a`。
- **パレット (`constants.js THEMES`)**: 4ワールドを一つの色家族に。各テーマに `skyTop/skyMid/skyBot`（3段グラデ）・
  `glow`（太陽/環境光）・`accent`（テーマ色）・`mountain/mountainDark`（遠景）を追加。
- **背景 (`render.js`)**: `drawSky`＝3段グラデ＋太陽（空）/月・星（城）/虹（空ワールド）/ヴィネット（洞窟）。
  `drawMountains`＝遠景パララックス2層（`game.camX` 基準、画面座標）。`drawHills/drawClouds/drawBush` もグラデ＋ハイライト化、
  洞窟は光るクリスタル。`renderStage` は 空→遠山→丘→雲→草むら→タイル の順。
- **タイル**: `drawGround/Stone/Brick/Used/Question/Pipe` をグラデ＋面取り＋質感に。`drawGoal` は星トッパー＋
  グラデ旗、`drawCheckpoint` は光る三角旗、`drawCastle` は二塔＋窓＋旗。`star()` ヘルパー追加。
- **キャラ (`creatures.js drawCreature`)**: 体グラデ＋リムライト＋丸い靴＋振る腕＋大きな目＋笑顔＋ほっぺ。
  small/big/fire 共通デザイン。`drawCoin` もグラデ化。API は不変。
- **ワールドマップ (`WorldMapScene`)**: 絵本風の空・丘・うねる道・テーマ色のノード（クリア=金の星／ロック=錠前／
  ボス=王冠）・リボン見出し・体力ハート・終点の城。`NODE_ACCENT` 配列でノード色、`mapStar` ヘルパー。
- 検証: `render-shot.mjs`（node-canvas、※devのみ・配布物には含めない）で各ワールドをPNG出力して目視確認可能。

## 敵キャラ刷新・ゴール演出・マップ装飾（第2弾）

- **敵/アイテム (`entities.js` の各 `draw()`)**: 全員グラデ＋リムライト＋濃色アウトライン＋表情に統一。
  Stomper=どんぐり（帽子＋靴＋顔）、Shellback=艶甲羅（`shellDome` をグラデ化）＋頬、Spiker=紫トゲ（陰影トゲ＝踏めない明示）、
  Bat=丸耳＋牙、Chomper=艶のある食虫花、Mushroom=艶キノコ、Flower=ファイアフラワー、FireBar=発光グラデ炎。当たり判定・座標は不変。
- **ゴール演出 (`flow.js` `clearBurst`＋`updateClear`／`render.js` `drawClearOverlay`)**: クリア時に紙吹雪＋火花、
  集計中はチクっと音に合わせて星が舞う。オーバーレイは打ち上げ花火＋リボン「★ステージクリア！★」＋タイムボーナス／SCORE表示。
- **マップ装飾 (`WorldMapScene`)**: 木・花・岩・鳥・前景の草・池を種固定（`seedScene`、リサイズ時のみ再生成）で配置。
  ノードは丘の上に浮く配置なので装飾と重ならない。`tree/flower/rock/bird/grassTufts` ヘルパー。

## 水中／パワーアップ／ボーナス／ポーズ／マップ復帰（第3弾）

**重要: LEVELS は8面に。水中を index4 に挿入 → `[1-1,1-2,2-1,2-2,水(2-3),3-1,3-2,ボス]`。ボスは index7（最後）。**
worldmap.js のノード/パスも8個、`WorldMapScene` の `NODE_ACCENT` も8色（水=teal）。

- **水中ステージ (feature1)**: `THEMES.water`(青grad＋`water:true`)。`finalize` が `water` を透過、`startLevel` が `game.water` を設定。
  `Player.update` は `game.water` 時に遊泳モデル（浮力で沈む＋ジャンプで一かき＋上下クランプ、横移動0.82倍）に分岐。
  描画は `drawSky` の water分岐（光のシャフト＋泡＋水面）、`drawMountains`=海底ヘイズ、`drawHills/drawClouds` はwaterでスキップ、
  `renderStage` で薄い青のティント。`buildLevelWater()`。
- **パワーアップ (feature2)**: `Star`(無敵)・`Wing`(飛行) を entities に追加（`Player.star/fly` タイマー）。
  Star中は `hurt()` 無効＋接触で敵撃破（`resolvePlayerEnemies` 先頭で判定）＋虹色点滅（`drawCreature` の `o.star`）。
  Wing中はジャンプ長押しで上昇（重力0.55倍）＋羽根描画（`o.fly`）。レベルにマーカー `*`=Star, `^`=Wing（floating idle）。
- **ボーナスステージ (feature3)**: ワープ星 `WarpGate`（マーカー `N`）に触れると `enterBonus()`。
  方式=スナップショット/復元: `game._bonus` に現レベルの配列(参照ごと退避)＋座標を保存→`buildBonus()` のコイン部屋に差し替え＋新配列。
  `bonusTimer`(12s)で `exitBonus()` が元レベルを完全復元（スコア/コインは持ち越し、time復元）。`updatePlaying` 先頭でタイマー消化。
- **ポーズ (feature4)**: `game.state==='paused'` に2択メニュー（`game.pauseSel`）。`StageScene` で ←→選択・ジャンプ決定・ポーズ解除。
  画面上部に `pauseBtn`(❚❚, build.shell.html)、`main.js` でトグル配線。`drawPause` を2択UIに刷新。
- **マップに戻る (feature5)**: ポーズで「マップにもどる」→ `returnToMap()`（state=worldmap、進捗保存、water/bonus/powerupリセット）。
- テスト: 水中遊泳・Star無敵＆撃破・Wing飛行・ボーナス往復・ポーズ→マップ をsmokeに追加。

## 敵・ハザード（game/entities.js）

歩行/飛行などの敵は `game.enemies`、ファイアバーは `game.hazards`。当たり判定は
`game/flow.js` の `resolvePlayerEnemies()`（敵）と `updatePlaying()` 内のハザード/崩れ処理。

## BGM（engine/audio.js）

`TRACKS` にワールド別の進行/テンポを定義。`setMusicTrack(name)` で切替（`overworld`/`cave`/
`sky`/`castle`/`map`）。`startLevel` がテーマ名で、マップ復帰時は `'map'` を選ぶ。

## @claude（GitHub Actions）での作業

- ワークフロー（`.github/workflows/claude.yml`）は `actions/checkout@v4`（fetch-depth: 0）を
  最初に実行してから claude-code-action を呼ぶこと（これが無いと git 操作で失敗する）。
- @claude は **小さく区切ったタスク向け**。大規模な改修はチャットセッションで。
- ソースを変えたら `node build.mjs` を実行し、`index.html` も一緒にコミットさせること。

## ボス専用BGM
- `audio.js` の `TRACKS.boss`（bpm150・短調A→G#→G→Aの緊張進行・`style:'boss'`）。`buildSeq` に boss スタイル分岐（8分音符の刻みベース＋シンコペったリード）を追加。
- `startLevel` の音楽選択を `setMusicTrack(game.boss ? 'boss' : themeName)` に変更。ボスアリーナ(LEVELS[7])で自動的にボスBGM。撃破→クリア/マップ移動で通常曲に戻る。

## ワールド構成（マリオ風・第4弾）

**LEVELS は12面に再編。3面ごとに1ワールド（ステージ2＋専用ボス）。ボスは各ワールド末＝index 2,5,8,11。**
- 並び: `[1-1,1-2,1ボス, 2-1,2-2,2ボス, 3-1,3-2,3ボス, 4-1,4-2,4ボス]`
- W1 くさはら(overworld) / W2 みずべ(water・遊泳) / W3 おおぞら(sky) / W4 まおうのしろ(cave→castleボス)
- 水中面: index 3,4,5（2-1, 2-2, 2ボスは水中）。`buildWater2` / `buildSky2` を新規追加。
- **ボスは共通 `makeBossArena(o)`** で生成。`o.hp`(3/4/4/6)・`o.pal`(色)・`o.water`・`o.spring` を指定。
  finalize が `isBoss/bossHP/bossPal/bossName/world` を持ち、`flow.startLevel` が 'O' で生成したBossにHP/色を適用。
  `Boss.draw` は `this.pal`（body/belly/horn/brow）でワールド別に色替え（W1緑/W2青/W3桃/W4紫）。
- **ワールドマップ**: `worldmap.js` を12ノード＋`world`/`boss`タグに刷新（`WORLD_COLORS`/`WORLD_NAMES`）。
  各ワールドは色分け、ボスノードは王冠、上部に「ワールドN」バナー、ノード番号はワールド内番号（名前末尾）。
- **背景ブラッシュアップ**: `render.js drawMtnExtras(th,baseY)` で遠景に
  くさはら=木＋鳥 / おおぞら=浮島 / おしろ=塔＋旗、洞窟は drawSky に鍾乳石を追加。
- テスト: smoke はボスindex 11・全12面描画に更新。`node --input-type=module` で12面の
  スポーン/足場/ボスO/チェックポイント/ゴール到達性を構造チェック可能（本セッションで全PASS）。

## ワールド固有ギミック「ゾーン」（第5弾）

各ワールドに固有ギミックを追加。汎用の **zoneシステム**で実装（任意レベルに配置可能）。
- 割り当て: **W1=動く足場（既存）** / **W2 水流(current)** / **W3 風(wind)** / **W4 動く床(conveyor)**。
- データ形式（レベルの `finalize(opts)` に `zones:[...]`、タイル単位）:
  `{tx,ty,w,h, kind:'conveyor'|'current'|'wind', dir:±1, dx, dy, power}`。
  `flow.startLevel` が px に変換して `game.zones` に格納。
- 物理は `applyZones(p)`（`updatePlaying` 内、`p.update(dt)` 直後に呼ぶ）:
  - **conveyor**: 接地中かつゾーン床面（`|feet-z.y|<6`）にいると `p.x+=dir*power` で運ばれる。
  - **current**: `game.water` 中、ゾーン重なりで横は `p.x+=dx*power`（変位）、縦は **vyを上書き**（`dy<0`で `vy=min(vy,dy*power)`＝間欠泉）。passiveな変位だと蓄積した沈降に負けるため velocity 上書きにしている。updraft の power は ~2.0。
  - **wind**: ゾーン重なりで `p.x+=dir*power*(接地?0.45:1)`（空中で強い）。
  - いずれも適用後に `collideX/collideY` で壁解決。
- 描画 `render.js drawZones()`（`renderStage` で drawGoal 後・エンティティ前、ワールド座標）:
  conveyor=流れる金色シェブロン / current=流れ方向の矢印 / wind=横に流れる白線。
- bonus 出入りで `game._bonus.zones` に退避・復元、`returnToMap` でクリア。
- テスト: smoke にゾーン物理3種（コンベア搬送・水流上昇・風の横押し）を直接検証で追加（px指定で `game.zones` を直接セット）。

## ボーナス土管＋効果音追加（第6弾）

- **ボーナス土管**: `warpPipe(g,x,gy,h)` ヘルパー（`pipe()`＋土管口に `'N'` を置く）を追加。
  各ワールドの第1ステージに1本ずつ設置（1-1, 2-1, 3-1, 4-1）。`'N'`→`WarpGate`（startLevelで生成）に触れると
  `enterBonus()` でコイン部屋へ。戻ると元の位置に復帰（ワープは一度きり＝itemは消費）。土管は必ず地面の上に置くこと。
- **効果音（audio.js に追加）**:
  - `sfxWarp` … ボーナス土管に入る瞬間（下降アルペジオ＋スイープ）。`enterBonus` 直前で再生。
  - `sfxCheckpoint` … 旗チェックポイント通過（上昇チャイム）。従来の `sfxFlag` から差し替え。
  - `sfxBossHit` … ボスに有効打（非致命）。stomp/ファイア命中で `r===1` のとき。
  - `sfxBossDown` … ボス撃破（うなり＋小ファンファーレ）。`bossDefeated` 冒頭。
  - ※dashの `audio.js` は本プロジェクト専用なので直接追記してよい（boomの「sfx2.jsに足す」ルールとは別）。
- テスト: smoke に「各ワールド第1ステージに warp item が湧く」アサートを追加。

## ステージ途中のポーズ／リタイヤUI強化（第7弾）

ポーズ（左上❚❚／P）と「マップにもどる」リタイヤは既存。今回モバイル向けに強化:
- **タップ操作**: `drawPause` が各ボタンの矩形を `game._pauseHit=[{x,y,w,h,act}]`（デバイスpx）に保存。
  `main.js` の canvas `pointerdown` が `getBoundingClientRect` でタップ座標をデバイスpxへ変換し当たり判定→
  `doPauseAct(act)`（resume / retire / confirm-yes / confirm-no）。←→＋ジャンプの従来操作も併存。
- **リタイヤ確認**: 「マップにもどる」選択→`game.pauseConfirm=true`（`confirmSel` 既定=1=つづける＝安全側）。
  「もどる/つづける」を選び直して決定。確認画面でも `game._pauseHit` にタップ矩形を出す。
  `StageScene` paused 分岐に confirm サブステートを追加。`game.pauseConfirm` は startLevel／ポーズ突入時に false へ。
- テスト: smoke を「retireで確認が開く→もどる選択→worldmap」「つづけるで再開」に更新＋ポーズ両画面の描画確認。

## ステージ選択プレビュー（第8弾）

ワールドマップで選択中ノードの**プレビューカード**を下部に表示（`WorldMapScene.drawPreview`/`drawThumb`）。
- 内容: 左に**ミニ地形サムネ**（その面の実グリッドを縮小描画＝地形/穴/土管/コイン/ゴール旗のシルエット、ボスは中央にボス顔）、
  右にステージ名（`ワールドN-名` or `ワールドN ボス`）・テーマ名（くさはら/みずべ/おおぞら/どうくつ/おしろ）・状態
  （まだあそべない／クリアずみ／ジャンプ・タップでスタート）。
- ロック中はサムネを暗転＋鍵アイコン。テーマ色は `accent(i)`（ワールド色）。
- サムネは選択ノードが変わった時だけ `LEVELS[ni]()` をビルドしてキャッシュ（`this.prev={node,level}`）。毎フレームのビルドはしない。
- 下部の操作ヒントは「←→でステージをえらぶ」をカード上(H*0.69)へ移動。`LEVELS` を WorldMapScene に import。
- テスト: smoke にステージ/ボス/ロックのプレビュー描画を追加。
