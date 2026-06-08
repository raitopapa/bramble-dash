import { ctx, ellipse, rr } from '../engine/canvas.js';

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

export { drawCoin, drawCreature, drawEyeAt, leafShape, shellDome };
