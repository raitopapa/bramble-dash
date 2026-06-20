import { ctx, ellipse, rr } from '../engine/canvas.js';
import { game } from '../game/state.js';
import { SKINS } from '../core/constants.js';

// ============ CREATURE / SHARED DRAW ============
let cFlash=0, cWing=0; const RBOW=['#ff5d5d','#ffae3a','#ffe24d','#5fd24a','#42c6ff','#9a72ff','#ff6bd6'];
function drawCreature(cx, feet, size, form, o){
  o=o||{}; const facing=o.facing||1; const big=form!=='small'; const fire=form==='fire';
  const C = fire ? {body:'#ff6a4d',top:'#ff9e80',shade:'#d8392e',belly:'#ffe1d6',spr:'#ffd23a',spr2:'#ff8a2a',out:'#9e2a20',eye:'#2a1410',cheek:'#ff7a6a',foot:'#c8322a'}
                 : {body:'#ff9a3c',top:'#ffc488',shade:'#e8631e',belly:'#ffe6c2',spr:'#5fd24a',spr2:'#36a233',out:'#8a3a16',eye:'#2a1810',cheek:'#ff7a52',foot:'#d8541a'};
  const _sk = SKINS[(game&&game.skin)|0];
  if(_sk && _sk.pal && !fire){ Object.assign(C, _sk.pal); }
  if(_sk && _sk.rainbow && !fire){ cFlash+=0.06; const _c=RBOW[Math.floor(cFlash)%RBOW.length]; C.body=_c; C.top='#ffffff'; C.shade=_c; C.foot=_c; }
  if(o.star){ cFlash+=0.18; const col=RBOW[Math.floor(cFlash)%RBOW.length]; C.body=col; C.top='#ffffff'; C.shade=col; C.belly='#ffffff'; C.foot=col; }
  // round puffball body (Kirby-style): bw≈bh
  let d=size*(big?1.02:0.94); const sx=o.sx||1, sy=o.sy||1;
  let bw=d*sx, bh=d*sy; if(o.crouch){ bh*=0.8; bw*=1.06; }
  const cyb=feet-bh*0.5, top=feet-bh, rX=bw*0.5, rY=bh*0.5;
  const ph=o.walkPhase||0, wob=Math.sin(ph), air=o.onGround===false;
  ctx.fillStyle='rgba(0,0,0,0.18)'; ellipse(cx, feet+1.0, bw*0.5, 2.4);
  // wings (fly power-up)
  if(o.fly){ cWing+=0.35; const fl=Math.sin(air?cWing:ph*2)*0.5; for(const sgn of [-1,1]){ ctx.save(); ctx.translate(cx+sgn*rX*0.92, cyb-bh*0.06); ctx.rotate(sgn*(0.5+fl)); ctx.fillStyle='rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.ellipse(sgn*4,0,7,3.4,0,0,7); ctx.fill(); ctx.strokeStyle='rgba(180,205,230,0.85)'; ctx.lineWidth=0.8; ctx.beginPath(); ctx.ellipse(sgn*4,0,7,3.4,0,0,7); ctx.stroke(); ctx.restore(); } }
  if(fire){ ctx.save(); ctx.globalAlpha=0.22+0.06*Math.sin(ph*2); ctx.fillStyle='#ffae3a'; ellipse(cx, cyb, rX*1.5, rY*1.5); ctx.restore(); }
  // little oval feet
  let lf,rf; if(!air){ lf=wob>0?2.0:0; rf=wob<0?2.0:0; } else { lf=2.6; rf=0.8; }
  const footY=feet-1.4, footW=bw*0.30, footH=bh*0.16;
  const drawFoot=(fx,fy,rot)=>{ ctx.beginPath(); ctx.ellipse(fx,fy,footW,footH,rot,0,7); ctx.fill(); ctx.beginPath(); ctx.ellipse(fx,fy,footW,footH,rot,0,7); ctx.stroke(); };
  ctx.fillStyle=C.foot; ctx.strokeStyle=C.out; ctx.lineWidth=1;
  drawFoot(cx-bw*0.25, footY-lf*0.4, -0.16); drawFoot(cx+bw*0.25, footY-rf*0.4, 0.16);
  // stubby arms (small ovals at the sides)
  const armSw=wob*1.6;
  const drawArm=(ax,ay,rot)=>{ ctx.beginPath(); ctx.ellipse(ax,ay,bw*0.16,bh*0.135,rot,0,7); ctx.fill(); ctx.beginPath(); ctx.ellipse(ax,ay,bw*0.16,bh*0.135,rot,0,7); ctx.stroke(); };
  ctx.fillStyle=C.body; ctx.strokeStyle=C.out;
  drawArm(cx-rX*0.96, cyb+armSw, -0.35); drawArm(cx+rX*0.96, cyb-armSw, 0.35);
  // body
  const bg=ctx.createRadialGradient(cx-rX*0.32, cyb-rY*0.38, rX*0.18, cx, cyb, rX*1.12);
  bg.addColorStop(0,C.top); bg.addColorStop(0.58,C.body); bg.addColorStop(1,C.shade);
  ctx.fillStyle=bg; ctx.beginPath(); ctx.ellipse(cx, cyb, rX, rY, 0, 0, 7); ctx.fill();
  ctx.save(); ctx.globalAlpha=0.55; ctx.fillStyle=C.belly; ctx.beginPath(); ctx.ellipse(cx, cyb+bh*0.13, rX*0.6, rY*0.55, 0, 0, 7); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha=0.5; ctx.fillStyle='rgba(255,255,255,0.85)'; ellipse(cx-rX*0.34, cyb-rY*0.5, rX*0.3, rY*0.18); ctx.restore();
  ctx.strokeStyle=C.out; ctx.lineWidth=1.3; ctx.beginPath(); ctx.ellipse(cx, cyb, rX, rY, 0, 0, 7); ctx.stroke();
  // sprout on top (keeps Bramble's identity)
  ctx.save(); ctx.translate(cx, cyb-rY);
  if(fire){ ctx.fillStyle=C.spr; ctx.beginPath(); ctx.moveTo(0,2); ctx.quadraticCurveTo(-3.4,-3,0,-8); ctx.quadraticCurveTo(3.4,-3,0,2); ctx.fill(); ctx.fillStyle=C.spr2; ctx.beginPath(); ctx.moveTo(0,1); ctx.quadraticCurveTo(-1.8,-2,0,-5); ctx.quadraticCurveTo(1.8,-2,0,1); ctx.fill(); }
  else { ctx.strokeStyle=C.spr2; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(0,1); ctx.lineTo(0,-3.8); ctx.stroke(); ctx.fillStyle=C.spr; leafShape(-1); leafShape(1); }
  ctx.restore();
  // face: big tall eyes close together + blush + small mouth
  const eyeY=cyb-bh*0.05, eo=bw*0.135, look=facing>0?0.9:-0.9;
  drawEyeAt(cx-eo,eyeY,look,o.blink,C.eye); drawEyeAt(cx+eo,eyeY,look,o.blink,C.eye);
  ctx.strokeStyle=C.out; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx+look*0.4,eyeY+bh*0.15,bw*0.07,0.15*Math.PI,0.85*Math.PI); ctx.stroke();
  ctx.save(); ctx.globalAlpha=0.6; ctx.fillStyle=C.cheek; ellipse(cx-bw*0.23,eyeY+bh*0.12,bw*0.085,bh*0.05); ellipse(cx+bw*0.23,eyeY+bh*0.12,bw*0.085,bh*0.05); ctx.restore();
}
function leafShape(side){ ctx.beginPath(); ctx.ellipse(side*2.2,-3.4,2.4,1.3,side*0.6,0,Math.PI*2); ctx.fill(); }
function drawEyeAt(x,y,look,blink,eye){ ctx.fillStyle='#fff'; ellipse(x,y,2.9,3.3); if(blink){ ctx.strokeStyle=eye; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(x-2.4,y); ctx.lineTo(x+2.4,y); ctx.stroke(); } else { ctx.fillStyle=eye; ellipse(x+look,y+0.4,1.35,1.7); ctx.fillStyle='rgba(255,255,255,0.95)'; ellipse(x+look-0.7,y-0.4,0.7,0.7); } }
function shellDome(cx,feet,color,h){ const g=ctx.createLinearGradient(0,feet-h-3,0,feet); g.addColorStop(0,'#54c46a'); g.addColorStop(1,color); ctx.fillStyle=g; rr(ctx,cx-8,feet-h-3,16,h+3,7); ctx.fill();
  ctx.save(); ctx.globalAlpha=0.4; ctx.fillStyle='#fff'; ellipse(cx-3,feet-h+1,3.4,2); ctx.restore();
  ctx.fillStyle='#f2e7c0'; rr(ctx,cx-8,feet-3,16,3,1.5); ctx.fill();
  ctx.fillStyle='#1f7e2e'; ctx.beginPath(); ctx.arc(cx,feet-9,2.8,0,7); ctx.fill();
  ctx.fillStyle='#7be06a'; ctx.beginPath(); ctx.arc(cx,feet-9,1.3,0,7); ctx.fill();
  const seg=[[-5,-6],[5,-6],[-5,-12],[5,-12]]; ctx.fillStyle='#1f7e2e'; for(const s of seg){ ctx.beginPath(); ctx.arc(cx+s[0],feet+s[1],1.4,0,7); ctx.fill(); }
  ctx.strokeStyle='#155a22'; ctx.lineWidth=1; rr(ctx,cx-8,feet-h-3,16,h+3,7); ctx.stroke();
}
function drawCoin(cx,cy,r,phase){ const sxv=Math.abs(Math.cos(phase));
  const g=ctx.createLinearGradient(cx,cy-r,cx,cy+r); g.addColorStop(0,'#ffe79a'); g.addColorStop(0.5,'#f7c948'); g.addColorStop(1,'#e0a51e'); ctx.fillStyle=g; ellipse(cx,cy,r*sxv+0.6,r);
  ctx.fillStyle='rgba(255,247,200,0.9)'; ellipse(cx-0.4,cy-0.6,(r-1.8)*sxv,r-1.8);
  ctx.strokeStyle='#b9780c'; ctx.lineWidth=0.8; ctx.beginPath(); ctx.ellipse(cx,cy,r*sxv+0.6,r,0,0,Math.PI*2); ctx.stroke();
  if(sxv>0.4){ ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.fillRect(cx-0.5,cy-r+1.8,1,r*0.7); }
}

export { drawCoin, drawCreature, drawEyeAt, leafShape, shellDome };
