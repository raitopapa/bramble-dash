import { duckMusic, initAudioOnce, sfxPause, toggleMute } from './engine/audio.js';
import { canvas, resize, stage } from './engine/canvas.js';
import { startLoop } from './engine/loop.js';
import { game } from './game/state.js';
import { loadProgress, returnToMap } from './game/flow.js';
import { scenes } from './scenes/SceneManager.js';

function openPause(){ if(game.state==='playing'){ game.state='paused'; game.pauseSel=0; game.pauseConfirm=false; duckMusic(0); sfxPause(); } }
function resumePlay(){ game.state='playing'; game.pauseConfirm=false; duckMusic(1); sfxPause(); }
function doPauseAct(act){
  if(act==='resume') resumePlay();
  else if(act==='retire'){ game.pauseConfirm=true; game.confirmSel=1; sfxPause(); }
  else if(act==='confirm-yes') returnToMap();
  else if(act==='confirm-no'){ game.pauseConfirm=false; sfxPause(); }
}

canvas.addEventListener('pointerdown', (e)=>{
  initAudioOnce();
  if(game.state==='title'||game.state==='gameover'||game.state==='win'){ game.oneShotStart=true; return; }
  // tappable pause menu
  if(game.state==='paused' && game._pauseHit){
    const r=canvas.getBoundingClientRect();
    const sx=canvas.width/(r.width||1), sy=canvas.height/(r.height||1);
    const px=(e.clientX-r.left)*sx, py=(e.clientY-r.top)*sy;
    for(const h of game._pauseHit){ if(px>=h.x&&px<=h.x+h.w&&py>=h.y&&py<=h.y+h.h){ doPauseAct(h.act); break; } }
  }
});
document.getElementById('muteBtn').addEventListener('click', ()=>{ initAudioOnce(); toggleMute(); });
const pauseBtn=document.getElementById('pauseBtn');
if(pauseBtn) pauseBtn.addEventListener('click', ()=>{ initAudioOnce(); if(game.state==='playing') openPause(); else if(game.state==='paused') resumePlay(); });
document.getElementById('fsBtn').addEventListener('click', ()=>{
  if(!document.fullscreenElement){ const f=stage.requestFullscreen||stage.webkitRequestFullscreen; if(f) f.call(stage); }
  else if(document.exitFullscreen) document.exitFullscreen();
});

loadProgress();
scenes.set('title');
resize();
startLoop();
