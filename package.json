import { initAudioOnce, toggleMute } from '../engine/audio.js';

// ============ INPUT ============
const input = { left:false,right:false,down:false,jump:false,fire:false,start:false,pause:false };
const prevIn = { left:false,right:false,down:false,jump:false,fire:false,start:false,pause:false };
const edge = { left:false,right:false,down:false,jump:false,fire:false,start:false,pause:false };
function inputBegin(){ edge.left=input.left&&!prevIn.left; edge.right=input.right&&!prevIn.right; edge.down=input.down&&!prevIn.down; edge.jump=input.jump&&!prevIn.jump; edge.fire=input.fire&&!prevIn.fire; edge.start=input.start&&!prevIn.start; edge.pause=input.pause&&!prevIn.pause; }
function inputEnd(){ prevIn.left=input.left; prevIn.right=input.right; prevIn.down=input.down; prevIn.jump=input.jump; prevIn.fire=input.fire; prevIn.start=input.start; prevIn.pause=input.pause; }

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

export { bindBtn, edge, input, inputBegin, inputEnd, prevIn };
