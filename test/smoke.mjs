// test/smoke.mjs — headless no-regression test. Runs with: node test/smoke.mjs
// Part A: imports the dev ES modules, boots, and drives the SceneManager through
//         every game state, exercising all entity/draw code. Asserts no throw.
// Part B: loads the BUILT single-file index.html, runs its IIFE under DOM/canvas/
//         audio stubs, simulates keyboard input, and steps the rAF loop.
// Exit 0 = green; non-zero = a regression was detected.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

/* ----------------------------------------------------------- environment stub */
function makeEnv() {
  const listeners = {};
  const grad = { addColorStop() {} };
  const ctx = new Proxy({}, {
    get(_, p) {
      if (p === 'measureText') return () => ({ width: 10 });
      if (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createPattern') return () => grad;
      if (p === 'canvas') return canvasEl;
      return () => {};
    },
    set() { return true; },
  });
  const canvasEl = {
    width: 1280, height: 720, style: {}, clientWidth: 640, clientHeight: 360,
    getContext: () => ctx, addEventListener() {}, removeEventListener() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 640, height: 360 }),
  };
  const elementStub = {
    width: 1280, height: 720, style: {}, clientWidth: 640, clientHeight: 360,
    innerHTML: '', addEventListener() {}, removeEventListener() {},
    classList: { add() {}, remove() {}, toggle() {} },
    setPointerCapture() {}, releasePointerCapture() {},
    requestFullscreen() {}, webkitRequestFullscreen() {}, getContext: () => ctx,
  };

  const aparam = () => ({
    value: 0, setValueAtTime() {}, setTargetAtTime() {},
    linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {},
  });
  const anode = () => ({
    gain: aparam(), frequency: aparam(), type: '', buffer: null,
    connect() {}, start() {}, stop() {},
  });
  function AudioCtx() {
    return {
      state: 'running', sampleRate: 44100, currentTime: 0, destination: anode(),
      createGain: anode, createOscillator: anode, createBufferSource: anode,
      createBiquadFilter: () => ({ type: '', frequency: aparam(), connect() {} }),
      createBuffer: (ch, len) => ({ getChannelData: () => new Float32Array(Math.max(1, len | 0)) }),
      resume() {},
    };
  }
  class RO { constructor() {} observe() {} unobserve() {} disconnect() {} }

  let rafCb = null;
  const raf = (cb) => { rafCb = cb; return 1; };

  const win = {
    devicePixelRatio: 2,
    addEventListener(type, fn) { (listeners[type] || (listeners[type] = [])).push(fn); },
    removeEventListener() {},
    matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
    AudioContext: AudioCtx, webkitAudioContext: AudioCtx,
    ResizeObserver: RO, requestAnimationFrame: raf,
  };
  const doc = {
    getElementById: (id) => (id === 'game' ? canvasEl : elementStub),
    addEventListener(type, fn) { (listeners[type] || (listeners[type] = [])).push(fn); },
    fullscreenElement: null, exitFullscreen() {}, createElement: () => elementStub,
  };

  const setG = (k, v) => {
    try { globalThis[k] = v; }
    catch { try { Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true }); } catch {} }
  };
  setG('window', win);
  setG('document', doc);
  setG('navigator', { userAgent: 'node' });
  setG('performance', { now: () => 0 });
  setG('requestAnimationFrame', raf);
  setG('cancelAnimationFrame', () => {});
  setG('AudioContext', AudioCtx);
  setG('ResizeObserver', RO);
  setG('localStorage', { _m: {}, getItem(k) { return Object.prototype.hasOwnProperty.call(this._m, k) ? this._m[k] : null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } });

  const fire = (type, ev) => { for (const fn of listeners[type] || []) fn(ev || {}); };
  return { listeners, fire, getRaf: () => rafCb, key: (type, code) => fire(type, { code, preventDefault() {}, repeat: false }) };
}

