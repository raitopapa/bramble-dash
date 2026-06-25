# 仕様書（SPEC）

「別のチャット・別のAI・別の開発者」が引き継げるよう、**動作の数値とルール**を記録する。実装を変えたらここも更新する。
数値の正は基本 `src/core/constants.js`。実装の正は `src/`。

## 1. 画面・状態

- `game.state`: `opening | title | worldmap | playing | paused | dying | levelclear | gameover | win`
- 起動 → **opening**（はじめから/つづきから）→ **title**（キャラ・難易度選択）→ **worldmap** → **playing** …
- `paused` は playing 中のみ。リタイヤ（マップにもどる）は確認サブステート `pauseConfirm` を経由。

## 2. ワールド構成（全12ステージ）

`src/content/levels.js` の `LEVELS`（順番）:
```
[1-1, 1-2, 1ボス,  2-1, 2-2, 2ボス,  3-1, 3-2, 3ボス,  4-1, 4-2, 4ボス]   (index 0..11)
```
ボスは各ワールド末＝index 2,5,8,11。

| ワールド | 名前 | テーマ | 固有ギミック |
|---|---|---|---|
| W1 | くさはら | overworld | 動く足場（既存） |
| W2 | みずべ | water（遊泳） | 水流（current）※index 3,4,5 が水中 |
| W3 | おおぞら | sky | 風（wind） |
| W4 | まおうのしろ | cave→castle(ボス) | 動く床（conveyor） |

## 3. プレイヤー物理（`src/game/entities.js` Player）

- タイル16px。歩き最大1.7、走り最大2.95（×水中0.82×キャラ速度）。
- ジャンプ初速 `JUMP_V × 難易度jumpMul × キャラjump`。長押しで上昇持続（HOLD_G）。
- 重力/最大落下に 難易度倍率 ×（下降時のみキャラfall）。コヨーテ/先行入力あり（難易度で係数）。

## 4. キャラクター（`SKINS` in constants.js）

最初から4人選択可。`stats={jump,speed,fall}`（1.0基準）＋`trait`（ひらがな）＋`icon`。

| id | 名前 | jump | speed | fall | とくちょう | 解放 |
|---|---|---|---|---|---|---|
| bramble | ブランブル | 1.00 | 1.00 | 1.00 | バランス | 最初から |
| mint | ミント | 1.15 | 0.97 | 1.00 | たかくジャンプ | 最初から |
| sora | ソラ | 1.00 | 1.20 | 1.00 | はやくはしる | 最初から |
| momo | モモ | 1.06 | 0.97 | 0.74 | ふんわりおちる | 最初から |
| gold | きんいろ | 1.10 | 1.10 | 0.88 | スーパーパワー | 最終ボス撃破 |
| rainbow | にじいろ | 1.14 | 1.14 | 0.80 | にじのちから | ジェム4個 |

`skinUnlocked(i)`(state.js): 0-3=常時 / 4=mapCleared[11] / 5=ジェム4個。`fall<1`=落下がふんわり。

## 5. 難易度（`DIFFICULTY` in constants.js）

ふつう / やさしい（5さい）/ とてもやさしい（3さい）。
knob: `jumpMul, gravityMul, fallMul, coyoteMul, bufferMul, cutKeep, noHurt, noGameOver, startBig, lives, enemyMul` 等。
低いほどジャンプ↑・当たり判定↓、最弱は被弾/ゲームオーバーをほぼ無効。

## 6. アイテム（タイルマーカー → 実体）

| マーカー | アイテム | 効果 |
|---|---|---|
| o | コイン | スコア |
| ?, ! | はてなブロック | コイン / キノコ・フラワー |
| (ブロックから) | キノコ | small→big |
| (ブロックから) | フラワー | ファイア化（弾発射・ボス弾を相殺） |
| * | スター | 無敵（接触で敵/弾を倒す）約9秒 |
| ^ | はね | 飛行 約9秒 |
| N | ワープ土管(WarpGate) | ボーナス部屋へ（12秒・戻ると元の位置） |
| G | ジェム | 各ワールド1個（1-2,2-1,3-2,4-2）。4個で にじいろ解放 |
| H | チェックポイント | 復活地点 |

## 7. ギミック「ゾーン」（`game.zones`）

データ: `{tx,ty,w,h, kind:'conveyor'|'current'|'wind', dir, dx, dy, power}`（タイル単位、startLevelでpx化）。
- conveyor: 接地中に床面で `x+=dir*power`。
- current: 水中で横は変位、縦は **vy上書き**（updraft=間欠泉、power≈2.0）。
- wind: 重なりで `x+=dir*power×(空中で強い)`。
適用は `applyZones`（updatePlaying内、p.update直後）、描画は `drawZones`。

## 8. ボス（`Boss` + `BossShot`）

体力・色・攻撃がワールド別（`makeBossArena` の `hp/pal/atk`）。`game.boss.pattern` に攻撃設定。

| ボス | HP | 色 | 攻撃 |
|---|---|---|---|
| 1 もりのおやぶん | 3 | 緑 | どんぐり1発（放物線） |
| 2 うずまきボス | 4 | 青 | あわ3way（水中） |
| 3 かみなりボス | 4 | 桃 | いなずま＋突進 |
| 4 まおうブランブル | 6 | 紫 | オーブ3way＋突進・高頻度 |

弾`BossShot`(kind: acorn/bubble/bolt/orb)。発射前に溜め(windup 0.34s)。突進=プレイヤー側へダッシュ。
攻撃間隔/速度は難易度で自動調整（低いほどやさしい）。撃破は踏む or ファイア（bossHP回）。

## 9. 勝敗・進行・セーブ

- ステージのゴール旗 or ボス撃破 → `levelclear` → `nextLevel`（`mapCleared[idx]=true`、`mapMaxUnlocked` 更新、最終なら `win`）。
- ミス時は残機を減らし復活。残機切れ＆`noGameOver`でなければ `gameover`。
- **保存タイミング**: クリア(`nextLevel`)、マップ復帰(`returnToMap`)、ミス処理(`updateDying`)、ジェム取得、タイトルでの設定変更。
- セーブ（localStorage `brambleDash.save`）:
```json
{ "cleared":[...], "unlocked":4, "coins":0, "lives":3, "score":0,
  "difficulty":0, "gems":[1,3,7,10], "skin":0 }
```
- オープニング: `はじめから`=`wipeSave()`（全リセット＋削除）、`つづきから`=`loadProgress()`。

## 10. サウンド（`src/engine/audio.js`）

Web Audio チップチューン。`TRACKS`: overworld/cave/sky/castle/boss/map/**water**/**bonus**。
通常曲は8小節A/B構成で変化。SFX: コイン/ジャンプ/踏む/キック/旗/くずれ/ワープ/チェックポイント/ボス被弾/ボス撃破 ほか。

## 11. 既知の制約・今後

- 縦持ちは盤面が小さい（横向き推奨）。回転促しUIは未実装。
- 今後候補: タイムアタック記録、ジェム全集めのごほうび演出、キャラ別の追加性能、ボス攻撃の追加など。
