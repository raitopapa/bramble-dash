import { BASE_VIEW_H } from '../core/constants.js';
import { clamp } from '../core/utils.js';
import { game } from '../game/state.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const stage = document.getElementById('stage');
let camW = 412, camH = BASE_VIEW_H, scale = 2;

function rr(c,x,y,w,h,r){ r=Math.min(r,w/2,h/2); c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
function ellipse(x,y,rx,ry){ ctx.beginPath(); ctx.ellipse(x,y,Math.max(0.1,rx),Math.max(0.1,ry),0,0,Math.PI*2); ctx.fill(); }

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

export { camH, camW, canvas, ctx, ellipse, resize, rr, scale, stage, worldTransform };
