import { ctx, ellipse, rr } from '../engine/canvas.js';

// ============ CREATURE / SHARED DRAW ============
function drawCreature(cx, feet, size, form, o){
  o=o||{}; const facing=o.facing||1; const big=form!=='small'; const fire=form==='fire';
  const C = fire ? {body:'#ff6a4d',top:'#ff8e6e',shade:'#d8392e',belly:'#ffe1d6',spr:'#ffd23a',spr2:'#ff8a2a',out:'#9e2a20',eye:'#2a1410',cheek:'#ff5a4a'}
                 : {body:'#ff9a3c',top:'#ffb869',shade:'#e8631e',belly:'#ffe6c2',spr:'#5fd24a',spr2:'#36a233',out:'#8a3a16',eye:'#2a1810',cheek:'#ff8a5a'};
  let bw=size*(big?0.82:0.9), bh=size; if(o.crouch) bh*=0.74;
  const sx=o.sx||1, sy=o.sy||1; bw*=sx; bh*=sy; const top=feet-bh;
  const ph=o.walkPhase||0, wob=Math.sin(ph), air=o.onGround===false;
  ctx.fillStyle='rgba(0,0,0,0.18)'; ellipse(cx, feet+1.5, bw*0.62, 2.6);
  if(fire){ ctx.save(); ctx.globalAlpha=0.22+0.06*Math.sin(ph*2); ctx.fillStyle='#ffae3a'; ellipse(cx, feet-bh*0.5, bw*1.08, bh*0.9); ctx.restore(); }
  let lf,rf; if(!air){ lf=wob>0?1.6:0; rf=wob<0?1.6:0; } else { lf=1.4; rf=1.4; }
  ctx.fillStyle=C.shade; rr(ctx, cx-bw*0.40, feet-3.4-lf, bw*0.30, 3.6, 1.7); ctx.fill(); rr(ctx, cx+bw*0.10, feet-3.4-rf, bw*0.30, 3.6, 1.7); ctx.fill();
  const sw=wob*1.2; ctx.fillStyle=C.shade; ellipse(cx-bw*0.5, top+bh*0.56+sw, 2.3, 3.1); ellipse(cx+bw*0.5, top+bh*0.56-sw, 2.3, 3.1);
  const bgY=ctx.createLinearGradient(0,top,0,feet); bgY.addColorStop(0,C.top); bgY.addColorStop(0.52,C.body); bgY.addColorStop(1,C.shade); ctx.fillStyle=bgY;
  rr(ctx, cx-bw/2, top, bw, bh, Math.min(bw,bh)*0.46); ctx.fill();
  ctx.fillStyle=C.belly; rr(ctx, cx-bw*0.3, top+bh*0.44, bw*0.6, bh*0.5, bw*0.26); ctx.fill();
  ctx.save(); ctx.globalAlpha=0.18; ctx.fillStyle=C.shade; rr(ctx, cx-bw/2, top+bh*0.64, bw, bh*0.36, bw*0.3); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha=0.5; ctx.fillStyle='rgba(255,255,255,0.8)'; ellipse(cx-bw*0.22, top+bh*0.15, bw*0.2, bh*0.12); ctx.restore();
  ctx.strokeStyle=C.out; ctx.lineWidth=1.2; rr(ctx, cx-bw/2, top, bw, bh, Math.min(bw,bh)*0.46); ctx.stroke();
  ctx.save(); ctx.translate(cx, top);
  if(fire){ ctx.fillStyle=C.spr; ctx.beginPath(); ctx.moveTo(0,2); ctx.quadraticCurveTo(-3.4,-3,0,-8); ctx.quadraticCurveTo(3.4,-3,0,2); ctx.fill(); ctx.fillStyle=C.spr2; ctx.beginPath(); ctx.moveTo(0,1); ctx.quadraticCurveTo(-1.8,-2,0,-5); ctx.quadraticCurveTo(1.8,-2,0,1); ctx.fill(); }
  else { ctx.strokeStyle=C.spr2; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(0,1); ctx.lineTo(0,-3.6); ctx.stroke(); ctx.fillStyle=C.spr; leafShape(-1); leafShape(1); }
  ctx.restore();
  const eyeY=top+bh*0.35, eo=bw*0.21, look=facing>0?0.9:-0.9;
  drawEyeAt(cx-eo,eyeY,look,o.blink,C.eye); drawEyeAt(cx+eo,eyeY,look,o.blink,C.eye);
  ctx.strokeStyle=C.out; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx+look*0.5,eyeY+bh*0.17,bw*0.14,0.16*Math.PI,0.84*Math.PI); ctx.stroke();
  ctx.save(); ctx.globalAlpha=0.5; ctx.fillStyle=C.cheek; ellipse(cx-bw*0.33,eyeY+bh*0.13,1.7,1.1); ellipse(cx+bw*0.33,eyeY+bh*0.13,1.7,1.1); ctx.restore();
}
function leafShape(side){ ctx.beginPath(); ctx.ellipse(side*2.2,-3.4,2.4,1.3,side*0.6,0,Math.PI*2); ctx.fill(); }
function drawEyeAt(x,y,look,blink,eye){ ctx.fillStyle='#fff'; ellipse(x,y,2.9,3.3); if(blink){ ctx.strokeStyle=eye; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(x-2.4,y); ctx.lineTo(x+2.4,y); ctx.stroke(); } else { ctx.fillStyle=eye; ellipse(x+look,y+0.4,1.35,1.7); ctx.fillStyle='rgba(255,255,255,0.95)'; ellipse(x+look-0.7,y-0.4,0.7,0.7); } }
function shellDome(cx,feet,color,h){ ctx.fillStyle=color; rr(ctx,cx-8,feet-h-3,16,h+3,7); ctx.fill();
  ctx.fillStyle='#f2e7c0'; rr(ctx,cx-8,feet-3,16,3,1.5); ctx.fill();
  ctx.fillStyle='#1f7e2e'; ctx.beginPath(); ctx.arc(cx,feet-9,2.6,0,7); ctx.fill();
  ctx.fillStyle='#7be06a'; ctx.beginPath(); ctx.arc(cx,feet-9,1.2,0,7); ctx.fill();
  const seg=[[-5,-6],[5,-6],[-5,-12],[5,-12]]; ctx.fillStyle='#1f7e2e'; for(const s of seg){ ctx.beginPath(); ctx.arc(cx+s[0],feet+s[1],1.3,0,7); ctx.fill(); }
  ctx.strokeStyle='#155a22'; ctx.lineWidth=1; rr(ctx,cx-8,feet-h-3,16,h+3,7); ctx.stroke();
}
function drawCoin(cx,cy,r,phase){ const sxv=Math.abs(Math.cos(phase));
  const g=ctx.createLinearGradient(cx,cy-r,cx,cy+r); g.addColorStop(0,'#ffe79a'); g.addColorStop(0.5,'#f7c948'); g.addColorStop(1,'#e0a51e'); ctx.fillStyle=g; ellipse(cx,cy,r*sxv+0.6,r);
  ctx.fillStyle='rgba(255,247,200,0.9)'; ellipse(cx-0.4,cy-0.6,(r-1.8)*sxv,r-1.8);
  ctx.strokeStyle='#b9780c'; ctx.lineWidth=0.8; ctx.beginPath(); ctx.ellipse(cx,cy,r*sxv+0.6,r,0,0,Math.PI*2); ctx.stroke();
  if(sxv>0.4){ ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.fillRect(cx-0.5,cy-r+1.8,1,r*0.7); }
}

export { drawCoin, drawCreature, drawEyeAt, leafShape, shellDome };