/* ------------------------------------------------------------------ Part A */
async function partA() {
  const env = makeEnv();
  const STEP = (await import('../src/core/constants.js')).STEP;
  const { scenes } = await import('../src/scenes/SceneManager.js');
  const { game } = await import('../src/game/state.js');
  const flow = await import('../src/game/flow.js');
  const state = await import('../src/game/state.js');
  const { input } = await import('../src/core/input.js');
  const E = await import('../src/game/entities.js');
  await import('../src/main.js'); // boots: scenes.set('title'), resize(), startLoop()
  const { setMusicTrack } = await import('../src/engine/audio.js');

  const assert = (c, m) => { if (!c) throw new Error('assert failed: ' + m); };
  let frames = 0;
  const step = (n = 1) => { for (let i = 0; i < n; i++) { scenes.update(STEP); frames++; } };
  const tap = (name) => { input[name] = true; step(1); input[name] = false; step(1); };           // single edge
  const enterFromMap = () => { tap('jump'); };                                                     // map -> enter current level

  assert(scenes.currentName === 'title', 'boots into title scene');
  scenes.render();

  // title -> world map
  tap('start');
  assert(game.state === 'worldmap', 'title -> worldmap after start');
  assert(scenes.currentName === 'worldmap', 'switched to worldmap scene');
  scenes.render();

  // on the map, advancing is blocked until a node is unlocked
  tap('right');
  assert((game.mapNode | 0) === 0, 'cannot move onto a locked node');

  // enter the first level from the map
  enterFromMap();
  assert(game.state === 'playing', 'map -> playing (level entered)');
  assert(scenes.currentName === 'stage', 'switched to stage scene');
  assert(game.levelIndex === 0, 'entered level index 0');

  // free play for movement coverage (state may transition; reset afterwards)
  input.right = true;
  for (let i = 0; i < 120; i++) { input.jump = i % 25 < 3; input.fire = i % 9 < 4; step(1); if (i % 40 === 0) scenes.render(); }
  input.left = input.right = input.down = input.jump = input.fire = false;

  // clean run again, re-enter level 0 from the map
  flow.newGame();
  scenes.sync();
  assert(game.state === 'worldmap', 'newGame -> worldmap');
  scenes.render();
  enterFromMap();
  assert(game.state === 'playing', 'enter level from map again');

  // exercise big + fire forms and every transient object for draw coverage
  game.player.grow();  scenes.render();
  game.player.toFire(); scenes.render();
  game.items.push(new E.Mushroom(Math.floor(game.player.x / 16) + 1, 9));
  game.items.push(new E.Flower(Math.floor(game.player.x / 16) + 2, 9));
  state.spawnFireball(game.player);
  state.spawnPuff(game.player.x, game.player.y);
  state.spawnDust(game.player.x, game.player.y);
  state.spawnBrickDebris(Math.floor(game.player.x / 16), 8);
  state.spawnSpark(game.player.x, game.player.y, '#fff');
  state.spawnPopCoin(Math.floor(game.player.x / 16), 9);
  state.popupWorld(game.player.x, game.player.y, '1000');
  step(20); scenes.render();
  assert(game.state === 'playing', 'still playing after standing still');

  // pause + unpause (edge-triggered: needs a release frame between presses)
  input.pause = true; step(1);
  assert(game.state === 'paused', 'enters pause');
  scenes.render();
  input.pause = false; step(1);            // release while paused
  input.pause = true; step(1);             // press again -> unpause
  assert(game.state === 'playing', 'leaves pause');
  input.pause = false;

  // course clear -> back to the world map, next node unlocked
  game.time = 1;
  flow.startClear();
  assert(game.state === 'levelclear', 'enters levelclear');
  for (let i = 0; i < 700 && game.state === 'levelclear'; i++) { step(1); if (i === 0) scenes.render(); }
  assert(game.state === 'worldmap', 'clear -> back to world map');
  assert((game.mapMaxUnlocked | 0) >= 1, 'next node unlocked');
  assert(!!game.mapCleared[0], 'level 0 marked cleared');
  scenes.render();

  // map navigation now works: left to node 0, right back to node 1
  tap('left');  assert((game.mapNode | 0) === 0, 'moved left to node 0');
  tap('right'); assert((game.mapNode | 0) === 1, 'moved right to node 1');

  // play remaining levels to victory (clear each from inside the level)
  let guard = 0;
  while (game.state !== 'win' && guard++ < 30) {
    if (game.state === 'worldmap') enterFromMap();
    else if (game.state === 'playing') { game.time = 1; flow.startClear(); for (let i = 0; i < 700 && game.state === 'levelclear'; i++) step(1); }
    else step(1);
  }
  assert(game.state === 'win', 'reaches win after last level');
  step(30); scenes.render(); // confetti + win overlay

  // restart from win -> world map
  tap('start');
  assert(game.state === 'worldmap', 'restart from win -> worldmap');

  // death -> gameover (enter a level first)
  enterFromMap();
  assert(game.state === 'playing', 'entered a level for the death test');
  game.lives = 0;
  game.player.die();
  assert(game.state === 'dying', 'die() -> dying');
  for (let i = 0; i < 200 && game.state === 'dying'; i++) { step(1); if (i === 0) scenes.render(); }
  assert(game.state === 'gameover', 'dying -> gameover when out of lives');
  scenes.render();

  // restart from gameover -> world map
  tap('start');
  assert(game.state === 'worldmap', 'restart from gameover -> worldmap');

  // ---- exercise new content: enemy/hazard updates, gimmicks, music tracks ----
  flow.newGame(); scenes.sync(); enterFromMap();
  game.player.invinc = 999;                              // don't die during this pass
  const ptx = Math.floor(game.player.x / 16);
  game.enemies.push(new E.Spiker(ptx + 2, 9));
  game.enemies.push(new E.Bat(ptx + 3, 7));
  for (let i = 0; i < 60; i++) { step(1); if (i % 20 === 0) scenes.render(); }
  // spring bounce
  { const tx = Math.floor(game.player.x / 16); state.gset(tx, 11, 'T'); game.player.y = 11 * 16 - game.player.h - 22; game.player.vy = 3; game.player.onGround = false; game.player.invinc = 999; for (let i = 0; i < 25; i++) step(1); }
  // crumbling platform
  { const tx = Math.floor(game.player.x / 16) + 1; state.gset(tx, 11, 'D'); game.player.x = tx * 16 + 2; game.player.y = 11 * 16 - game.player.h - 12; game.player.vy = 2; game.player.onGround = false; game.player.invinc = 999; for (let i = 0; i < 60; i++) { step(1); if (i === 0) scenes.render(); } }
  // fire bar collision (invinc off so the hit-test path runs)
  { game.player.invinc = 0; game.hazards.length = 0; game.hazards.push(new E.FireBar(game.player.x + 8, game.player.y + 8)); for (let i = 0; i < 30; i++) step(1); }
  for (const tr of ['overworld', 'cave', 'sky', 'castle', 'map']) setMusicTrack(tr);

  // moving platform: land on it and get carried
  flow.newGame(); scenes.sync(); game.mapNode = 0; enterFromMap(); game.player.invinc = 999;
  game.platforms.length = 0;
  { const pf = new E.MovingPlatform({ tx: Math.floor(game.player.x / 16), ty: 11, w: 3, axis: 'h', range: 3, speed: 1.0 }); game.platforms.push(pf);
    game.player.x = pf.x + 8; game.player.y = 11 * 16 - game.player.h - 20; game.player.vy = 3; game.player.onGround = false;
    let rode = false; for (let i = 0; i < 40; i++) { step(1); if (game.player.riding) rode = true; } assert(rode, 'player rides a moving platform'); }

  // checkpoint activation + respawn-at-checkpoint after death
  flow.newGame(); scenes.sync(); game.mapNode = 0; enterFromMap(); game.player.invinc = 999;
  { const cp = game.checkpoints[0]; assert(cp, 'level has a checkpoint');
    game.player.x = cp.x + 4; step(1); assert(cp.active, 'checkpoint activates when passed');
    const savedX = game.checkpointX; game.lives = 1; game.player.die();
    for (let i = 0; i < 200 && game.state === 'dying'; i++) step(1);
    assert(game.state === 'playing', 'respawn keeps a life'); assert(Math.abs(game.player.x - savedX) < 24, 'respawned at the checkpoint'); }

  // save / load progress round-trip (now also coins / lives / score / difficulty)
  game.mapCleared = [true, true, false]; game.mapMaxUnlocked = 2; game.coins = 37; game.lives = 4; game.score = 12345; game.difficulty = 1;
  flow.saveProgress();
  game.mapCleared = []; game.mapMaxUnlocked = 0; game.coins = 0; game.lives = 0; game.score = 0; game.difficulty = 0;
  flow.loadProgress();
  assert(game.mapMaxUnlocked === 2 && game.mapCleared[1] === true, 'progress saves and reloads');
  assert(game.coins === 37 && game.lives === 4 && game.score === 12345, 'coins/lives/score reload');
  assert(game.difficulty === 1, 'difficulty reloads');

  // difficulty selection on the title (left/right cycles, sets that mode's lives)
  game.state = 'title'; scenes.sync(); game.difficulty = 0; game.lives = 3;
  tap('right'); assert(game.difficulty === 1 && game.lives === 5, 'right -> easy (5 lives)');
  tap('right'); assert(game.difficulty === 2 && game.lives === 99, 'right -> very-easy (99 lives)');
  tap('right'); assert(game.difficulty === 0, 'wraps back to normal');
  tap('left'); assert(game.difficulty === 2, 'left wraps to very-easy');

  // very-easy (age 3): no damage, no game over
  game.difficulty = 2; flow.newGame(); scenes.sync(); game.mapNode = 0; enterFromMap();
  game.player.form = 'small'; game.player.invinc = 0; game.player.hurt();
  assert(!game.player.dead && game.player.form === 'small', 'age3: hurt does nothing');
  game.lives = 0; game.player.die();
  for (let i = 0; i < 200 && game.state === 'dying'; i++) step(1);
  assert(game.state === 'playing', 'age3: falling never causes game over'); assert(game.lives >= 0, 'age3: lives clamped at 0');
  game.difficulty = 0; game.diff = (await import('../src/core/constants.js')).DIFFICULTY[0];

  // jump tuning: very-easy should jump noticeably higher/floatier than normal
  const measureJump = (idx) => { game.difficulty = idx; flow.newGame(); scenes.sync(); game.mapNode = 0; enterFromMap(); const p = game.player; p.invinc = 999; input.left = input.right = input.jump = false; for (let i = 0; i < 12; i++) step(1); const y0 = p.y; input.jump = true; let minY = p.y; for (let i = 0; i < 42; i++) { step(1); if (p.y < minY) minY = p.y; } input.jump = false; for (let i = 0; i < 30; i++) step(1); return y0 - minY; };
  const hN = measureJump(0), h3 = measureJump(2);
  assert(h3 > hN + 8, 'age3 jumps higher than normal (' + Math.round(h3) + ' vs ' + Math.round(hN) + ')');
  game.difficulty = 0; game.diff = (await import('../src/core/constants.js')).DIFFICULTY[0];

  // --- underwater swim ---
  flow.newGame(); scenes.sync(); game.mapMaxUnlocked = 11; game.mapNode = 3; enterFromMap();
  assert(game.water === true, 'water stage enables swim mode');
  { const p = game.player; p.invinc = 999; input.jump = false; for (let i = 0; i < 6; i++) step(1); const y0 = p.y; input.jump = true; step(1); input.jump = false; let minY = p.y; for (let i = 0; i < 30; i++) { step(1); if (p.y < minY) minY = p.y; } assert(minY < y0 + 2, 'swim stroke lifts the player'); }

  // --- star power-up: invincibility + defeats enemies on contact ---
  flow.newGame(); scenes.sync(); game.mapNode = 0; enterFromMap();
  { const p = game.player; p.invinc = 0; const st = new E.Star(0, 0); st.state = 'idle'; st.x = p.x + 2; st.y = p.y + 2; st.baseY = st.y; game.items.push(st); step(1); assert(p.star > 0, 'star pickup grants invincibility');
    const en = new E.Stomper(0, 0); en.x = p.x + 4; en.y = p.y; game.enemies.push(en); step(1); assert(en.dead || (en.squash && en.squash > 0), 'star defeats enemies on contact'); }

  // --- wing power-up: flight ---
  flow.newGame(); scenes.sync(); game.mapNode = 0; enterFromMap();
  { const p = game.player; p.invinc = 999; const wg = new E.Wing(0, 0); wg.state = 'idle'; wg.x = p.x + 2; wg.y = p.y + 2; wg.baseY = wg.y; game.items.push(wg); step(1); assert(p.fly > 0, 'wing pickup grants flight');
    input.jump = false; for (let i = 0; i < 3; i++) step(1); const yA = p.y; input.jump = true; let minY = p.y; for (let i = 0; i < 25; i++) { step(1); if (p.y < minY) minY = p.y; } input.jump = false; assert(minY < yA, 'flight rises while holding jump'); }

  // --- bonus stage: warp in, auto-return, main level restored ---
  flow.newGame(); scenes.sync(); input.jump = false; step(1); game.mapNode = 0; enterFromMap();
  { const p = game.player; p.invinc = 999; const savedIdx = game.levelIndex; const wp = new E.WarpGate(0, 0); wp.x = p.x; wp.y = p.y; game.items.push(wp); step(1); assert(game.inBonus === true, 'warp gate enters the bonus room');
    let guard = 0; while (game.inBonus && guard++ < 2000) step(1); assert(game.inBonus === false, 'bonus auto-returns after the timer'); assert(game.levelIndex === savedIdx, 'main level is restored after bonus'); }

  // --- pause -> return to world map ---
  flow.newGame(); scenes.sync(); input.jump = false; step(1); game.mapNode = 0; enterFromMap();
  { input.jump = false; input.left = false; input.right = false; step(1);
    game.state = 'paused'; game.pauseSel = 1; game.pauseConfirm = false;
    input.jump = true; step(1); input.jump = false;
    assert(game.state === 'paused' && game.pauseConfirm === true, 'retire opens a confirm step');
    game.confirmSel = 1; input.left = true; step(1); input.left = false;
    assert(game.confirmSel === 0, 'left selects もどる on the confirm');
    input.jump = true; step(1); input.jump = false;
    assert(game.state === 'worldmap', 'confirming retire returns to the world map');
    // and resume path: pausing then choosing つづける keeps playing
    game.mapNode = 0; input.jump = false; step(1); enterFromMap(); input.jump=false; step(1);
    game.state = 'paused'; game.pauseSel = 0; game.pauseConfirm = false; input.jump = true; step(1); input.jump = false;
    assert(game.state === 'playing', 'continue resumes the stage'); }
  // render both pause screens to catch draw errors
  game.state='paused'; game.pauseConfirm=false; scenes.sync(); scenes.render(); game.pauseConfirm=true; game.confirmSel=1; scenes.render(); game.pauseConfirm=false; game.state='playing';
  // world-map stage preview render (stage / boss / locked)
  game.state='worldmap'; game.mapMaxUnlocked=11; scenes.sync();
  for (const n of [0, 3, 5, 11]) { game.mapNode = n; scenes.render(); }
  game.mapMaxUnlocked = 2; game.mapNode = 5; scenes.render(); game.mapMaxUnlocked = 11; game.state='playing';


  // --- world gimmicks: conveyor / current / wind ---
  flow.newGame(); scenes.sync(); input.jump = false; step(1); game.mapNode = 0; enterFromMap();
  { const p = game.player; p.invinc = 999; for (let i = 0; i < 20; i++) step(1);
    const gy = game.grid.gy; p.x = 5 * 16; p.y = gy * 16 - p.h; p.vx = 0; p.vy = 0; p.onGround = true;
    game.zones = [{ x: 2 * 16, y: gy * 16, w: 12 * 16, h: 16, kind: 'conveyor', dir: 1, power: 0.5 }];
    const x0 = p.x; for (let i = 0; i < 20; i++) { p.onGround = true; step(1); }
    assert(p.x > x0 + 1, 'conveyor carries a grounded player'); }
  flow.startLevel(3); scenes.sync();
  { const p = game.player; p.invinc = 999; p.x = 20 * 16; p.y = 6 * 16; p.vx = 0; p.vy = 0;
    game.zones = [{ x: 18 * 16, y: 2 * 16, w: 6 * 16, h: 9 * 16, kind: 'current', dx: 0, dy: -1, power: 0.6 }];
    const y0 = p.y; for (let i = 0; i < 20; i++) step(1);
    assert(p.y < y0 - 1, 'water current lifts the swimmer'); }
  flow.startLevel(6); scenes.sync();
  { const p = game.player; p.invinc = 999; p.x = 40 * 16; p.y = 6 * 16; p.vx = 0; p.vy = 0; p.onGround = false;
    game.zones = [{ x: 38 * 16, y: 4 * 16, w: 10 * 16, h: 8 * 16, kind: 'wind', dir: 1, power: 0.5 }];
    const x0 = p.x; for (let i = 0; i < 14; i++) { p.onGround = false; step(1); }
    assert(p.x > x0 + 1, 'wind pushes the player sideways'); }

  // bonus warp pipes spawn a warp item in each world's first stage
  for (const idx of [0, 3, 6, 9]) { flow.startLevel(idx); assert(game.items.some(it => it.type === 'warp'), 'world stage ' + idx + ' has a bonus warp pipe'); }

  // boss fight: enter the arena, stomp the boss 3x -> defeat -> victory -> win
  flow.newGame(); scenes.sync(); game.mapMaxUnlocked = 11; game.mapNode = 11; input.jump = false; step(1); enterFromMap();
  assert(game.boss && !game.boss.dead, 'boss spawned in the arena');
  game.player.invinc = 999;
  let guardB = 0;
  while (game.boss && !game.boss.dead && guardB++ < 3000) {
    const b = game.boss;
    if (b.invuln > 0) { step(1); continue; }                 // wait out the grace period
    game.player.x = b.x + b.w / 2 - game.player.w / 2; game.player.y = b.y - game.player.h - 1; game.player.vy = 2; game.player.onGround = false;
    step(1);
  }
  assert(game.boss && game.boss.dead, 'boss defeated by stomping');
  let guardW = 0; while (game.state !== 'win' && guardW++ < 1500) step(1);
  assert(game.state === 'win', 'defeating the boss wins the game');

  // render every level once (all themes + water + boss) to catch draw-time errors
  for (let i = 0; i < 12; i++) { flow.startLevel(i); scenes.sync(); scenes.render(); scenes.render(); }

  // render the remaining stub scenes (never entered by flow, but must not throw)
  for (const name of ['boss', 'cutscene']) { scenes.set(name); scenes.render(); }
  scenes.set('worldmap'); scenes.render();

  return frames;
}

