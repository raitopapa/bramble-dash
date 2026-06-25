<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<title>Bramble's Dash - ブランブルのぼうけん</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Baloo+2:wght@500;700;800&display=swap" rel="stylesheet">
<style>
  :root{ --bg0:#10183a; --bg1:#1b2a5e; --accent:#ffd23a; --accent2:#ff7a3a; --panel:#0c1330; --line:#39509e; }
  *{ box-sizing:border-box; }
  html,body{ margin:0; height:100%; }
  body{
    font-family:"Baloo 2","Hiragino Maru Gothic ProN","Yu Gothic",sans-serif;
    background:
      radial-gradient(1200px 700px at 50% -10%, #2a3f86 0%, rgba(42,63,134,0) 60%),
      radial-gradient(900px 600px at 85% 110%, #3a2a6e 0%, rgba(58,42,110,0) 55%),
      linear-gradient(160deg, var(--bg0), #0a1130 70%);
    color:#eaf0ff; min-height:100%;
    display:flex; flex-direction:column; align-items:center;
    padding:14px 12px 26px; -webkit-tap-highlight-color:transparent; overflow-x:hidden;
  }
  body::before{
    content:""; position:fixed; inset:0; pointer-events:none; opacity:.25;
    background-image:radial-gradient(rgba(255,255,255,.12) 1px, transparent 1px);
    background-size:22px 22px; -webkit-mask:radial-gradient(120% 100% at 50% 0, #000 30%, transparent 75%);
    mask:radial-gradient(120% 100% at 50% 0, #000 30%, transparent 75%);
  }
  header{ text-align:center; margin-bottom:12px; z-index:1; }
  header h1{
    font-family:"Press Start 2P",monospace; font-weight:400;
    font-size:clamp(14px,3.6vw,26px); letter-spacing:1px; margin:0; color:var(--accent);
    text-shadow:0 2px 0 #b9780c,0 4px 0 #7a4e06,0 6px 10px rgba(0,0,0,.5);
  }
  header p{ margin:8px 0 0; font-weight:700; font-size:clamp(11px,2.2vw,14px); color:#bcd0ff; opacity:.9; }
  .stage-wrap{ position:relative; width:100%; max-width:980px; z-index:1; }
  .stage{
    position:relative; width:100%; aspect-ratio:16/9; border-radius:18px; overflow:hidden; background:#7cc0ff;
    box-shadow:0 0 0 4px #0c1330,0 0 0 10px #2a3f86,0 18px 40px rgba(0,0,0,.55),inset 0 0 60px rgba(0,0,0,.25);
  }
  .stage::after{
    content:""; position:absolute; inset:0; pointer-events:none; border-radius:18px;
    box-shadow:inset 0 0 90px rgba(0,0,0,.28);
    background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,0) 18%);
  }
  canvas{ display:block; width:100%; height:100%; touch-action:none; }
  .topbtns{ position:absolute; top:10px; right:10px; display:flex; gap:8px; z-index:5; }
  .iconbtn{
    width:38px; height:38px; border-radius:11px; border:none; cursor:pointer;
    background:rgba(12,19,48,.6); color:#fff; font-size:18px; font-weight:800;
    backdrop-filter:blur(4px); box-shadow:0 3px 10px rgba(0,0,0,.4);
    display:flex; align-items:center; justify-content:center; user-select:none;
  }
  .iconbtn:active{ transform:translateY(1px) scale(.96); }
  .touch{ position:absolute; inset:0; z-index:4; pointer-events:none; display:none; }
  .touch.show{ display:block; }
  .pad{ position:absolute; bottom:16px; left:16px; display:flex; gap:10px; }
  .btns{ position:absolute; bottom:16px; right:16px; display:flex; gap:14px; align-items:flex-end; }
  .tbtn{
    pointer-events:auto; user-select:none; touch-action:none; border:none; color:#fff; font-weight:800;
    font-family:"Baloo 2",sans-serif; background:rgba(20,30,70,.5); backdrop-filter:blur(3px);
    box-shadow:0 4px 12px rgba(0,0,0,.4),inset 0 2px 0 rgba(255,255,255,.18);
    display:flex; align-items:center; justify-content:center;
  }
  .tbtn:active{ background:rgba(40,60,120,.7); transform:translateY(2px); }
  .dpadbtn{ width:58px; height:58px; border-radius:16px; font-size:24px; }
  .actbtn{ width:66px; height:66px; border-radius:50%; font-size:20px; }
  #btn-a{ width:74px; height:74px; background:rgba(70,160,80,.55); }
  #btn-b{ background:rgba(220,90,70,.5); margin-bottom:18px; }
  .legend{ margin-top:14px; display:flex; flex-wrap:wrap; gap:8px 10px; justify-content:center; z-index:1; max-width:900px; }
  .chip{ background:var(--panel); border:1.5px solid var(--line); border-radius:999px; padding:6px 12px; font-weight:700; font-size:12.5px; color:#cfe0ff; display:flex; align-items:center; gap:7px; }
  .chip b{ color:var(--accent); font-family:"Press Start 2P",monospace; font-size:10px; }
  footer{ margin-top:16px; font-size:12px; color:#8ea0d8; text-align:center; z-index:1; }
  @media (max-width:560px){ header p{ display:none; } .legend{ display:none; } }
</style>
</head>
<body>
  <header>
    <h1>BRAMBLE'S DASH</h1>
    <p>ブランブルのぼうけん — 横スクロール アクション</p>
  </header>
  <div class="stage-wrap">
    <div class="stage" id="stage">
      <canvas id="game"></canvas>
      <div class="topbtns">
        <button class="iconbtn" id="muteBtn" title="ミュート">&#9834;</button>
        <button class="iconbtn" id="fsBtn" title="全画面">&#9974;</button>
      </div>
      <div class="touch" id="touch">
        <div class="pad">
          <button class="tbtn dpadbtn" id="btn-left">&#9664;</button>
          <button class="tbtn dpadbtn" id="btn-down">&#9660;</button>
          <button class="tbtn dpadbtn" id="btn-right">&#9654;</button>
        </div>
        <div class="btns">
          <button class="tbtn actbtn" id="btn-b">B</button>
          <button class="tbtn actbtn" id="btn-a">A</button>
        </div>
      </div>
    </div>
  </div>
  <div class="legend">
    <span class="chip"><b>&#8592; &#8594;</b> 移動</span>
    <span class="chip"><b>SPACE / &#8593; / Z</b> ジャンプ</span>
    <span class="chip"><b>X / SHIFT</b> ダッシュ・ファイア</span>
    <span class="chip"><b>&#8595;</b> しゃがむ</span>
    <span class="chip"><b>P / ENTER</b> ポーズ</span>
    <span class="chip"><b>M</b> 音切替</span>
  </div>
  <footer>キノコで大きく、花でファイア。敵は上から踏む。甲羅は蹴れる。土管の花に注意！</footer>
<script>
(() => {
'use strict';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const stage = document.getElementById('stage');

const TILE = 16;
const GRAVITY = 0.42, HOLD_G = 0.22, JUMP_V = 5.0, MAXFALL = 7.6;
const GRAVITY_E = 0.4;
const COYOTE = 7, JBUF = 7, INVINC = 1.6, GROWANIM = 0.5;
const BASE_VIEW_H = 232;

let camW = 412, camH = BASE_VIEW_H, scale = 2;
let animClock = 0, last = 0, acc = 0;
const STEP = 1/60;

const clamp = (v,a,b)=> v<a?a:(v>b?b:v);
const lerp = (a,b,t)=> a+(b-a)*t;
const rand = (a,b)=> a+Math.random()*(b-a);
function mulberry32(seed){ return function(){ let t=seed+=0x6D2B79F5; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; }; }
function aabb(a,b){ return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y; }
function rr(c,x,y,w,h,r){ r=Math.min(r,w/2,h/2); c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
function ellipse(x,y,rx,ry){ ctx.beginPath(); ctx.ellipse(x,y,Math.max(0.1,rx),Math.max(0.1,ry),0,0,Math.PI*2); ctx.fill(); }

const THEMES = {
  overworld:{ cave:false, skyTop:'#74bcff', skyBot:'#cfeeff',
    hill:'#62c451', hillDark:'#3aa336', bush:'#57c84d', bushDark:'#3aa336', bushLight:'#86e07a',
    grass:'#5fc24a', grassDark:'#3aa336', soil:'#c8743a', soilDark:'#9c5424', soilEdge:'#a85f2e',
    brick:'#c8612f', brickLine:'#7a3413', stone:'#bcc3cf', stoneDark:'#8a93a3', used:'#b07a3a', usedDark:'#6e4a1f' },
  cave:{ cave:true, skyTop:'#0a1230', skyBot:'#16285a',
    hill:'#1b2b55', hillDark:'#122142', bush:'#23406e', bushDark:'#16294a', bushLight:'#365a96',
    grass:'#5a7aa0', grassDark:'#3a516e', soil:'#3c4d6c', soilDark:'#27344b', soilEdge:'#48597c',
    brick:'#566b8a', brickLine:'#2c3a52', stone:'#566b8a', stoneDark:'#34465f', used:'#445574', usedDark:'#2a374e' }
};

// ============ INPUT ============
const input = { left:false,right:false,down:false,jump:false,fire:false,start:false,pause:false };
const prevIn = { jump:false,fire:false,start:false,pause:false };
const edge = { jump:false,fire:false,start:false,pause:false };
function inputBegin(){ edge.jump=input.jump&&!prevIn.jump; edge.fire=input.fire&&!prevIn.fire; edge.start=input.start&&!prevIn.start; edge.pause=input.pause&&!prevIn.pause; }
function inputEnd(){ prevIn.jump=input.jump; prevIn.fire=input.fire; prevIn.start=input.start; prevIn.pause=input.pause; }

window.addEventListener('keydown', e=>{
  initAudioOnce();
  switch(e.code){
    case 'ArrowLeft': case 'KeyA': input.left=true; e.preventDefault(); break;
    case 'ArrowRight': case 'KeyD': input.right=true; e.preventDefault(); break;
    case 'ArrowDown': case 'KeyS': input.down=true; e.preventDefault(); break;
    case 'ArrowUp': case 'KeyW': case 'Space': case 'KeyZ': case 'KeyK': input.jump=true; e.preventDefault(); break;
    case 'KeyX': case 'KeyJ': case 'ShiftLeft': case 'ShiftRight': input.fire=true; break;
    case 'Enter': input.start=true; input.pause=true; e.preventDefault(); break;
    case 'KeyP': input.pause=true; break;
    case 'KeyM': if(!e.repeat) toggleMute(); break;
  }
});
window.addEventListener('keyup', e=>{
  switch(e.code){
    case 'ArrowLeft': case 'KeyA': input.left=false; break;
    case 'ArrowRight': case 'KeyD': input.right=false; break;
    case 'ArrowDown': case 'KeyS': input.down=false; break;
    case 'ArrowUp': case 'KeyW': case 'Space': case 'KeyZ': case 'KeyK': input.jump=false; break;
    case 'KeyX': case 'KeyJ': case 'ShiftLeft': case 'ShiftRight': input.fire=false; break;
    case 'Enter': input.start=false; input.pause=false; break;
    case 'KeyP': input.pause=false; break;
  }
});
function bindBtn(id,key){
  const el=document.getElementById(id); if(!el) return;
  const on=(e)=>{ e.preventDefault(); try{el.setPointerCapture(e.pointerId);}catch(_){} input[key]=true; initAudioOnce(); };
  const off=()=>{ input[key]=false; };
  el.addEventListener('pointerdown',on);
  el.addEventListener('pointerup',off);
  el.addEventListener('pointercancel',off);
  el.addEventListener('lostpointercapture',off);
  el.addEventListener('contextmenu',e=>e.preventDefault());
}
bindBtn('btn-left','left'); bindBtn('btn-right','right'); bindBtn('btn-down','down');
bindBtn('btn-a','jump'); bindBtn('btn-b','fire');
if(window.matchMedia && window.matchMedia('(pointer:coarse)').matches){ document.getElementById('touch').classList.add('show'); }
window.addEventListener('touchstart', ()=>{ document.getElementById('touch').classList.add('show'); }, {once:true, passive:true});
canvas.addEventListener('pointerdown', ()=>{ initAudioOnce(); if(game.state==='title'||game.state==='gameover'||game.state==='win'){ game.oneShotStart=true; } });
document.getElementById('muteBtn').addEventListener('click', toggleMute);
document.getElementById('fsBtn').addEventListener('click', ()=>{
  if(!document.fullscreenElement){ const f=stage.requestFullscreen||stage.webkitRequestFullscreen; if(f) f.call(stage); }
  else if(document.exitFullscreen) document.exitFullscreen();
});

// ============ AUDIO ============
let AC=null, master=null, sfxGain=null, musicGain=null, audioReady=false, muted=false, musicOn=true;
let musicTimer=null, seqArr=[], loopBeats=8, schedIdx=0, loopStartTime=0; const BPM=138, SPB=60/BPM;
function initAudioOnce(){
  if(audioReady){ if(AC.state==='suspended') AC.resume(); return; }
  try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return; }
  master=AC.createGain(); master.gain.value=muted?0:0.85; master.connect(AC.destination);
  sfxGain=AC.createGain(); sfxGain.gain.value=0.5; sfxGain.connect(master);
  musicGain=AC.createGain(); musicGain.gain.value=0.18; musicGain.connect(master);
  audioReady=true; startMusic();
}
function toggleMute(){ muted=!muted; if(master) master.gain.value=muted?0:0.85; document.getElementById('muteBtn').innerHTML=muted?'&#9834;&#824;':'&#9834;'; }
function duckMusic(v){ if(musicGain&&AC) musicGain.gain.setTargetAtTime(0.18*v, AC.currentTime, 0.05); }
function blip(o){
  if(!audioReady) return;
  const t0=AC.currentTime+(o.when||0); const dur=o.dur||0.1;
  const osc=AC.createOscillator(), g=AC.createGain();
  osc.type=o.type||'square';
  osc.frequency.setValueAtTime(o.f0||440,t0);
  if(o.f1 && o.f1!==o.f0) osc.frequency.exponentialRampToValueAtTime(Math.max(1,o.f1), t0+dur);
  g.gain.setValueAtTime(0.0001,t0);
  g.gain.exponentialRampToValueAtTime(o.vol||0.3, t0+0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
  osc.connect(g); g.connect(o.bus||sfxGain); osc.start(t0); osc.stop(t0+dur+0.03);
}
function noiseBurst(o){
  if(!audioReady) return;
  const t0=AC.currentTime+(o.when||0); const dur=o.dur||0.15;
  const buf=AC.createBuffer(1, Math.ceil(AC.sampleRate*dur), AC.sampleRate);
  const d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  const src=AC.createBufferSource(); src.buffer=buf;
  const f=AC.createBiquadFilter(); f.type=o.filter||'lowpass'; f.frequency.value=o.freq||1400;
  const g=AC.createGain(); g.gain.setValueAtTime(o.vol||0.3,t0); g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  src.connect(f); f.connect(g); g.connect(sfxGain); src.start(t0); src.stop(t0+dur);
}
function seq(notes,type,vol){ if(!audioReady) return; let w=0; for(const n of notes){ blip({type:type||'square', f0:n[0], f1:n[0], dur:n[1]*0.92, vol:vol||0.26, when:w}); w+=n[1]; } }
const sfxJump   = ()=> blip({type:'square', f0:300, f1:660, dur:0.15, vol:0.22});
const sfxStomp  = ()=> { noiseBurst({filter:'lowpass', freq:1100, dur:0.1, vol:0.32}); blip({type:'square', f0:220, f1:90, dur:0.1, vol:0.2}); };
const sfxCoin   = ()=> { blip({type:'square', f0:988, dur:0.06, vol:0.25}); blip({type:'square', f0:1319, dur:0.14, vol:0.25, when:0.06}); };
const sfxBump   = ()=> blip({type:'square', f0:180, f1:120, dur:0.08, vol:0.22});
const sfxBreak  = ()=> { noiseBurst({filter:'lowpass', freq:2600, dur:0.18, vol:0.4}); blip({type:'square', f0:240, f1:120, dur:0.1, vol:0.2}); };
const sfxKick   = ()=> blip({type:'square', f0:520, f1:180, dur:0.12, vol:0.25});
const sfxFire   = ()=> { blip({type:'sawtooth', f0:700, f1:1500, dur:0.08, vol:0.18}); noiseBurst({filter:'highpass', freq:1800, dur:0.06, vol:0.14}); };
const sfxSprout = ()=> seq([[330,0.07],[440,0.07],[554,0.07],[659,0.12]],'square',0.24);
const sfxPowerup= ()=> seq([[392,0.06],[523,0.06],[659,0.06],[784,0.06],[1047,0.14]],'square',0.26);
const sfxShrink = ()=> { blip({type:'square', f0:520, f1:170, dur:0.22, vol:0.24}); noiseBurst({filter:'lowpass', freq:900, dur:0.12, vol:0.18}); };
const sfx1up    = ()=> seq([[659,0.1],[784,0.1],[1047,0.1],[1319,0.22]],'square',0.24);
const sfxFlag   = ()=> seq([[523,0.09],[659,0.09],[784,0.09],[1047,0.18]],'triangle',0.26);
const sfxFlagDn = ()=> blip({type:'square', f0:400, f1:200, dur:0.12, vol:0.2});
const sfxTick   = ()=> blip({type:'square', f0:1200, dur:0.03, vol:0.13});
const sfxClear  = ()=> seq([[523,0.13],[659,0.13],[784,0.13],[1047,0.13],[784,0.13],[1047,0.34]],'triangle',0.28);
const sfxDie    = ()=> seq([[440,0.14],[392,0.14],[330,0.14],[262,0.14],[196,0.32]],'triangle',0.28);
const sfxWin    = ()=> seq([[523,0.12],[523,0.12],[523,0.12],[523,0.18],[415,0.18],[466,0.18],[523,0.18],[1,0.1],[466,0.12],[523,0.4]],'square',0.26);
const sfxPause  = ()=> blip({type:'square', f0:600, dur:0.05, vol:0.18});
function buildSeq(){
  const chords=[ [60,64,67], [57,60,64], [53,57,60], [55,59,62] ];
  seqArr=[]; let tb=0; const e=0.5;
  for(const ch of chords){
    const pat=[ch[0]+12, ch[1]+12, ch[2]+12, ch[1]+12];
    for(let i=0;i<4;i++) seqArr.push({t:tb+i*e, dur:e*0.9, midi:pat[i], voice:'lead'});
    seqArr.push({t:tb, dur:0.9, midi:ch[0]-12, voice:'bass'});
    seqArr.push({t:tb+1, dur:0.9, midi:ch[2]-12, voice:'bass'});
    tb+=2;
  }
  loopBeats=tb;
}
const ntf = n=> 440*Math.pow(2,(n-69)/12);
function startMusic(){
  if(!audioReady||musicTimer) return;
  buildSeq(); loopStartTime=AC.currentTime+0.12; schedIdx=0;
  musicTimer=setInterval(()=>{
    if(!musicOn||!audioReady) return;
    const ahead=0.2;
    for(let guard=0; guard<64; guard++){
      const ev=seqArr[schedIdx]; const et=loopStartTime+ev.t*SPB;
      if(et < AC.currentTime+ahead){
        const o=AC.createOscillator(), g=AC.createGain();
        o.type = ev.voice==='lead'?'square':'triangle';
        o.frequency.value=ntf(ev.midi);
        const peak = ev.voice==='lead'?0.16:0.2;
        g.gain.setValueAtTime(0.0001,et);
        g.gain.linearRampToValueAtTime(peak, et+0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, et+ev.dur*SPB);
        o.connect(g); g.connect(musicGain); o.start(et); o.stop(et+ev.dur*SPB+0.05);
        schedIdx++; if(schedIdx>=seqArr.length){ schedIdx=0; loopStartTime+=loopBeats*SPB; }
      } else break;
    }
  },30);
}

// ============ GAME STATE ============
const game = {
  state:'title', oneShotStart:false,
  level:null, levelIndex:0, grid:null, theme:THEMES.overworld,
  worldW:0, worldH:0, goalX:0, goalGroundY:0, goalPoleTop:0,
  camX:0, camY:0,
  score:0, coins:0, lives:3, time:300,
  enemies:[], items:[], fireballs:[], particles:[], popups:[], popcoins:[], bumps:[],
  player:null,
  cleared:false, clearPhase:null, clearTimer:0, holdT:0, fanfarePlayed:false,
  deathTimer:0, confetti:[]
};

const SOLID = new Set(['X','S','B','?','!','U','P']);
function isSolidCh(c){ return SOLID.has(c); }
function solidTile(tx,ty){
  if(ty<0) return false;
  if(tx<0) return true;
  if(tx>=game.grid.w) return false;
  if(ty>=game.grid.h) return false;
  return isSolidCh(game.grid.c[ty][tx]);
}
function gget(x,y){ if(x<0||x>=game.grid.w||y<0||y>=game.grid.h) return ' '; return game.grid.c[y][x]; }
function gset(x,y,ch){ if(x<0||x>=game.grid.w||y<0||y>=game.grid.h) return; game.grid.c[y][x]=ch; }
function collideX(e){
  e.x += e.vx;
  const top=Math.floor(e.y/16), bot=Math.floor((e.y+e.h-1)/16);
  if(e.vx>0){ const tx=Math.floor((e.x+e.w-1)/16); for(let ty=top;ty<=bot;ty++){ if(solidTile(tx,ty)){ e.x=tx*16-e.w; e.vx=0; e._hitR=true; break; } } }
  else if(e.vx<0){ const tx=Math.floor(e.x/16); for(let ty=top;ty<=bot;ty++){ if(solidTile(tx,ty)){ e.x=(tx+1)*16; e.vx=0; e._hitL=true; break; } } }
}
function collideY(e,isPlayer){
  e.y += e.vy;
  const left=Math.floor(e.x/16), right=Math.floor((e.x+e.w-1)/16);
  if(e.vy>0){ const ty=Math.floor((e.y+e.h-1)/16);
    for(let tx=left;tx<=right;tx++){ if(solidTile(tx,ty)){ e.y=ty*16-e.h; e.vy=0; e.onGround=true; e._hitD=true; break; } }
  } else if(e.vy<0){ const ty=Math.floor(e.y/16); const hits=[];
    for(let tx=left;tx<=right;tx++){ if(solidTile(tx,ty)) hits.push(tx); }
    if(hits.length){ e.y=(ty+1)*16; e.vy=0; e._hitU=true;
      if(isPlayer){ const cxf=(e.x+e.w/2)/16; let best=hits[0],bd=1e9; for(const t of hits){ const d=Math.abs(t+0.5-cxf); if(d<bd){bd=d;best=t;} } bumpBlock(best,ty); }
    }
  }
}

function addScore(n){ game.score+=n; }
function addCoin(n){ game.coins+=n; while(game.coins>=100){ game.coins-=100; game.lives++; sfx1up(); popupWorld(game.player.x, game.player.y-12, '1UP', '#fff'); } }
function popupWorld(x,y,text,color){ game.popups.push(new Popup(x,y,text,color||'#fff')); }
function spawnItem(it){ game.items.push(it); }
function spawnFireball(p){ const x = p.facing>0? p.x+p.w : p.x-8; game.fireballs.push(new Fireball(x, p.y+p.h*0.4, p.facing)); }
function countFB(){ let n=0; for(const f of game.fireballs) if(!f.dead) n++; return n; }
function bumpAnim(tx,ty){ game.bumps.push({tx,ty,t:0,dur:0.16}); }
function bumpOffset(tx,ty){ for(const b of game.bumps){ if(b.tx===tx&&b.ty===ty) return Math.sin((b.t/b.dur)*Math.PI)*5; } return 0; }
function bumpBlock(tx,ty){
  const ch=gget(tx,ty);
  if(ch==='?'||ch==='!'){
    if(ch==='?'){ spawnPopCoin(tx,ty); addCoin(1); addScore(200); sfxCoin(); }
    else { if(game.player.form==='small') spawnItem(new Mushroom(tx,ty-1)); else spawnItem(new Flower(tx,ty)); addScore(1000); sfxSprout(); }
    gset(tx,ty,'U'); bumpAnim(tx,ty);
  } else if(ch==='B'){
    if(game.player.form!=='small'){ gset(tx,ty,' '); spawnBrickDebris(tx,ty); addScore(50); sfxBreak(); }
    else { bumpAnim(tx,ty); sfxBump(); }
  } else { bumpAnim(tx,ty); sfxBump(); }
  bumpEnemiesAbove(tx,ty);
}
function bumpEnemiesAbove(tx,ty){
  const x0=tx*16, x1=tx*16+16, topY=ty*16;
  for(const e of game.enemies){ if(e.dead||(e.squash&&e.squash>0)||e.type==='chomper') continue;
    const feet=e.y+e.h;
    if(e.x+e.w>x0 && e.x<x1 && feet>=topY-6 && feet<=topY+8){
      if(e.type==='stomper'){ killEnemy(e); addScore(100); popupWorld(e.x,e.y-4,'100'); }
      else if(e.type==='shellback'){ e.toShell(); addScore(100); popupWorld(e.x,e.y-4,'100'); }
      e.vy=-2.6;
    }
  }
}
function killEnemy(e){ e.dead=true; spawnPuff(e.x+e.w/2, e.y+e.h/2); }
function spawnPuff(x,y){ for(let i=0;i<5;i++) game.particles.push(new Particle(x,y, rand(-1,1), rand(-1.4,-0.2), {type:'puff', size:rand(2.5,4), life:rand(0.25,0.4), g:0, color:'#ffffff'})); }
function spawnDust(x,y){ for(let i=0;i<3;i++) game.particles.push(new Particle(x+rand(-3,3),y, rand(-0.6,0.6), rand(-0.6,-0.1), {type:'puff', size:rand(1.6,2.6), life:rand(0.2,0.3), g:0.04, color:'#e9d8b6'})); }
function spawnBrickDebris(tx,ty){ const cx=tx*16+8, cy=ty*16+8, c=game.theme.brick; const v=[[-1.4,-3.4],[1.4,-3.4],[-1.0,-2.0],[1.0,-2.0]]; for(const d of v) game.particles.push(new Particle(cx,cy,d[0],d[1],{type:'debris', size:4, life:0.8, g:0.32, color:c, rotv:rand(-0.4,0.4)})); }
function spawnSpark(x,y,color){ for(let i=0;i<5;i++){ const a=Math.random()*Math.PI*2, s=rand(0.6,2); game.particles.push(new Particle(x,y,Math.cos(a)*s,Math.sin(a)*s-0.6,{type:'spark', size:rand(1,2), life:rand(0.25,0.45), g:0.08, color:color||'#ffe79a'})); } }
function spawnPopCoin(tx,ty){ game.popcoins.push(new PopCoin(tx,ty)); }

// ============ PLAYER ============
class Player{
  constructor(){ this.form='small'; this.sizeFromForm(); this.x=0; this.y=0; this.vx=0; this.vy=0;
    this.facing=1; this.onGround=false; this.jumping=false; this.jumpHeld=false; this.coyote=0; this.jumpBuffer=0;
    this.invinc=0; this.growT=0; this.combo=0; this.crouch=false; this.dead=false; this.onPole=false;
    this.walkPhase=0; this.blink=false; this.blinkT=2; this.landT=0; this._lastGround=false; }
  sizeFromForm(){ if(this.form==='small'){ this.w=12; this.h=14; } else { this.w=12; this.h=24; } }
  setSizeKeepFeet(){ const feet=this.y+this.h; this.sizeFromForm(); this.y=feet-this.h; }
  resetForLevel(lvl){ this.sizeFromForm(); this.x=lvl.spawnX; this.y=lvl.spawnFeetY-this.h; this.vx=0; this.vy=0;
    this.facing=1; this.onGround=false; this.jumping=false; this.coyote=0; this.jumpBuffer=0; this.invinc=0; this.growT=0;
    this.combo=0; this.crouch=false; this.dead=false; this.onPole=false; this.walkPhase=0; this.blink=false; this.blinkT=rand(2,4); this.landT=0; this._lastGround=false; }
  grow(){ if(this.form==='small'){ this.form='big'; this.setSizeKeepFeet(); this.growT=GROWANIM; this.invinc=Math.max(this.invinc,0.6); sfxPowerup(); spawnSpark(this.x+this.w/2,this.y+this.h/2,'#fff'); } }
  toFire(){ this.form='fire'; this.setSizeKeepFeet(); this.growT=GROWANIM; this.invinc=Math.max(this.invinc,0.6); sfxPowerup(); spawnSpark(this.x+this.w/2,this.y+this.h/2,'#ffae3a'); }
  hurt(){ if(this.invinc>0||this.dead) return;
    if(this.form==='fire'){ this.form='big'; this.setSizeKeepFeet(); this.invinc=INVINC; sfxShrink(); spawnSpark(this.x+this.w/2,this.y,'#fff'); }
    else if(this.form==='big'){ this.form='small'; this.setSizeKeepFeet(); this.invinc=INVINC; sfxShrink(); spawnSpark(this.x+this.w/2,this.y,'#fff'); }
    else this.die();
  }
  die(){ if(this.dead) return; this.dead=true; game.lives--; game.state='dying'; game.deathTimer=1.8; this.vx=0; this.vy=-6.6; duckMusic(0); sfxDie(); }
  update(dt){
    if(this.invinc>0) this.invinc-=dt;
    if(this.growT>0) this.growT-=dt;
    if(this.landT>0) this.landT-=dt;
    this.blinkT-=dt; if(this.blinkT<=0){ if(this.blink){ this.blink=false; this.blinkT=rand(1.6,4.5); } else { this.blink=true; this.blinkT=0.12; } }
    this.crouch = (this.form!=='small' && input.down && this.onGround && Math.abs(this.vx)<0.7);
    const running=input.fire, onG=this.onGround;
    const maxWalk=1.7, maxRun=2.95, maxS=running?maxRun:maxWalk;
    const accel = onG?(running?0.235:0.16):0.12;
    let dir=0; if(input.left) dir=-1; else if(input.right) dir=1;
    if(this.crouch) dir=0;
    if(dir!==0){ this.facing=dir; if(Math.sign(this.vx)!==dir || Math.abs(this.vx)<maxS) this.vx+=accel*dir; }
    else { const f=onG?0.2:0.05; if(this.vx>0){ this.vx-=f; if(this.vx<0)this.vx=0; } else if(this.vx<0){ this.vx+=f; if(this.vx>0)this.vx=0; } }
    if(this.vx>maxS && onG && dir>=0) this.vx=Math.max(maxS,this.vx-0.08);
    if(this.vx<-maxS && onG && dir<=0) this.vx=Math.min(-maxS,this.vx+0.08);
    this.vx=clamp(this.vx,-maxRun,maxRun);
    if(onG) this.coyote=COYOTE; else if(this.coyote>0) this.coyote--;
    if(edge.jump) this.jumpBuffer=JBUF; else if(this.jumpBuffer>0) this.jumpBuffer--;
    if(this.jumpBuffer>0 && (onG||this.coyote>0)){ this.vy=-JUMP_V; this.onGround=false; this.coyote=0; this.jumpBuffer=0; this.jumping=true; sfxJump(); spawnDust(this.x+this.w/2,this.y+this.h); }
    this.jumpHeld=input.jump;
    if(this.vy<0 && !this.jumpHeld && this.jumping){ this.vy*=0.45; this.jumping=false; }
    const g=(this.vy<0 && this.jumpHeld)?HOLD_G:GRAVITY;
    this.vy+=g; if(this.vy>MAXFALL) this.vy=MAXFALL;
    this._hitL=this._hitR=this._hitU=this._hitD=false; this.onGround=false;
    collideX(this); collideY(this,true);
    if(this._hitD) this.jumping=false;
    if(this.onGround && !this._lastGround){ this.landT=0.12; spawnDust(this.x+this.w/2,this.y+this.h); }
    this._lastGround=this.onGround;
    if(onG && Math.abs(this.vx)>0.3) this.walkPhase += Math.abs(this.vx)*dt*9;
    if(this.y > game.worldH+40){ this.die(); return; }
    if(this.form==='fire' && edge.fire && countFB()<2){ spawnFireball(this); sfxFire(); }
    if(this.onGround) this.combo=0;
  }
  draw(){
    if(this.invinc>0 && game.state==='playing' && Math.floor(this.invinc*16)%2===0) return;
    let sx=1, sy=1;
    if(!this.onGround){ if(this.vy<-0.5){ sy=1.12; sx=0.9; } else if(this.vy>1){ sy=0.95; sx=1.06; } }
    if(this.landT>0){ const k=this.landT/0.12; sy=1-0.16*k; sx=1+0.2*k; }
    if(this.growT>0){ const k=this.growT/GROWANIM; const w=Math.sin(k*Math.PI*4)*0.08*k; sx+=w; sy-=w; }
    const size = this.form==='small'?14:22;
    drawCreature(this.x+this.w/2, this.y+this.h, size, this.form, {facing:this.facing, onGround:this.onGround, vy:this.vy, walkPhase:this.walkPhase, blink:this.blink, crouch:this.crouch, sx, sy});
  }
}

// ============ ENEMIES ============
class Stomper{
  constructor(tx,ty){ this.type='stomper'; this.w=14; this.h=14; this.x=tx*16+1; this.y=(ty+1)*16-this.h; this.vx=0; this.vy=0; this.dir=-1; this.squash=0; this.dead=false; this.walk=0; }
  stomp(){ this.squash=0.4; this.vx=0; }
  update(dt){
    if(this.squash>0){ this.squash-=dt; if(this.squash<=0) this.dead=true; return; }
    this.walk+=dt*6; this.vx=this.dir*0.55; this.vy+=GRAVITY_E; if(this.vy>7)this.vy=7;
    this._hitL=this._hitR=this._hitD=false; this.onGround=false;
    collideX(this); if(this._hitL) this.dir=1; if(this._hitR) this.dir=-1;
    collideY(this,false);
    if(this.y>game.worldH+80) this.dead=true;
  }
  draw(){ const cx=this.x+this.w/2, feet=this.y+this.h;
    ctx.fillStyle='rgba(0,0,0,0.18)'; ellipse(cx,feet+1.5,this.w*0.5,2.2);
    if(this.squash>0){ ctx.fillStyle='#9a5230'; rr(ctx,cx-8,feet-5,16,5,2.5); ctx.fill(); ctx.strokeStyle='#5a2e15'; ctx.lineWidth=1; rr(ctx,cx-8,feet-5,16,5,2.5); ctx.stroke(); return; }
    const wob=Math.sin(this.walk);
    ctx.fillStyle='#6e3a1f'; ellipse(cx-4.5,feet-1-(wob>0?1:0),3.2,2.2); ellipse(cx+4.5,feet-1-(wob<0?1:0),3.2,2.2);
    ctx.fillStyle='#a85c2e'; rr(ctx,cx-7,feet-13,14,13,6); ctx.fill();
    ctx.save(); ctx.globalAlpha=0.22; ctx.fillStyle='#6e3a1f'; rr(ctx,cx-7,feet-6.5,14,6.5,5); ctx.fill(); ctx.restore();
    ctx.fillStyle='#fff'; ellipse(cx-3.2,feet-8.6,2.4,2.9); ellipse(cx+3.2,feet-8.6,2.4,2.9);
    ctx.fillStyle='#1a1008'; const lk=this.dir*0.8; ellipse(cx-3.2+lk,feet-8.1,1.1,1.5); ellipse(cx+3.2+lk,feet-8.1,1.1,1.5);
    ctx.strokeStyle='#3a1f10'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(cx-5.5,feet-12); ctx.lineTo(cx-1.5,feet-10.3); ctx.moveTo(cx+5.5,feet-12); ctx.lineTo(cx+1.5,feet-10.3); ctx.stroke();
    ctx.strokeStyle='#5a2e15'; ctx.lineWidth=1; rr(ctx,cx-7,feet-13,14,13,6); ctx.stroke();
  }
}
class Shellback{
  constructor(tx,ty){ this.type='shellback'; this.w=14; this.h=22; this.x=tx*16+1; this.y=(ty+1)*16-this.h; this.vx=0; this.vy=0; this.dir=-1; this.state='walk'; this.dead=false; this.wake=0; this.noHit=0; this.walk=0; this.t=0; }
  toShell(){ const feet=this.y+this.h; this.state='shell'; this.h=14; this.y=feet-this.h; this.vx=0; this.wake=0; }
  toWalk(){ const feet=this.y+this.h; this.state='walk'; this.h=22; this.y=feet-this.h; this.dir=Math.random()<0.5?-1:1; }
  kick(d){ this.state='slide'; this.dir=d; this.noHit=0.2; sfxKick(); }
  update(dt){
    this.t+=dt; this._hitL=this._hitR=this._hitD=false; this.onGround=false;
    if(this.state==='walk'){
      this.walk+=dt*6; this.vx=this.dir*0.5; this.vy+=GRAVITY_E; if(this.vy>7)this.vy=7;
      collideX(this); if(this._hitL)this.dir=1; if(this._hitR)this.dir=-1;
      collideY(this,false);
      if(this.onGround){ const ftx=this.dir>0?Math.floor((this.x+this.w+1)/16):Math.floor((this.x-1)/16); const bty=Math.floor((this.y+this.h+1)/16); if(!solidTile(ftx,bty)) this.dir*=-1; }
    } else if(this.state==='shell'){
      this.vx=0; this.vy+=GRAVITY_E; if(this.vy>7)this.vy=7; collideX(this); collideY(this,false);
      this.wake+=dt; if(this.wake>6) this.toWalk();
    } else {
      this.noHit-=dt; this.vx=this.dir*3.2; this.vy+=GRAVITY_E; if(this.vy>7)this.vy=7;
      collideX(this); if(this._hitL){ this.dir=1; sfxBump(); } if(this._hitR){ this.dir=-1; sfxBump(); }
      collideY(this,false);
    }
    if(this.y>game.worldH+80) this.dead=true;
  }
  draw(){ const cx=this.x+this.w/2, feet=this.y+this.h;
    ctx.fillStyle='rgba(0,0,0,0.18)'; ellipse(cx,feet+1.5,this.w*0.55,2.2);
    if(this.state==='walk'){
      const wob=Math.sin(this.walk);
      ctx.fillStyle='#e8b84a'; ellipse(cx-4,feet-1-(wob>0?1:0),3,2); ellipse(cx+4,feet-1-(wob<0?1:0),3,2);
      const hx=cx+this.dir*5.5, hy=feet-14;
      ctx.fillStyle='#9ad97f'; ellipse(hx,hy,4,4.4);
      ctx.fillStyle='#fff'; ellipse(hx+this.dir*1.2,hy-0.5,1.5,1.9); ctx.fillStyle='#1a1008'; ellipse(hx+this.dir*1.8,hy-0.3,0.9,1.2);
      shellDome(cx,feet,'#2faa46',13);
    } else {
      shellDome(cx,feet,'#2faa46',13);
      if(this.state==='slide'){ ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.lineWidth=1; const dir=this.dir; for(let i=0;i<2;i++){ const ax=cx-dir*(9+i*3); ctx.beginPath(); ctx.arc(ax,feet-7,3+i, dir>0?0.6:2.0, dir>0?2.0:3.6); ctx.stroke(); } }
      else { ctx.fillStyle='#e8b84a'; ellipse(cx-7,feet-3,2.2,1.6); ellipse(cx+7,feet-3,2.2,1.6); }
    }
  }
}
class Chomper{
  constructor(tx,ty){ this.type='chomper'; this.centerX=tx*16+16; this.w=16; this.x=this.centerX-8; this.baseY=(ty+1)*16; this.h=16; this.t=rand(0,6); this.up=0; this.cyc=0; this.dead=false; this.y=this.baseY; }
  update(dt){
    const p=game.player;
    const near = Math.abs((p.x+p.w/2)-this.centerX)<26 && (p.y+p.h) < this.baseY+10;
    this.t+=dt*1.1; const cyc=Math.sin(this.t)*0.5+0.5; const target=near?0:cyc;
    this.up=lerp(this.up,target,0.12); this.cyc=cyc;
    this.y=this.baseY-this.up*24;
  }
  draw(){ const cx=this.centerX;
    ctx.save(); ctx.beginPath(); ctx.rect(cx-30, this.baseY-220, 60, 220); ctx.clip();
    const headY=this.y+6;
    ctx.strokeStyle='#3aa33a'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(cx,this.baseY); ctx.lineTo(cx,headY+2); ctx.stroke();
    ctx.strokeStyle='#2c8a2c'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(cx-1.2,this.baseY); ctx.lineTo(cx-1.2,headY+2); ctx.stroke();
    ctx.fillStyle='#46b846'; ellipse(cx-5,headY+8,4,2); ellipse(cx+5,headY+8,4,2);
    const open=(this.cyc||0)*3.2;
    ctx.fillStyle='#e23b3b'; ctx.beginPath(); ctx.arc(cx,headY,7,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#7a1414'; ctx.beginPath(); ctx.ellipse(cx,headY+0.5,5.5,2.0+open*0.6,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff';
    for(let i=-2;i<=2;i++){ const tx=cx+i*2.2;
      ctx.beginPath(); ctx.moveTo(tx-1,headY-1.4-open*0.6); ctx.lineTo(tx+1,headY-1.4-open*0.6); ctx.lineTo(tx,headY+0.4-open*0.4); ctx.fill();
      ctx.beginPath(); ctx.moveTo(tx-1,headY+1.4+open*0.6); ctx.lineTo(tx+1,headY+1.4+open*0.6); ctx.lineTo(tx,headY-0.4+open*0.4); ctx.fill(); }
    ctx.fillStyle='#ffd23a'; ctx.beginPath(); ctx.arc(cx-3,headY-3,1.1,0,7); ctx.arc(cx+3,headY-3,1.1,0,7); ctx.fill();
    ctx.strokeStyle='#a02020'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx,headY,7,0,Math.PI*2); ctx.stroke();
    ctx.restore();
  }
}
// ============ ITEMS / PROJECTILES ============
class Mushroom{
  constructor(tx,ty){ this.type='mushroom'; this.w=14; this.h=14; this.x=tx*16+1; this.y=ty*16; this.vx=0; this.vy=0; this.dir=1; this.state='emerge'; this.emerge=16; this.dead=false; }
  update(dt){
    if(this.state==='emerge'){ this.y-=0.6; this.emerge-=0.6; if(this.emerge<=0) this.state='walk'; return; }
    this.vx=this.dir*0.95; this.vy+=GRAVITY_E; if(this.vy>7)this.vy=7;
    this._hitL=this._hitR=this._hitD=false; this.onGround=false;
    collideX(this); if(this._hitL)this.dir=1; if(this._hitR)this.dir=-1;
    collideY(this,false);
    if(this.y>game.worldH+80) this.dead=true;
  }
  draw(){ const cx=this.x+this.w/2, feet=this.y+this.h;
    ctx.fillStyle='rgba(0,0,0,0.18)'; ellipse(cx,feet+1.5,this.w*0.5,2);
    ctx.fillStyle='#ffe8c8'; rr(ctx,cx-4,feet-7,8,7,2); ctx.fill();
    ctx.fillStyle='#3a2a1a'; ellipse(cx-2,feet-4,0.9,1.4); ellipse(cx+2,feet-4,0.9,1.4);
    ctx.fillStyle='#e23b3b'; rr(ctx,cx-8,feet-15,16,9,5); ctx.fill();
    ctx.fillStyle='#fff'; ellipse(cx,feet-11,2.4,2.2); ellipse(cx-5,feet-10,1.6,1.5); ellipse(cx+5,feet-10,1.6,1.5);
    ctx.strokeStyle='#a02020'; ctx.lineWidth=1; rr(ctx,cx-8,feet-15,16,9,5); ctx.stroke();
  }
}
class Flower{
  constructor(tx,ty){ this.type='flower'; this.w=14; this.h=14; this.x=tx*16+1; this.baseY=(ty-1)*16; this.y=ty*16; this.state='emerge'; this.emerge=16; this.t=0; this.dead=false; }
  update(dt){
    if(this.state==='emerge'){ this.y-=0.6; this.emerge-=0.6; if(this.emerge<=0) this.state='idle'; return; }
    this.t+=dt; this.y=this.baseY+Math.sin(this.t*3)*1.5;
  }
  draw(){ const cx=this.x+this.w/2, cy=this.y+this.h/2;
    ctx.save(); ctx.globalAlpha=0.3; ctx.fillStyle='#ffd23a'; ellipse(cx,cy,this.w*0.8,this.h*0.8); ctx.restore();
    ctx.strokeStyle='#3aa33a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(cx,this.y+this.h); ctx.lineTo(cx,cy+2); ctx.stroke();
    const pc=8; for(let i=0;i<pc;i++){ const a=i/pc*Math.PI*2+this.t; ctx.fillStyle=i%2?'#ff7a3a':'#ffb13a'; ellipse(cx+Math.cos(a)*5,cy+Math.sin(a)*5,2.6,2.6); }
    ctx.fillStyle='#ffe06a'; ctx.beginPath(); ctx.arc(cx,cy,3.2,0,7); ctx.fill();
    ctx.fillStyle='#b9780c'; ctx.beginPath(); ctx.arc(cx,cy,1.4,0,7); ctx.fill();
  }
}
class Fireball{
  constructor(x,y,dir){ this.type='fireball'; this.w=8; this.h=8; this.x=x; this.y=y; this.vx=dir*4.6; this.vy=2; this.dir=dir; this.dead=false; this.life=2.6; this.spin=0; }
  update(dt){
    this.spin+=dt*22; this.vy+=0.45; if(this.vy>6.5)this.vy=6.5;
    this._hitL=this._hitR=this._hitD=this._hitU=false;
    collideX(this); if(this._hitL||this._hitR){ this.dead=true; spawnSpark(this.x+this.w/2,this.y+this.h/2,'#ffae3a'); }
    collideY(this,false); if(this._hitD){ this.vy=-3.4; }
    this.life-=dt; if(this.life<=0) this.dead=true;
    if(this.x<game.camX-120 || this.x>game.camX+camW+120) this.dead=true;
  }
  draw(){ const cx=this.x+this.w/2, cy=this.y+this.h/2;
    ctx.save(); ctx.globalAlpha=0.4; ctx.fillStyle='#ffae3a'; ctx.beginPath(); ctx.arc(cx,cy,7,0,7); ctx.fill(); ctx.restore();
    ctx.fillStyle='#ff7a1a'; ctx.beginPath(); ctx.arc(cx,cy,4.2,0,7); ctx.fill();
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(this.spin); ctx.fillStyle='#ffe06a'; ctx.fillRect(-2.6,-1,5.2,2); ctx.fillRect(-1,-2.6,2,5.2); ctx.restore();
  }
}
class PopCoin{
  constructor(tx,ty){ this.x=tx*16+8; this.y=ty*16-2; this.vy=-4.4; this.t=0; this.spin=0; this.dead=false; }
  update(dt){ this.vy+=0.28; this.y+=this.vy; this.t+=dt; this.spin+=dt*16; if(this.t>0.5) this.dead=true; }
  draw(){ drawCoin(this.x,this.y,5,this.spin); }
}
class Particle{
  constructor(x,y,vx,vy,o){ this.x=x; this.y=y; this.vx=vx; this.vy=vy; o=o||{}; this.type=o.type||'puff'; this.size=o.size||3; this.life=o.life||0.4; this.max=this.life; this.g=o.g!=null?o.g:0.1; this.color=o.color||'#fff'; this.rot=0; this.rotv=o.rotv||0; this.dead=false; }
  update(dt){ this.x+=this.vx; this.y+=this.vy; this.vy+=this.g; this.rot+=this.rotv; this.life-=dt; if(this.life<=0) this.dead=true; }
  draw(){ const a=clamp(this.life/this.max,0,1);
    if(this.type==='debris'){ ctx.save(); ctx.globalAlpha=a; ctx.translate(this.x,this.y); ctx.rotate(this.rot); ctx.fillStyle=this.color; ctx.fillRect(-this.size/2,-this.size/2,this.size,this.size); ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(-this.size/2,this.size/2-1,this.size,1); ctx.restore(); }
    else if(this.type==='spark'){ ctx.save(); ctx.globalAlpha=a; ctx.fillStyle=this.color; ellipse(this.x,this.y,this.size,this.size); ctx.restore(); }
    else if(this.type==='confetti'){ ctx.save(); ctx.globalAlpha=a; ctx.translate(this.x,this.y); ctx.rotate(this.rot); ctx.fillStyle=this.color; ctx.fillRect(-this.size/2,-this.size/2,this.size,this.size*0.6); ctx.restore(); }
    else { ctx.save(); ctx.globalAlpha=a*0.85; ctx.fillStyle=this.color; const s=this.size*(1+(1-a)*1.4); ellipse(this.x,this.y,s,s); ctx.restore(); }
  }
}
class Popup{
  constructor(x,y,text,color){ this.x=x; this.y=y; this.text=text; this.color=color||'#fff'; this.t=0; this.life=0.85; this.dead=false; }
  update(dt){ this.y-=20*dt; this.t+=dt; if(this.t>this.life) this.dead=true; }
  draw(){ const a=clamp(1-(this.t/this.life),0,1); const sc=1+Math.min(this.t*3,0.3);
    ctx.save(); ctx.globalAlpha=a; ctx.translate(this.x,this.y); ctx.scale(sc,sc);
    ctx.font='7px "Press Start 2P", monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillText(this.text,0.6,0.6);
    ctx.fillStyle=this.color; ctx.fillText(this.text,0,0); ctx.restore();
  }
}

// ============ CREATURE / SHARED DRAW ============
function drawCreature(cx, feet, size, form, o){
  o=o||{}; const facing=o.facing||1; const big=form!=='small'; const fire=form==='fire';
  const C = fire ? {body:'#ff5d4d',shade:'#d8392e',belly:'#ffe1d6',spr:'#ffd23a',spr2:'#ff8a2a',out:'#9e2a20',eye:'#2a1410'}
                 : {body:'#ff9a3c',shade:'#e8631e',belly:'#ffe0b0',spr:'#5fd24a',spr2:'#36a233',out:'#8a3a16',eye:'#2a1810'};
  let bw=size*(big?0.8:0.88), bh=size;
  if(o.crouch) bh*=0.74;
  const sx=o.sx||1, sy=o.sy||1; bw*=sx; bh*=sy;
  const top=feet-bh;
  ctx.fillStyle='rgba(0,0,0,0.18)'; ellipse(cx, feet+1.5, bw*0.6, 2.4);
  if(fire){ ctx.save(); ctx.globalAlpha=0.22; ctx.fillStyle='#ffae3a'; ellipse(cx, feet-bh*0.5, bw*1.05, bh*0.85); ctx.restore(); }
  const wob=Math.sin(o.walkPhase||0); const air=o.onGround===false;
  let lf, rf; if(!air){ lf=wob>0?1.4:0; rf=wob<0?1.4:0; } else { lf=1.2; rf=1.2; }
  ctx.fillStyle=C.shade; ellipse(cx-bw*0.28, feet-1.2-lf, bw*0.26, 2.6); ellipse(cx+bw*0.28, feet-1.2-rf, bw*0.26, 2.6);
  ctx.fillStyle=C.body; rr(ctx, cx-bw/2, top, bw, bh, Math.min(bw,bh)*0.46); ctx.fill();
  ctx.fillStyle=C.belly; rr(ctx, cx-bw*0.3, top+bh*0.45, bw*0.6, bh*0.48, bw*0.25); ctx.fill();
  ctx.save(); ctx.globalAlpha=0.22; ctx.fillStyle=C.shade; rr(ctx, cx-bw/2, top+bh*0.62, bw, bh*0.38, bw*0.3); ctx.fill(); ctx.restore();
  ctx.strokeStyle=C.out; ctx.lineWidth=1; rr(ctx, cx-bw/2, top, bw, bh, Math.min(bw,bh)*0.46); ctx.stroke();
  ctx.save(); ctx.translate(cx, top);
  if(fire){ ctx.fillStyle=C.spr; ctx.beginPath(); ctx.moveTo(0,2); ctx.quadraticCurveTo(-3,-3,0,-7); ctx.quadraticCurveTo(3,-3,0,2); ctx.fill();
    ctx.fillStyle=C.spr2; ctx.beginPath(); ctx.moveTo(0,1); ctx.quadraticCurveTo(-1.6,-2,0,-4.5); ctx.quadraticCurveTo(1.6,-2,0,1); ctx.fill(); }
  else { ctx.strokeStyle=C.spr2; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(0,1); ctx.lineTo(0,-3); ctx.stroke(); ctx.fillStyle=C.spr; leafShape(-1); leafShape(1); }
  ctx.restore();
  const eyeY=top+bh*0.36, eo=bw*0.2, look=facing>0?0.9:-0.9;
  drawEyeAt(cx-eo,eyeY,look,o.blink,C.eye); drawEyeAt(cx+eo,eyeY,look,o.blink,C.eye);
  if(!fire){ ctx.save(); ctx.globalAlpha=0.45; ctx.fillStyle='#ff7a4d'; ellipse(cx-bw*0.34,eyeY+bh*0.16,1.5,1.0); ellipse(cx+bw*0.34,eyeY+bh*0.16,1.5,1.0); ctx.restore(); }
}
function leafShape(side){ ctx.beginPath(); ctx.ellipse(side*2.2,-3.4,2.4,1.3,side*0.6,0,Math.PI*2); ctx.fill(); }
function drawEyeAt(x,y,look,blink,eye){ ctx.fillStyle='#fff'; ellipse(x,y,2.6,3.0); if(blink){ ctx.strokeStyle=eye; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x-2.2,y); ctx.lineTo(x+2.2,y); ctx.stroke(); } else { ctx.fillStyle=eye; ellipse(x+look,y+0.4,1.2,1.5); ctx.fillStyle='rgba(255,255,255,0.9)'; ellipse(x+look-0.6,y-0.3,0.6,0.6); } }
function shellDome(cx,feet,color,h){ ctx.fillStyle=color; rr(ctx,cx-8,feet-h-3,16,h+3,7); ctx.fill();
  ctx.fillStyle='#f2e7c0'; rr(ctx,cx-8,feet-3,16,3,1.5); ctx.fill();
  ctx.fillStyle='#1f7e2e'; ctx.beginPath(); ctx.arc(cx,feet-9,2.6,0,7); ctx.fill();
  ctx.fillStyle='#7be06a'; ctx.beginPath(); ctx.arc(cx,feet-9,1.2,0,7); ctx.fill();
  const seg=[[-5,-6],[5,-6],[-5,-12],[5,-12]]; ctx.fillStyle='#1f7e2e'; for(const s of seg){ ctx.beginPath(); ctx.arc(cx+s[0],feet+s[1],1.3,0,7); ctx.fill(); }
  ctx.strokeStyle='#155a22'; ctx.lineWidth=1; rr(ctx,cx-8,feet-h-3,16,h+3,7); ctx.stroke();
}
function drawCoin(cx,cy,r,phase){ const sxv=Math.abs(Math.cos(phase));
  ctx.fillStyle='#f7c948'; ellipse(cx,cy,r*sxv+0.6,r);
  ctx.fillStyle='#ffe79a'; ellipse(cx-0.5,cy-0.5,(r-1.6)*sxv,r-1.6);
  ctx.strokeStyle='#b9780c'; ctx.lineWidth=0.8; ctx.beginPath(); ctx.ellipse(cx,cy,r*sxv+0.6,r,0,0,Math.PI*2); ctx.stroke();
  if(sxv>0.4){ ctx.fillStyle='rgba(255,255,255,0.85)'; ctx.fillRect(cx-0.5,cy-r+1.6,1,r*0.7); }
}

// ============ LEVELS ============
class Grid{
  constructor(w,h){ this.w=w; this.h=h; this.c=[]; for(let y=0;y<h;y++) this.c.push(new Array(w).fill(' ')); this.gy=h-2; }
  set(x,y,ch){ if(x<0||x>=this.w||y<0||y>=this.h) return; this.c[y][x]=ch; }
  get(x,y){ if(x<0||x>=this.w||y<0||y>=this.h) return ' '; return this.c[y][x]; }
}
function pipe(g,x,h,gy){ for(let j=0;j<h;j++){ g.set(x,gy-1-j,'P'); g.set(x+1,gy-1-j,'P'); } }
function stairUp(g,x,n,gy){ for(let i=0;i<n;i++) for(let j=0;j<=i;j++) g.set(x+i,gy-1-j,'S'); }
function stairDown(g,x,n,gy){ for(let i=0;i<n;i++) for(let j=0;j<=(n-1-i);j++) g.set(x+i,gy-1-j,'S'); }
function row(g,x,y,n,ch){ for(let i=0;i<n;i++) g.set(x+i,y,ch); }
function makeDecor(W,H,seed,themeName){
  const rng=mulberry32(seed); const clouds=[],hills=[],bushes=[],crystals=[]; const horizon=(H-2)*16;
  if(themeName!=='cave'){ const n=Math.floor(W/14); for(let i=0;i<n;i++) clouds.push({x:rng()*W*16,y:10+rng()*70,s:0.7+rng()*0.9,spd:4+rng()*9}); }
  const hn=Math.floor(W/16); for(let i=0;i<hn;i++) hills.push({x:rng()*W*16,s:0.8+rng()*1.4,y:horizon});
  const bn=Math.floor(W/12); for(let i=0;i<bn;i++) bushes.push({x:rng()*W*16,s:0.7+rng()*0.8});
  if(themeName==='cave'){ const cn=Math.floor(W/8); for(let i=0;i<cn;i++) crystals.push({x:rng()*W*16,y:18+rng()*120,s:0.5+rng()}); }
  return {clouds,hills,bushes,crystals};
}
function finalize(g,opts){
  const theme=THEMES[opts.theme]||THEMES.overworld;
  const decor=makeDecor(g.w,g.h,opts.seed||1,opts.theme);
  const gy=opts.gy!=null?opts.gy:g.gy;
  return { grid:g, theme, themeName:opts.theme, decor, time:opts.time||300, name:opts.name||'1-1',
    spawnX:(opts.spawnTX||2)*16+2, spawnFeetY:gy*16, goalX:(opts.goalTX)*16+8,
    goalGroundY:(opts.goalGroundY!=null?opts.goalGroundY:gy)*16, goalPoleTop:(opts.goalPoleTopY!=null?opts.goalPoleTopY:4)*16 };
}
function buildLevel1(){
  const W=212,H=15,gy=13; const g=new Grid(W,H); g.gy=gy;
  for(let x=0;x<W;x++){ g.set(x,gy,'X'); g.set(x,gy+1,'X'); }
  const pit=(x,w)=>{ for(let i=0;i<w;i++){ g.set(x+i,gy,' '); g.set(x+i,gy+1,' '); } };
  g.set(14,gy-1,'g');
  g.set(16,9,'?'); g.set(20,9,'!'); g.set(24,9,'?'); g.set(22,9,'B'); g.set(26,9,'B');
  row(g,30,9,3,'o');
  g.set(34,gy-1,'g');
  pit(40,3);
  pipe(g,48,2,gy);
  pipe(g,60,3,gy); g.set(60,gy-4,'c');
  g.set(72,gy-1,'k');
  stairUp(g,80,4,gy);
  pit(92,3);
  row(g,98,8,4,'B'); g.set(100,8,'?'); row(g,98,6,2,'o');
  g.set(110,gy-1,'g'); g.set(113,gy-1,'g');
  pipe(g,120,3,gy); g.set(120,gy-4,'c');
  row(g,128,9,5,'o');
  pit(138,4);
  g.set(150,gy-1,'k');
  row(g,158,8,3,'B'); g.set(160,5,'?');
  stairUp(g,180,5,gy);
  return finalize(g,{theme:'overworld',time:300,name:'1-1',spawnTX:3,gy,goalTX:198,goalGroundY:gy,goalPoleTopY:4,seed:11});
}
function buildLevel2(){
  const W=224,H=15,gy=13; const g=new Grid(W,H); g.gy=gy;
  for(let x=0;x<W;x++){ g.set(x,gy,'X'); g.set(x,gy+1,'X'); }
  const pit=(x,w)=>{ for(let i=0;i<w;i++){ g.set(x+i,gy,' '); g.set(x+i,gy+1,' '); } };
  g.set(10,9,'?'); g.set(13,9,'!');
  g.set(18,gy-1,'g'); g.set(20,gy-1,'g');
  pit(26,3);
  row(g,32,8,5,'B'); g.set(34,8,'?'); g.set(36,8,'?'); row(g,33,6,3,'o');
  pit(44,4);
  pipe(g,52,2,gy); pipe(g,60,4,gy); g.set(60,gy-5,'c');
  g.set(70,gy-1,'k'); g.set(73,gy-1,'k');
  stairUp(g,80,3,gy);
  row(g,90,7,4,'o');
  pit(96,4);
  row(g,104,4,4,'S'); g.set(106,4,'?'); row(g,104,5,2,'o'); g.set(112,gy-1,'g');
  pipe(g,118,3,gy); g.set(118,gy-4,'c');
  pit(128,5);
  row(g,136,3,9,'B'); g.set(138,5,'!');
  g.set(146,gy-1,'k');
  pit(154,4);
  stairUp(g,160,4,gy); stairDown(g,168,4,gy);
  g.set(178,gy-1,'g'); g.set(181,gy-1,'g');
  pipe(g,188,2,gy);
  stairUp(g,196,5,gy);
  return finalize(g,{theme:'overworld',time:300,name:'1-2',spawnTX:3,gy,goalTX:212,goalGroundY:gy,goalPoleTopY:4,seed:42});
}
function buildLevel3(){
  const W=204,H=15,gy=13; const g=new Grid(W,H); g.gy=gy;
  for(let x=0;x<W;x++){ g.set(x,gy,'S'); g.set(x,gy+1,'S'); g.set(x,0,'S'); g.set(x,1,'S'); }
  const pit=(x,w)=>{ for(let i=0;i<w;i++){ g.set(x+i,gy,' '); g.set(x+i,gy+1,' '); } };
  const stal=(x,len)=>{ for(let j=0;j<len;j++) g.set(x,2+j,'S'); };
  g.set(12,gy-1,'g');
  stal(16,3); stal(17,2);
  g.set(22,9,'?'); g.set(24,9,'B'); g.set(26,9,'?');
  pit(32,3);
  row(g,38,4,6,'S'); g.set(40,gy-1,'k'); row(g,39,6,2,'o');
  stal(46,4);
  pit(52,4);
  row(g,60,5,7,'S'); row(g,61,5,3,'o'); g.set(63,5,'?');
  g.set(70,gy-1,'g'); g.set(73,gy-1,'g');
  pit(80,3);
  stairUp(g,86,4,gy);
  row(g,94,7,3,'S'); g.set(96,7,'!');
  pit(104,4);
  g.set(112,gy-1,'k');
  stal(116,3); stal(118,4);
  row(g,124,5,3,'B');
  pit(132,5);
  row(g,140,4,9,'S'); g.set(142,gy-1,'g'); row(g,141,8,3,'o');
  pit(152,3);
  g.set(160,gy-1,'k');
  stairUp(g,168,4,gy);
  return finalize(g,{theme:'cave',time:320,name:'2-1',spawnTX:3,gy,goalTX:190,goalGroundY:gy,goalPoleTopY:4,seed:77});
}
const LEVELS=[buildLevel1, buildLevel2, buildLevel3];

// ============ GAME FLOW ============
function newGame(){ game.score=0; game.coins=0; game.lives=3; if(!game.player) game.player=new Player(); game.player.form='small'; game.confetti=[]; startLevel(0); }
function startLevel(idx){
  const lvl=LEVELS[idx]();
  game.levelIndex=idx; game.level=lvl; game.grid=lvl.grid; game.theme=lvl.theme;
  game.worldW=lvl.grid.w*16; game.worldH=lvl.grid.h*16;
  game.goalX=lvl.goalX; game.goalGroundY=lvl.goalGroundY; game.goalPoleTop=lvl.goalPoleTop;
  game.enemies=[]; game.items=[]; game.fireballs=[]; game.particles=[]; game.popups=[]; game.popcoins=[]; game.bumps=[];
  const g=lvl.grid;
  for(let y=0;y<g.h;y++) for(let x=0;x<g.w;x++){ const c=g.c[y][x];
    if(c==='g'){ game.enemies.push(new Stomper(x,y)); g.c[y][x]=' '; }
    else if(c==='k'){ game.enemies.push(new Shellback(x,y)); g.c[y][x]=' '; }
    else if(c==='c'){ game.enemies.push(new Chomper(x,y)); g.c[y][x]=' '; }
  }
  game.time=lvl.time; game.cleared=false; game.clearPhase=null; game.clearTimer=0; game.holdT=0; game.fanfarePlayed=false; game.deathTimer=0;
  if(!game.player) game.player=new Player();
  game.player.resetForLevel(lvl);
  game.camX=clamp(game.player.x-camW*0.4,0,Math.max(0,game.worldW-camW));
  const cyMin=Math.min(0,game.worldH-camH), cyMax=Math.max(0,game.worldH-camH);
  game.camY=clamp(game.player.y-camH*0.55,cyMin,cyMax);
  game.state='playing'; duckMusic(1);
}
function nextLevel(){ const ni=game.levelIndex+1; if(ni>=LEVELS.length){ game.state='win'; duckMusic(0); sfxWin(); } else { startLevel(ni); } }
function startClear(){ game.state='levelclear'; game.cleared=true; game.clearPhase='slide'; const p=game.player; p.onPole=true; p.x=game.goalX-p.w/2; p.vx=0; p.vy=0; game.fanfarePlayed=false; game.holdT=0; duckMusic(0); sfxFlag(); }
function updateClear(dt){
  const p=game.player;
  if(game.clearPhase==='slide'){ p.onPole=true; p.vx=0; p.facing=-1; p.y+=1.8; const baseY=game.goalGroundY; if(p.y+p.h>=baseY){ p.y=baseY-p.h; game.clearPhase='pause'; game.clearTimer=0.5; sfxFlagDn(); } }
  else if(game.clearPhase==='pause'){ game.clearTimer-=dt; if(game.clearTimer<=0) game.clearPhase='walk'; }
  else if(game.clearPhase==='walk'){ p.onPole=false; p.facing=1; p.vx=1.5; p.vy+=GRAVITY; p._hitL=p._hitR=p._hitD=false; p.onGround=false; collideX(p); collideY(p,false); p.walkPhase+=Math.abs(p.vx)*dt*9; if(p.x>game.goalX+64){ game.clearPhase='tally'; game.clearTimer=0; if(!game.fanfarePlayed){ sfxClear(); game.fanfarePlayed=true; } } }
  else if(game.clearPhase==='tally'){ game.clearTimer+=dt; if(game.time>0){ if(game.clearTimer>0.02){ game.clearTimer=0; const dec=Math.min(game.time,3); game.time-=dec; addScore(Math.round(dec*50)); sfxTick(); } } else { game.holdT+=dt; if(game.holdT>1.3){ game.holdT=0; nextLevel(); } } }
}
function updateDying(dt){ const p=game.player; p.vy+=GRAVITY; if(p.vy>9)p.vy=9; p.y+=p.vy; game.deathTimer-=dt; if(game.deathTimer<=0){ if(game.lives<0){ game.state='gameover'; duckMusic(0); } else { p.form='small'; startLevel(game.levelIndex); } } }
function doStompBounce(){ const p=game.player; p.vy=input.jump?-5.7:-3.8; p.onGround=false; p.jumping=true; sfxStomp(); spawnPuff(p.x+p.w/2,p.y+p.h); }
function stompReward(e){ const SC=[100,200,400,800,1000,2000,4000,8000]; const idx=Math.min(game.player.combo,SC.length-1); const val=SC[idx]; game.player.combo++; if(game.player.combo>=SC.length){ game.lives++; sfx1up(); popupWorld(e.x,e.y-6,'1UP','#fff'); } else { addScore(val); popupWorld(e.x,e.y-6,''+val); } }
function resolvePlayerEnemies(){
  const p=game.player; if(p.dead) return;
  for(const e of game.enemies){ if(e.dead||(e.squash&&e.squash>0)) continue; if(!aabb(p,e)) continue;
    const fromAbove = p.vy>0.5 && (p.y+p.h)-e.y < e.h*0.7;
    if(e.type==='stomper'){ if(fromAbove){ e.stomp(); doStompBounce(); stompReward(e); } else { p.hurt(); if(p.dead) return; } }
    else if(e.type==='shellback'){
      if(e.state==='walk'){ if(fromAbove){ e.toShell(); doStompBounce(); stompReward(e); } else { p.hurt(); if(p.dead) return; } }
      else if(e.state==='shell'){ const d=(p.x+p.w/2<e.x+e.w/2)?1:-1; if(fromAbove){ e.kick(d); doStompBounce(); } else { e.kick(d); if(d>0)e.x=p.x+p.w+1; else e.x=p.x-e.w-1; } }
      else { if(fromAbove){ e.state='shell'; e.vx=0; e.wake=0; doStompBounce(); } else if(e.noHit<=0){ p.hurt(); if(p.dead) return; } }
    }
    else if(e.type==='chomper'){ if(e.up>0.35){ p.hurt(); if(p.dead) return; } }
  }
}
function updateCamera(){
  const p=game.player;
  const tx=p.x+p.w/2-camW*0.45;
  game.camX=lerp(game.camX,tx,0.12); game.camX=clamp(game.camX,0,Math.max(0,game.worldW-camW));
  const ty=p.y+p.h/2-camH*0.55;
  const cyMin=Math.min(0,game.worldH-camH), cyMax=Math.max(0,game.worldH-camH);
  game.camY=lerp(game.camY,ty,0.12); game.camY=clamp(game.camY,cyMin,cyMax);
}
function collectCoins(p){
  const x0=Math.floor(p.x/16),x1=Math.floor((p.x+p.w-1)/16),y0=Math.floor(p.y/16),y1=Math.floor((p.y+p.h-1)/16);
  for(let ty=y0;ty<=y1;ty++) for(let tx=x0;tx<=x1;tx++){ if(gget(tx,ty)==='o'){ gset(tx,ty,' '); addCoin(1); addScore(100); sfxCoin(); spawnSpark(tx*16+8,ty*16+8,'#ffe79a'); } }
}
function cull(){ game.enemies=game.enemies.filter(e=>!e.dead); game.items=game.items.filter(e=>!e.dead); game.fireballs=game.fireballs.filter(e=>!e.dead); }
function updateParticlesOnly(dt){ for(const p of game.particles)p.update(dt); game.particles=game.particles.filter(p=>!p.dead); for(const p of game.popups)p.update(dt); game.popups=game.popups.filter(p=>!p.dead); for(const p of game.popcoins)p.update(dt); game.popcoins=game.popcoins.filter(p=>!p.dead); }
function updatePlaying(dt){
  const p=game.player;
  if(edge.pause||edge.start){ game.state='paused'; duckMusic(0); sfxPause(); return; }
  game.time-=dt*2.4; if(game.time<0)game.time=0;
  if(game.time<=0 && !p.dead){ p.die(); return; }
  p.update(dt);
  if(game.state!=='playing') return;
  for(const it of game.items){ it.update(dt); if(it.dead) continue; if(aabb(p,it)){ if(it.type==='mushroom'){ if(p.form==='small') p.grow(); addScore(1000); popupWorld(it.x,it.y-4,'1000'); it.dead=true; } else if(it.type==='flower'){ p.toFire(); addScore(1000); popupWorld(it.x,it.y-4,'1000'); it.dead=true; } } }
  for(const e of game.enemies) e.update(dt);
  for(const e of game.enemies){ if(e.dead)continue; if(e.type==='shellback'&&e.state==='slide'){ for(const o of game.enemies){ if(o===e||o.dead||(o.squash&&o.squash>0)||o.type==='chomper')continue; if(aabb(e,o)){ killEnemy(o); addScore(200); popupWorld(o.x,o.y-4,'200'); sfxKick(); } } } }
  resolvePlayerEnemies();
  if(game.state!=='playing') return;
  for(const fb of game.fireballs){ fb.update(dt); if(fb.dead)continue; for(const e of game.enemies){ if(e.dead||(e.squash&&e.squash>0))continue; if(e.type==='chomper'){ if(e.up>0.1&&aabb(fb,e)){ e.dead=true; spawnPuff(e.centerX,e.y+e.h/2); addScore(200); popupWorld(e.x,e.y-4,'200'); fb.dead=true; spawnSpark(fb.x,fb.y,'#ffae3a'); sfxStomp(); break; } } else { if(aabb(fb,e)){ killEnemy(e); addScore(100); popupWorld(e.x,e.y-4,'100'); fb.dead=true; spawnSpark(fb.x,fb.y,'#ffae3a'); break; } } } }
  collectCoins(p);
  for(const b of game.bumps) b.t+=dt; game.bumps=game.bumps.filter(b=>b.t<b.dur);
  updateParticlesOnly(dt);
  updateCamera();
  if(!game.cleared && (p.x+p.w/2)>=game.goalX) startClear();
  cull();
}
function updateMenu(dt){
  if(edge.start||edge.jump||game.oneShotStart){ game.oneShotStart=false; newGame(); return; }
  game.oneShotStart=false;
  if(game.state==='win'){
    if(game.confetti.length<80 && Math.random()<0.5){ const cols=['#ff5d5d','#ffd23a','#5fd24a','#5db4ff','#ff8a3a']; game.confetti.push(new Particle(rand(0,canvas.width), -10, rand(-0.6,0.6), rand(1,3), {type:'confetti', size:rand(4,7), life:rand(2.5,4), g:0.05, color:cols[Math.floor(rand(0,5))], rotv:rand(-0.3,0.3)})); }
    for(const c of game.confetti) c.update(dt); game.confetti=game.confetti.filter(c=>!c.dead && c.y<canvas.height+20);
  }
}
function update(dt){
  inputBegin();
  if(game.state==='title'||game.state==='gameover'||game.state==='win') updateMenu(dt);
  else if(game.state==='paused'){ if(edge.pause||edge.start){ game.state='playing'; duckMusic(1); sfxPause(); } }
  else if(game.state==='playing') updatePlaying(dt);
  else if(game.state==='dying'){ updateDying(dt); updateParticlesOnly(dt); }
  else if(game.state==='levelclear'){ updateClear(dt); updateParticlesOnly(dt); }
  inputEnd();
}

// ============ RENDER ============
function resize(){
  const cssW=stage.clientWidth||640, cssH=stage.clientHeight||360;
  const dpr=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.max(1,Math.round(cssW*dpr)); canvas.height=Math.max(1,Math.round(cssH*dpr));
  const aspect=cssW/cssH;
  camW=clamp(BASE_VIEW_H*aspect,320,640); camH=camW/aspect; scale=canvas.width/camW;
  ctx.imageSmoothingEnabled=true;
}
window.addEventListener('resize',resize);
window.addEventListener('orientationchange',()=>setTimeout(resize,200));
if(window.ResizeObserver){ new ResizeObserver(resize).observe(stage); }
function worldTransform(f){ ctx.setTransform(scale,0,0,scale,0,0); ctx.translate(-game.camX*f,-game.camY); }
function drawSky(th){
  const g=ctx.createLinearGradient(0,0,0,canvas.height); g.addColorStop(0,th.skyTop); g.addColorStop(1,th.skyBot); ctx.fillStyle=g; ctx.fillRect(0,0,canvas.width,canvas.height);
  if(!th.cave){ const sg=ctx.createRadialGradient(canvas.width*0.2,canvas.height*0.12,8,canvas.width*0.2,canvas.height*0.12,canvas.width*0.4); sg.addColorStop(0,'rgba(255,250,200,0.8)'); sg.addColorStop(1,'rgba(255,250,200,0)'); ctx.fillStyle=sg; ctx.fillRect(0,0,canvas.width,canvas.height); }
  else { const vg=ctx.createRadialGradient(canvas.width/2,canvas.height/2,canvas.height*0.2,canvas.width/2,canvas.height/2,canvas.height*0.85); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,0.45)'); ctx.fillStyle=vg; ctx.fillRect(0,0,canvas.width,canvas.height); }
}
function drawHills(th){ const f=0.55, left=game.camX*f-80, right=game.camX*f+camW+80;
  for(const h of game.level.decor.hills){ if(h.x<left||h.x>right) continue; const w=60*h.s,hh=34*h.s;
    ctx.fillStyle=th.hill; ctx.beginPath(); ctx.moveTo(h.x-w/2,h.y); ctx.quadraticCurveTo(h.x,h.y-hh,h.x+w/2,h.y); ctx.closePath(); ctx.fill();
    ctx.fillStyle=th.hillDark; ctx.beginPath(); ctx.moveTo(h.x-w/2,h.y); ctx.quadraticCurveTo(h.x,h.y-hh*0.45,h.x+w/2,h.y); ctx.closePath(); ctx.fill(); }
}
function drawCloud(x,y,s){ ctx.fillStyle='rgba(255,255,255,0.92)'; const r=8*s; ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.arc(x+r,y+2,r*0.8,0,7); ctx.arc(x-r,y+2,r*0.8,0,7); ctx.arc(x+r*1.7,y+4,r*0.6,0,7); ctx.arc(x-r*1.7,y+4,r*0.6,0,7); ctx.fill(); ctx.fillRect(x-r*2,y+3,r*4,r*0.8); }
function drawClouds(th){ const f=0.35, left=game.camX*f-140, right=game.camX*f+camW+140;
  if(th.cave){ for(const c of game.level.decor.crystals){ if(c.x<left||c.x>right)continue; ctx.save(); ctx.globalAlpha=0.5; ctx.fillStyle='#6f9bd8'; ctx.translate(c.x,c.y); const s=4*c.s; ctx.beginPath(); ctx.moveTo(0,-s*1.6); ctx.lineTo(s*0.7,0); ctx.lineTo(0,s*1.6); ctx.lineTo(-s*0.7,0); ctx.closePath(); ctx.fill(); ctx.restore(); } return; }
  for(const c of game.level.decor.clouds){ let x=(c.x+animClock*c.spd)%game.worldW; if(x<0)x+=game.worldW; if(x<left||x>right)continue; drawCloud(x,c.y,c.s); }
}
function drawBush(x,y,s,th){ ctx.fillStyle=th.bush; ellipse(x,y-5*s,7*s,6*s); ellipse(x-7*s,y-3*s,6*s,5*s); ellipse(x+7*s,y-3*s,6*s,5*s); ctx.fillStyle=th.bushLight; ellipse(x-1*s,y-7*s,3*s,2.4*s); }
function drawBushes(th){ const left=game.camX-40, right=game.camX+camW+40, gyTile=game.grid.h-2;
  for(const b of game.level.decor.bushes){ if(b.x<left||b.x>right)continue; const tx=Math.floor(b.x/16); if(!solidTile(tx,gyTile))continue; drawBush(b.x,gyTile*16,b.s,th); }
}
function drawTiles(th){
  const x0=Math.max(0,Math.floor(game.camX/16)-1), x1=Math.min(game.grid.w-1,Math.floor((game.camX+camW)/16)+1);
  const y0=Math.max(0,Math.floor(game.camY/16)-1), y1=Math.min(game.grid.h-1,Math.floor((game.camY+camH)/16)+1);
  for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++){ const c=game.grid.c[y][x]; if(c===' '||c==='g'||c==='k'||c==='c') continue; drawTile(c,x,y,th); }
}
function drawTile(c,tx,ty,th){ const x=tx*16, y=ty*16-bumpOffset(tx,ty);
  switch(c){
    case 'X': drawGround(x,y,tx,ty,th); break;
    case 'S': drawStone(x,y,th); break;
    case 'B': drawBrick(x,y,th); break;
    case 'U': drawUsed(x,y,th); break;
    case '?': case '!': drawQuestion(x,y); break;
    case 'P': drawPipe(x,y,tx,ty); break;
    case 'o': drawCoinTile(tx,ty); break;
  }
}
function drawGround(x,y,tx,ty,th){ const exposed=!solidTile(tx,ty-1);
  ctx.fillStyle=th.soil; ctx.fillRect(x,y,16,16);
  ctx.fillStyle=th.soilDark; ctx.fillRect(x,y+13,16,3);
  ctx.fillStyle=th.soilEdge; ctx.fillRect(x+3,y+8,2,2); ctx.fillRect(x+10,y+10,2,2); ctx.fillRect(x+7,y+4,2,2);
  if(exposed){ ctx.fillStyle=th.grass; ctx.fillRect(x,y,16,6); ctx.fillStyle=th.grassDark; ctx.fillRect(x,y+5,16,2); ctx.fillStyle=th.grass; ctx.fillRect(x+1,y-1,3,2); ctx.fillRect(x+7,y-1,3,2); ctx.fillRect(x+12,y-1,3,2); }
  ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(x,y,2,16); ctx.fillStyle='rgba(0,0,0,0.12)'; ctx.fillRect(x+14,y,2,16);
}
function drawStone(x,y,th){ ctx.fillStyle=th.stone; ctx.fillRect(x,y,16,16); ctx.fillStyle='rgba(255,255,255,0.12)'; ctx.fillRect(x,y,16,2); ctx.fillRect(x,y,2,16); ctx.fillStyle='rgba(0,0,0,0.18)'; ctx.fillRect(x,y+14,16,2); ctx.fillRect(x+14,y,2,16); ctx.strokeStyle='rgba(0,0,0,0.15)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x+4,y+5); ctx.lineTo(x+8,y+9); ctx.stroke(); }
function drawBrick(x,y,th){ ctx.fillStyle=th.brick; ctx.fillRect(x,y,16,16); ctx.fillStyle=th.brickLine; ctx.fillRect(x,y,16,1); ctx.fillRect(x,y+8,16,1); ctx.fillRect(x+8,y+1,1,7); ctx.fillRect(x+4,y+9,1,7); ctx.fillRect(x+12,y+9,1,7); ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.fillRect(x,y+1,16,1); ctx.fillStyle='rgba(0,0,0,0.12)'; ctx.fillRect(x,y+15,16,1); }
function drawUsed(x,y,th){ ctx.fillStyle=th.used; ctx.fillRect(x,y,16,16); ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.fillRect(x,y,16,2); ctx.fillRect(x,y,2,16); ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(x,y+14,16,2); ctx.fillRect(x+14,y,2,16); ctx.fillStyle=th.usedDark; ctx.fillRect(x+2,y+2,2,2); ctx.fillRect(x+12,y+2,2,2); ctx.fillRect(x+2,y+12,2,2); ctx.fillRect(x+12,y+12,2,2); }
function drawQuestion(x,y){ ctx.fillStyle='#f2b21a'; ctx.fillRect(x,y,16,16); ctx.fillStyle='#ffd34d'; ctx.fillRect(x,y,16,2); ctx.fillRect(x,y,2,16); ctx.fillStyle='#b9780c'; ctx.fillRect(x,y+14,16,2); ctx.fillRect(x+14,y,2,16); ctx.fillStyle='#7a4e06'; ctx.fillRect(x+2,y+2,1.5,1.5); ctx.fillRect(x+12.5,y+2,1.5,1.5); ctx.fillRect(x+2,y+12.5,1.5,1.5); ctx.fillRect(x+12.5,y+12.5,1.5,1.5); const pulse=0.55+0.45*Math.sin(animClock*4+(x+y)*0.1); ctx.fillStyle='#7a4e06'; ctx.font='10px "Press Start 2P", monospace'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.save(); ctx.globalAlpha=pulse; ctx.fillText('?',x+8,y+9); ctx.restore(); }
function drawPipe(x,y,tx,ty){ const isTop=gget(tx,ty-1)!=='P', isLeft=gget(tx-1,ty)!=='P'; const green='#39b54a',dark='#1f7e2e',light='#7be06a';
  ctx.fillStyle=green; ctx.fillRect(x,y,16,16);
  if(isLeft){ ctx.fillStyle=light; ctx.fillRect(x+2,y,3,16); ctx.fillStyle=dark; ctx.fillRect(x,y,1,16); }
  if(gget(tx+1,ty)!=='P'){ ctx.fillStyle=dark; ctx.fillRect(x+15,y,1,16); }
  ctx.fillStyle=dark; ctx.fillRect(x+(isLeft?13:14),y,2,16);
  if(isTop){ const lx=isLeft?x-2:x, lw=18; ctx.fillStyle=green; ctx.fillRect(lx,y,lw,6); ctx.fillStyle=light; ctx.fillRect(lx+1,y+1,lw-2,1); ctx.fillStyle=dark; ctx.fillRect(lx,y+5,lw,1); ctx.fillRect(lx,y,1,6); ctx.fillRect(lx+lw-1,y,1,6); }
}
function drawCoinTile(tx,ty){ const cx=tx*16+8, cy=ty*16+8+Math.sin(animClock*3+tx)*1.5; drawCoin(cx,cy,5,animClock*5+tx); }
function drawGoal(th){ const px=game.goalX, baseY=game.goalGroundY, topY=game.goalPoleTop;
  ctx.fillStyle='#cfcfd6'; ctx.fillRect(px-8,baseY,16,16); ctx.fillStyle='#9aa0aa'; ctx.fillRect(px-8,baseY+13,16,3);
  ctx.fillStyle='#9aa0aa'; ctx.fillRect(px-1.5,topY,3,baseY-topY); ctx.fillStyle='#d6dae0'; ctx.fillRect(px-1.5,topY,1,baseY-topY);
  ctx.fillStyle='#ffd24d'; ctx.beginPath(); ctx.arc(px,topY-2,4,0,7); ctx.fill(); ctx.strokeStyle='#b9780c'; ctx.lineWidth=1; ctx.stroke();
  const fy = (game.cleared && game.clearPhase==='slide') ? clamp(game.player.y, topY+4, baseY-12) : topY+8;
  const wav=Math.sin(animClock*6)*2; ctx.fillStyle='#ff4d4d'; ctx.beginPath(); ctx.moveTo(px+2,fy); ctx.lineTo(px+18+wav,fy+5); ctx.lineTo(px+2,fy+10); ctx.closePath(); ctx.fill(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(px+8,fy+5,1.8,0,7); ctx.fill();
  drawCastle(px+44,baseY,th);
}
function drawCastle(x,baseY,th){ const w=48,h=44, y=baseY-h+16; ctx.fillStyle='#c9b89a'; ctx.fillRect(x,y,w,h); ctx.fillStyle='#b0a084'; for(let i=0;i<w;i+=8) ctx.fillRect(x+i,y-4,5,5);
  ctx.fillStyle='#7a5a3a'; ctx.beginPath(); ctx.moveTo(x+w/2-7,baseY+16); ctx.lineTo(x+w/2-7,y+18); ctx.arc(x+w/2,y+18,7,Math.PI,0); ctx.lineTo(x+w/2+7,baseY+16); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#9a8a6a'; ctx.fillRect(x+6,y+8,6,8); ctx.fillRect(x+w-12,y+8,6,8);
  ctx.fillStyle='#3aa33a'; ctx.fillRect(x+w/2-0.5,y-18,1,12); ctx.fillStyle='#ff4d4d'; ctx.beginPath(); ctx.moveTo(x+w/2,y-18); ctx.lineTo(x+w/2+8,y-15); ctx.lineTo(x+w/2,y-12); ctx.closePath(); ctx.fill();
}
function pad6(n){ n=Math.max(0,Math.floor(n)); return n.toString().padStart(6,'0'); }
function drawCoinHUD(x,y,r){ const sxv=Math.abs(Math.cos(animClock*4)); ctx.fillStyle='#f7c948'; ellipse(x,y,r*sxv+0.6,r); ctx.fillStyle='#ffe79a'; ellipse(x-0.4,y-0.4,(r-1)*sxv,r-1); }
function drawLifeHUD(x,y,r){ ctx.fillStyle='#ff9a3c'; rr(ctx,x-r*0.8,y-r,r*1.6,r*1.8,r*0.7); ctx.fill(); ctx.fillStyle='#fff'; ellipse(x-r*0.32,y-r*0.1,r*0.22,r*0.28); ellipse(x+r*0.32,y-r*0.1,r*0.22,r*0.28); ctx.fillStyle='#2a1810'; ellipse(x-r*0.3,y-r*0.05,r*0.1,r*0.13); ellipse(x+r*0.34,y-r*0.05,r*0.1,r*0.13); ctx.fillStyle='#5fd24a'; ctx.fillRect(x-0.5,y-r*1.4,1,r*0.5); }
function drawHUD(){
  const h=canvas.height, pad=Math.round(h*0.026), fs=Math.max(9,Math.round(h*0.03));
  ctx.font=fs+'px "Press Start 2P", monospace'; ctx.textBaseline='top';
  function txt(s,x,y,al){ ctx.textAlign=al||'left'; ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillText(s,x+1,y+1); ctx.fillStyle='#fff'; ctx.fillText(s,x,y); }
  txt('SCORE '+pad6(game.score), pad, pad, 'left');
  const cy=pad+fs*1.5;
  drawCoinHUD(pad+fs*0.45, cy+fs*0.45, fs*0.42); txt('\u00d7'+game.coins.toString().padStart(2,'0'), pad+fs*1.1, cy, 'left');
  drawLifeHUD(pad+fs*4.7, cy+fs*0.5, fs*0.5); txt('\u00d7'+(game.lives<0?0:game.lives), pad+fs*5.4, cy, 'left');
  txt('WORLD '+(game.level?game.level.name:'1-1'), canvas.width/2, pad, 'center');
  txt('TIME '+Math.ceil(game.time).toString().padStart(3,'0'), canvas.width-pad, pad, 'right');
}
function dim(a){ ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle='rgba(8,12,30,'+a+')'; ctx.fillRect(0,0,canvas.width,canvas.height); }
function centerText(s,y,size,color,shadow){ ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font=size+'px "Press Start 2P", monospace'; if(shadow){ ctx.fillStyle=shadow; ctx.fillText(s,canvas.width/2+2,y+2); } ctx.fillStyle=color; ctx.fillText(s,canvas.width/2,y); }
function drawPause(){ dim(0.5); const H=canvas.height; centerText('PAUSE',H*0.42,Math.round(H*0.08),'#ffd23a','#7a4e06'); ctx.font=Math.round(H*0.028)+'px "Press Start 2P","Hiragino Maru Gothic ProN",sans-serif'; ctx.fillStyle='#cfe0ff'; ctx.textAlign='center'; ctx.fillText('P / ENTER で再開',canvas.width/2,H*0.56); }
function drawGameOver(){ dim(0.62); const H=canvas.height; centerText('GAME OVER',H*0.4,Math.round(H*0.075),'#ff5d5d','#5a1010'); centerText('SCORE '+pad6(game.score),H*0.54,Math.round(H*0.036),'#fff','#000'); ctx.font=Math.round(H*0.026)+'px "Press Start 2P","Hiragino Maru Gothic ProN",sans-serif'; ctx.fillStyle='#cfe0ff'; ctx.textAlign='center'; if(Math.floor(animClock*2)%2===0) ctx.fillText('ENTER / タップ でリスタート',canvas.width/2,H*0.66); }
function drawWin(){ dim(0.5); for(const c of game.confetti) c.draw(); const H=canvas.height; const by=H*0.4+Math.sin(animClock*3)*6; centerText('YOU WIN!',by,Math.round(H*0.085),'#ffd23a','#b9780c'); ctx.font=Math.round(H*0.034)+'px "Press Start 2P","Hiragino Maru Gothic ProN",sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#000'; ctx.fillText('クリアおめでとう！',canvas.width/2+1,H*0.55+1); ctx.fillStyle='#fff'; ctx.fillText('クリアおめでとう！',canvas.width/2,H*0.55); centerText('SCORE '+pad6(game.score),H*0.64,Math.round(H*0.03),'#bfe9ff','#000'); ctx.font=Math.round(H*0.024)+'px "Press Start 2P","Hiragino Maru Gothic ProN",sans-serif'; ctx.fillStyle='#cfe0ff'; if(Math.floor(animClock*2)%2===0) ctx.fillText('ENTER / タップ でもう一度',canvas.width/2,H*0.74); }
function drawClearOverlay(){ const H=canvas.height; ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle='rgba(8,12,30,0.28)'; ctx.fillRect(0,0,canvas.width,canvas.height); const by=H*0.36+Math.sin(animClock*4)*5; centerText('COURSE CLEAR!',by,Math.round(H*0.06),'#ffd23a','#b9780c'); if(game.clearPhase==='tally'){ ctx.font=Math.round(H*0.028)+'px "Press Start 2P","Hiragino Maru Gothic ProN",sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#000'; ctx.fillText('タイム ボーナス',canvas.width/2+1,H*0.5+1); ctx.fillStyle='#fff'; ctx.fillText('タイム ボーナス',canvas.width/2,H*0.5); } }
function drawTitle(){
  const W=canvas.width,H=canvas.height,t=animClock;
  ctx.fillStyle='rgba(255,255,255,0.92)'; for(let i=0;i<4;i++){ const x=((i*0.27+t*0.012)%1)*W, y=H*(0.12+i*0.07), r=H*0.03; ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.arc(x+r,y+r*0.3,r*0.8,0,7); ctx.arc(x-r,y+r*0.3,r*0.8,0,7); ctx.fill(); ctx.fillRect(x-r*2,y+r*0.4,r*4,r*0.8); }
  const groundY=H*0.82, gH=H-groundY;
  ctx.fillStyle='#3aa336'; for(let i=0;i<3;i++){ const hx=W*(0.2+i*0.32), w=W*0.3, hh=H*0.12; ctx.beginPath(); ctx.moveTo(hx-w/2,groundY); ctx.quadraticCurveTo(hx,groundY-hh,hx+w/2,groundY); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle='#c8743a'; ctx.fillRect(0,groundY,W,gH); ctx.fillStyle='#5fc24a'; ctx.fillRect(0,groundY,W,gH*0.3); ctx.fillStyle='#3aa336'; ctx.fillRect(0,groundY+gH*0.28,W,3);
  for(let i=0;i<3;i++){ const cx=W*(0.3+i*0.2), cy=groundY-H*0.18+Math.sin(t*3+i)*6; drawCoin(cx,cy,H*0.018,t*4+i); }
  const hop=Math.max(0,Math.sin(t*2.2))*H*0.07, feet=groundY-hop, m=Math.floor(t/3)%3, form=m===2?'fire':(m===1?'big':'small');
  drawCreature(W*0.5, feet, H*0.12, form, {facing:1, onGround:hop<1.5, vy:hop>0?-1:0, walkPhase:t*5, blink:(t%3>2.85)});
  const title="BRAMBLE'S DASH", ts=Math.min(W*0.07,H*0.115); ctx.font=ts+'px "Press Start 2P", monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
  const ly=H*0.3+Math.sin(t*2)*4;
  ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillText(title,W/2+3,ly+4);
  const grd=ctx.createLinearGradient(0,ly-ts/2,0,ly+ts/2); grd.addColorStop(0,'#ffe27a'); grd.addColorStop(1,'#ff9a2a'); ctx.fillStyle=grd; ctx.fillText(title,W/2,ly);
  ctx.lineWidth=Math.max(1,ts*0.06); ctx.strokeStyle='#7a4e06'; ctx.strokeText(title,W/2,ly);
  ctx.font=(ts*0.34)+'px "Press Start 2P","Hiragino Maru Gothic ProN",sans-serif'; ctx.fillStyle='#fff'; ctx.fillText('ブランブルのぼうけん',W/2,ly+ts*0.95);
  if(Math.floor(t*2)%2===0){ ctx.font=(ts*0.3)+'px "Press Start 2P","Hiragino Maru Gothic ProN",sans-serif'; ctx.fillStyle='#fff'; ctx.fillText('PRESS ENTER  /  タップでスタート',W/2,H*0.66); }
  ctx.font=(ts*0.24)+'px "Hiragino Maru Gothic ProN",sans-serif'; ctx.fillStyle='rgba(255,255,255,0.85)'; ctx.fillText('\u2190 \u2192 移動  \u30fb  SPACE ジャンプ  \u30fb  X ダッシュ/ファイア',W/2,H*0.74);
}
function render(){
  ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,canvas.width,canvas.height);
  const th = game.theme || THEMES.overworld;
  drawSky(th);
  if(game.state==='title' || !game.grid){ drawTitle(); return; }
  worldTransform(0.55); drawHills(th);
  worldTransform(0.35); drawClouds(th);
  worldTransform(1); drawBushes(th); drawTiles(th); drawGoal(th);
  for(const it of game.items) it.draw();
  for(const e of game.enemies) e.draw();
  for(const f of game.fireballs) f.draw();
  for(const p of game.particles) p.draw();
  if(game.player) game.player.draw();
  for(const pc of game.popcoins) pc.draw();
  for(const pu of game.popups) pu.draw();
  ctx.setTransform(1,0,0,1,0,0); drawHUD();
  if(game.state==='paused') drawPause();
  else if(game.state==='levelclear') drawClearOverlay();
  else if(game.state==='gameover') drawGameOver();
  else if(game.state==='win') drawWin();
}
function frame(t){ if(!last) last=t; let dt=(t-last)/1000; last=t; if(dt>0.1)dt=0.1; animClock+=dt; acc+=dt; let steps=0; while(acc>=STEP && steps<5){ update(STEP); acc-=STEP; steps++; } if(acc>STEP) acc=0; render(); requestAnimationFrame(frame); }
resize();
requestAnimationFrame(frame);
})();
</script>
</body>
</html>
