import { initAudioOnce, toggleMute } from './engine/audio.js';
import { canvas, resize, stage } from './engine/canvas.js';
import { startLoop } from './engine/loop.js';
import { game } from './game/state.js';
import { loadProgress } from './game/flow.js';
import { scenes } from './scenes/SceneManager.js';

canvas.addEventListener('pointerdown', ()=>{ initAudioOnce(); if(game.state==='title'||game.state==='gameover'||game.state==='win'){ game.oneShotStart=true; } });
document.getElementById('muteBtn').addEventListener('click', toggleMute);
document.getElementById('fsBtn').addEventListener('click', ()=>{
  if(!document.fullscreenElement){ const f=stage.requestFullscreen||stage.webkitRequestFullscreen; if(f) f.call(stage); }
  else if(document.exitFullscreen) document.exitFullscreen();
});

loadProgress();
scenes.set('title');
resize();
startLoop();