/* ------------------------------------------------------------------ Part B */
async function partB() {
  const env = makeEnv();
  const realSetInterval = globalThis.setInterval;
  globalThis.setInterval = () => 0; // keep the music scheduler inert / non-hanging

  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const m = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('no <script> found in built index.html');
  const src = m[1];

  // run the bundle IIFE in this (stubbed) global scope
  // eslint-disable-next-line no-new-func
  new Function(src)();

  const press = (code) => { env.key('keydown', code); };
  const release = (code) => { env.key('keyup', code); };

  // simulate: start, then run+jump to the right for many frames
  press('Enter'); release('Enter');
  let t = 0;
  const tick = () => { const cb = env.getRaf(); if (cb) cb(t); t += 16.7; };
  for (let i = 0; i < 600; i++) {
    if (i === 5) press('ArrowRight');
    if (i % 30 === 10) press('Space');
    if (i % 30 === 16) release('Space');
    if (i % 45 === 20) press('KeyX');
    if (i % 45 === 30) release('KeyX');
    tick();
  }
  globalThis.setInterval = realSetInterval;
  return t;
}

/* --------------------------------------------------------------------- run */
(async () => {
  try {
    const a = await partA();
    console.log(`Part A (dev modules): OK — drove ${a} frames through all states`);
  } catch (e) {
    console.error('Part A FAILED:', e && e.stack || e);
    process.exit(1);
  }
  try {
    await partB();
    console.log('Part B (built bundle): OK — booted and ran the rAF loop with input');
  } catch (e) {
    console.error('Part B FAILED:', e && e.stack || e);
    process.exit(1);
  }
  console.log('\nALL SMOKE TESTS PASSED ✔');
  process.exit(0);
})();
