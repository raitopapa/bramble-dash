import { DIFFICULTY, THEMES } from '../core/constants.js';
import { clamp } from '../core/utils.js';
import { drawCoin, drawCreature } from './creatures.js';
import { camH, camW, canvas, ctx, ellipse, rr, worldTransform } from '../engine/canvas.js';
import { animClock } from '../engine/loop.js';
import { bumpOffset, crumbleOffset, game, gget, solidTile } from '../game/state.js';

function drawSky(th){ const W=canvas.width,H=canvas.height,t=animClock;
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,th.skyTop); if(th.skyMid) g.addColorStop(0.52,th.skyMid); g.addColorStop(1,th.skyBot); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  if(th.water){
    ctx.save(); ctx.globalAlpha=0.10; ctx.fillStyle='#e6fbff'; for(let i=0;i<5;i++){ const x=W*(0.08+i*0.2)+Math.sin(t*0.3+i)*18; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x+38,0); ctx.lineTo(x+86,H); ctx.lineTo(x+8,H); ctx.closePath(); ctx.fill(); } ctx.restore();
    ctx.fillStyle='rgba(255,255,255,0.14)'; ctx.fillRect(0,0,W,H*0.045);
    ctx.fillStyle='#ffffff'; for(let i=0;i<30;i++){ const bx=(i*131.7)%W, sp=18+(i%5)*10; let by=H-((t*sp+i*70)%(H+30)); const r=1+(i%3)*0.9; ctx.globalAlpha=0.16+0.22*((i%4)/4); ctx.beginPath(); ctx.arc(bx,by,r,0,7); ctx.fill(); } ctx.globalAlpha=1;
    return;
  }
  if(!th.cave){
    const sx=W*0.8, sy=H*0.2; const sg=ctx.createRadialGradient(sx,sy,4,sx,sy,H*0.7); sg.addColorStop(0,th.glow||'rgba(255,250,200,0.85)'); sg.addColorStop(1,'rgba(255,250,200,0)'); ctx.fillStyle=sg; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(sx,sy,H*0.055,0,7); ctx.fill();
    if(th===THEMES.sky){ ctx.save(); ctx.globalAlpha=0.16; ctx.lineWidth=H*0.02; const cols=['#ff7a7a','#ffce4d','#7ce06a','#5aa6ff','#b884ff']; for(let i=0;i<cols.length;i++){ ctx.strokeStyle=cols[i]; ctx.beginPath(); ctx.arc(W*0.32,H*1.02,H*0.55-i*H*0.022,Math.PI*1.06,Math.PI*1.94); ctx.stroke(); } ctx.restore(); }
  } else {
    if(th===THEMES.castle){ const mx=W*0.8,my=H*0.22,mr=H*0.085; ctx.fillStyle='rgba(255,238,205,0.92)'; ctx.beginPath(); ctx.arc(mx,my,mr,0,7); ctx.fill(); ctx.fillStyle=th.skyTop; ctx.beginPath(); ctx.arc(mx+mr*0.55,my-mr*0.32,mr*0.92,0,7); ctx.fill(); }
    ctx.fillStyle='#fff'; for(let i=0;i<28;i++){ const x=(i*129.7)%W, y=(i*73.3)%(H*0.5); const tw=Math.abs(Math.sin(t*1.4+i*1.3)); ctx.globalAlpha=0.25+tw*0.5; ctx.fillRect(x,y,1.5,1.5); } ctx.globalAlpha=1;
    if(th===THEMES.cave){ ctx.fillStyle=th.mountainDark||'#122142'; for(let i=0;i<12;i++){ const x=((i*150-game.camX*0.2)%(W+120)+W+120)%(W+120)-60, w=14+(i%3)*8, h=20+(i%4)*14; ctx.beginPath(); ctx.moveTo(x-w/2,0); ctx.lineTo(x+w/2,0); ctx.lineTo(x,h); ctx.closePath(); ctx.fill(); } }
    const vg=ctx.createRadialGradient(W/2,H*0.46,H*0.18,W/2,H*0.5,H*0.95); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,0.5)'); ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);
  }
}
function drawMountains(th){ const W=canvas.width,H=canvas.height, baseY=H*0.84;
  if(th.water){ const sg=ctx.createLinearGradient(0,baseY-H*0.12,0,H); sg.addColorStop(0,'rgba(20,90,100,0)'); sg.addColorStop(1,th.mountainDark||'#15565f'); ctx.fillStyle=sg; ctx.fillRect(0,baseY-H*0.12,W,H); return; }
  const layers=[{c:th.mountainDark||th.hillDark, amp:H*0.13, k:0.0010, spd:0.16, off:0},
                {c:th.mountain||th.hill,        amp:H*0.09, k:0.0016, spd:0.30, off:H*0.05}];
  for(const L of layers){ ctx.fillStyle=L.c; ctx.beginPath(); ctx.moveTo(0,H);
    for(let x=0;x<=W;x+=10){ const wx=x+game.camX*L.spd; const yy=baseY-L.off-(Math.sin(wx*L.k)*0.5+0.5)*L.amp-Math.sin(wx*L.k*2.7+1.3)*L.amp*0.16; ctx.lineTo(x,yy); }
    ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
    if(!th.cave){ ctx.fillStyle='rgba(255,255,255,0.10)'; ctx.beginPath(); ctx.moveTo(0,H);
      for(let x=0;x<=W;x+=10){ const wx=x+game.camX*L.spd; const yy=baseY-L.off-(Math.sin(wx*L.k)*0.5+0.5)*L.amp-Math.sin(wx*L.k*2.7+1.3)*L.amp*0.16; ctx.lineTo(x,yy); ctx.lineTo(x,yy+3); } ctx.closePath(); }
  }
  drawMtnExtras(th,baseY);
}
function drawMtnExtras(th,baseY){ const W=canvas.width,H=canvas.height,t=animClock,cam=game.camX;
  if(th===THEMES.overworld){
    ctx.fillStyle='rgba(40,120,60,0.5)';
    for(let i=0;i<7;i++){ const x=((i*220-cam*0.3)%(W+120)+W+120)%(W+120)-60, y=baseY-H*0.05;
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-8,y); ctx.lineTo(x,y-16); ctx.lineTo(x+8,y); ctx.closePath(); ctx.fill(); }
    ctx.strokeStyle='rgba(40,50,80,0.4)'; ctx.lineWidth=2;
    for(let i=0;i<3;i++){ const bx=((i*330-t*22)%(W+80)+W+80)%(W+80)-40, by=H*(0.18+i*0.05)+Math.sin(t+i)*4, w=7;
      ctx.beginPath(); ctx.moveTo(bx-w,by); ctx.quadraticCurveTo(bx-w*0.4,by-w*0.5,bx,by); ctx.quadraticCurveTo(bx+w*0.4,by-w*0.5,bx+w,by); ctx.stroke(); }
  } else if(th===THEMES.sky){
    for(let i=0;i<4;i++){ const x=((i*300-cam*0.25)%(W+200)+W+200)%(W+200)-100, y=H*(0.4+(i%2)*0.12)+Math.sin(t*0.4+i)*4, w=H*0.12;
      ctx.fillStyle='rgba(150,210,160,0.45)'; ctx.beginPath(); ctx.ellipse(x,y,w,w*0.4,0,0,Math.PI); ctx.fill();
      ctx.fillStyle='rgba(120,170,120,0.45)'; ctx.beginPath(); ctx.moveTo(x-w,y); ctx.lineTo(x,y+w*0.55); ctx.lineTo(x+w,y); ctx.closePath(); ctx.fill(); }
  } else if(th===THEMES.castle){
    for(let i=0;i<3;i++){ const x=((i*360-cam*0.2)%(W+260)+W+260)%(W+260)-130, tw=H*0.07, th2=H*0.34, y=baseY-th2;
      ctx.fillStyle='rgba(20,10,24,0.55)'; ctx.fillRect(x,y,tw,th2);
      for(let c=0;c<3;c++) ctx.fillRect(x+c*(tw/3),y-H*0.02,tw/4,H*0.02);
      ctx.fillStyle='rgba(255,90,90,0.5)'; ctx.fillRect(x+tw*0.42,y-H*0.06,2,H*0.04);
      ctx.beginPath(); ctx.moveTo(x+tw*0.42,y-H*0.06); ctx.lineTo(x+tw*0.42+H*0.03,y-H*0.05); ctx.lineTo(x+tw*0.42,y-H*0.04); ctx.fill(); }
  }
}
function drawHills(th){ if(th.water) return; const f=0.55, left=game.camX*f-90, right=game.camX*f+camW+90;
  for(const h of game.level.decor.hills){ if(h.x<left||h.x>right) continue; const w=64*h.s,hh=38*h.s;
    const g=ctx.createLinearGradient(0,h.y-hh,0,h.y); g.addColorStop(0,th.hill); g.addColorStop(1,th.hillDark);
    ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(h.x-w/2,h.y); ctx.quadraticCurveTo(h.x,h.y-hh,h.x+w/2,h.y); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.16)'; ctx.beginPath(); ctx.moveTo(h.x-w*0.16,h.y-hh*0.62); ctx.quadraticCurveTo(h.x-w*0.05,h.y-hh*0.86,h.x+w*0.06,h.y-hh*0.66); ctx.quadraticCurveTo(h.x-w*0.02,h.y-hh*0.5,h.x-w*0.16,h.y-hh*0.62); ctx.fill();
  }
}
function drawCloud(x,y,s){ ctx.save(); const g=ctx.createLinearGradient(0,y-9*s,0,y+7*s); g.addColorStop(0,'rgba(255,255,255,0.98)'); g.addColorStop(1,'rgba(226,238,255,0.92)'); ctx.fillStyle=g;
  const r=9*s; ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.arc(x+r*1.1,y+2,r*0.85,0,7); ctx.arc(x-r*1.1,y+2,r*0.8,0,7); ctx.arc(x+r*2,y+5,r*0.6,0,7); ctx.arc(x-r*1.9,y+5,r*0.58,0,7); ctx.fill(); ctx.fillRect(x-r*2,y+4,r*4,r*0.9);
  ctx.fillStyle='rgba(255,255,255,0.6)'; ellipse(x-r*0.4,y-r*0.5,r*0.9,r*0.4); ctx.restore(); }
function drawClouds(th){ if(th.water) return; const f=0.35, left=game.camX*f-160, right=game.camX*f+camW+160;
  if(th.cave){ for(const c of game.level.decor.crystals){ if(c.x<left||c.x>right)continue; ctx.save(); ctx.translate(c.x,c.y); const s=4.5*c.s, gl=0.4+0.35*Math.sin(animClock*2+c.x*0.05);
      ctx.globalAlpha=0.35*gl; ctx.fillStyle=th.accent||'#7fd6ff'; ctx.beginPath(); ctx.arc(0,0,s*2.4,0,7); ctx.fill();
      ctx.globalAlpha=0.85; ctx.fillStyle=th.accent||'#7fd6ff'; ctx.beginPath(); ctx.moveTo(0,-s*1.7); ctx.lineTo(s*0.7,0); ctx.lineTo(0,s*1.7); ctx.lineTo(-s*0.7,0); ctx.closePath(); ctx.fill();
      ctx.globalAlpha=0.9; ctx.fillStyle='rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.moveTo(0,-s*1.7); ctx.lineTo(s*0.28,-s*0.2); ctx.lineTo(0,s*0.2); ctx.closePath(); ctx.fill(); ctx.restore(); } return; }
  for(const c of game.level.decor.clouds){ let x=(c.x+animClock*c.spd)%game.worldW; if(x<0)x+=game.worldW; if(x<left||x>right)continue; drawCloud(x,c.y,c.s); }
}
function drawBush(x,y,s,th){ const g=ctx.createLinearGradient(0,y-9*s,0,y); g.addColorStop(0,th.bush); g.addColorStop(1,th.bushDark); ctx.fillStyle=g;
  ellipse(x,y-5*s,7.5*s,6.5*s); ellipse(x-7.5*s,y-3*s,6*s,5*s); ellipse(x+7.5*s,y-3*s,6*s,5*s);
  ctx.fillStyle=th.bushLight; ellipse(x-1.5*s,y-7.5*s,3.4*s,2.6*s); ellipse(x+5*s,y-4.5*s,2.2*s,1.7*s);
  if(th===THEMES.overworld||th===THEMES.sky){ ctx.fillStyle=th.accent||'#ffd23a'; ctx.beginPath(); ctx.arc(x+6*s,y-6*s,1.3*s,0,7); ctx.fill(); ctx.fillStyle='#ff9ec7'; ctx.beginPath(); ctx.arc(x-6*s,y-4*s,1.2*s,0,7); ctx.fill(); }
}
function drawBushes(th){ const left=game.camX-40, right=game.camX+camW+40, gyTile=game.grid.h-2;
  for(const b of game.level.decor.bushes){ if(b.x<left||b.x>right)continue; const tx=Math.floor(b.x/16); if(!solidTile(tx,gyTile))continue; drawBush(b.x,gyTile*16,b.s,th); }
}
function drawTiles(th){
  const x0=Math.max(0,Math.floor(game.camX/16)-1), x1=Math.min(game.grid.w-1,Math.floor((game.camX+camW)/16)+1);
  const y0=Math.max(0,Math.floor(game.camY/16)-1), y1=Math.min(game.grid.h-1,Math.floor((game.camY+camH)/16)+1);
  for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++){ const c=game.grid.c[y][x]; if(c===' '||c==='g'||c==='k'||c==='c') continue; drawTile(c,x,y,th); }
}
function drawTile(c,tx,ty,th){ const x=tx*16; const yy=ty*16-bumpOffset(tx,ty); const sx=(c==='D')?crumbleOffset(tx,ty):0;
  switch(c){
    case 'X': drawGround(x,yy,tx,ty,th); break;
    case 'S': drawStone(x,yy,th); break;
    case 'B': drawBrick(x,yy,th); break;
    case 'U': drawUsed(x,yy,th); break;
    case '?': case '!': drawQuestion(x,yy); break;
    case 'P': drawPipe(x,yy,tx,ty); break;
    case 'o': drawCoinTile(tx,ty); break;
    case 'T': drawSpring(x,yy,th); break;
    case 'D': drawCrumble(x+sx,yy,th); break;
  }
}
function drawBossHP(){ const b=game.boss, H=canvas.height, W=canvas.width; const n=b.maxhp, r=Math.max(6,H*0.02), gap=r*2.7, total=(n-1)*gap, x0=W/2-total/2, y=H*0.155;
  ctx.font=Math.round(H*0.026)+'px "Press Start 2P","Hiragino Maru Gothic ProN",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.fillText('ボス',W/2+1,y-r*2.0+1); ctx.fillStyle='#ffd34d'; ctx.fillText('ボス',W/2,y-r*2.0);
  for(let i=0;i<n;i++){ const x=x0+i*gap, on=i<b.hp; ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fillStyle=on?'#ff5d6c':'rgba(255,255,255,0.16)'; ctx.fill(); ctx.lineWidth=2; ctx.strokeStyle=on?'#7e0d1a':'rgba(0,0,0,0.35)'; ctx.stroke(); if(on){ ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(x-r*0.3,y-r*0.3,r*0.28,0,7); ctx.fill(); } }
}
function drawCheckpoint(cp){ const x=cp.x, baseY=cp.y+16, topY=cp.y-32, t=animClock;
  const pg=ctx.createLinearGradient(x-1.5,0,x+1.5,0); pg.addColorStop(0,'#8a93a3'); pg.addColorStop(0.4,'#dfe4ec'); pg.addColorStop(1,'#9aa3b3'); ctx.fillStyle=pg; ctx.fillRect(x-1.4,topY,2.8,baseY-topY);
  if(cp.active){ ctx.save(); ctx.globalAlpha=0.35+0.2*Math.sin(t*5); ctx.fillStyle='#7bffa0'; ctx.beginPath(); ctx.arc(x,topY,7,0,7); ctx.fill(); ctx.restore(); }
  ctx.fillStyle=cp.active?'#d2efd8':'#cfd6e2'; ctx.beginPath(); ctx.arc(x,topY,3,0,7); ctx.fill();
  const wav = cp.active ? Math.sin(t*6)*2 : 0; const fg=ctx.createLinearGradient(x,topY,x+14,topY+8);
  if(cp.active){ fg.addColorStop(0,'#5ce882'); fg.addColorStop(1,'#2fb45a'); } else { fg.addColorStop(0,'#b4bac2'); fg.addColorStop(1,'#8a9098'); }
  ctx.fillStyle=fg; ctx.beginPath(); ctx.moveTo(x,topY+2); ctx.lineTo(x+14,topY+5+wav); ctx.lineTo(x,topY+11); ctx.closePath(); ctx.fill();
}
function drawSpring(x,y,th){
  ctx.fillStyle=th.soilDark||'#6e4a1f'; ctx.fillRect(x+2,y+11,12,5);
  ctx.fillStyle='#c0c6d2'; ctx.fillRect(x+3,y+6,10,2); ctx.fillRect(x+5,y+8,6,2); ctx.fillRect(x+3,y+10,10,2);
  ctx.fillStyle='#e23b3b'; rr(ctx,x+2,y+2,12,5,2); ctx.fill();
  ctx.fillStyle='#ff7a6a'; ctx.fillRect(x+3,y+3,10,1);
  ctx.strokeStyle='#7a1414'; ctx.lineWidth=1; rr(ctx,x+2,y+2,12,5,2); ctx.stroke();
}
function drawCrumble(x,y,th){
  ctx.fillStyle=th.used||'#b07a3a'; ctx.fillRect(x,y,16,16);
  ctx.fillStyle=th.usedDark||'#6e4a1f'; ctx.fillRect(x,y+14,16,2); ctx.fillRect(x+14,y,2,16);
  ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.fillRect(x,y,16,2); ctx.fillRect(x,y,2,16);
  ctx.strokeStyle='rgba(0,0,0,0.35)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(x+3,y+2); ctx.lineTo(x+6,y+8); ctx.lineTo(x+4,y+14); ctx.moveTo(x+11,y+1); ctx.lineTo(x+9,y+7); ctx.lineTo(x+13,y+13); ctx.stroke();
}
function drawGround(x,y,tx,ty,th){ const exposed=!solidTile(tx,ty-1);
  const g=ctx.createLinearGradient(0,y,0,y+16); g.addColorStop(0,th.soil); g.addColorStop(1,th.soilDark); ctx.fillStyle=g; ctx.fillRect(x,y,16,16);
  ctx.fillStyle=th.soilEdge; ctx.save(); ctx.globalAlpha=0.7; ctx.beginPath(); ctx.arc(x+4,y+9,1.3,0,7); ctx.arc(x+11,y+11,1.5,0,7); ctx.arc(x+8,y+6,1,0,7); ctx.fill(); ctx.restore();
  ctx.fillStyle='rgba(0,0,0,0.12)'; ctx.fillRect(x,y+13,16,3);
  if(exposed){ const gg=ctx.createLinearGradient(0,y,0,y+7); gg.addColorStop(0,th.grass); gg.addColorStop(1,th.grassDark); ctx.fillStyle=gg; ctx.fillRect(x,y,16,6); ctx.fillStyle=th.grassDark; ctx.fillRect(x,y+5.5,16,1.6);
    ctx.fillStyle=th.grass; for(const bx of [1,6,11]){ ctx.beginPath(); ctx.moveTo(x+bx,y+0.5); ctx.quadraticCurveTo(x+bx+1.6,y-4,x+bx+3.2,y+0.5); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle='rgba(255,255,255,0.22)'; ctx.fillRect(x,y,16,1.3); }
  ctx.fillStyle='rgba(255,255,255,0.05)'; ctx.fillRect(x,y,1.5,16); ctx.fillStyle='rgba(0,0,0,0.12)'; ctx.fillRect(x+14.5,y,1.5,16);
}
function drawStone(x,y,th){ const g=ctx.createLinearGradient(0,y,0,y+16); g.addColorStop(0,th.stone); g.addColorStop(1,th.stoneDark); ctx.fillStyle=g; rr(ctx,x+0.5,y+0.5,15,15,3.5); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.22)'; rr(ctx,x+1.6,y+1.4,12.8,2.6,1.6); ctx.fill();
  ctx.fillStyle='rgba(0,0,0,0.16)'; rr(ctx,x+1.6,y+12,12.8,2.4,1.6); ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,0.16)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x+5,y+5); ctx.lineTo(x+8,y+8); ctx.lineTo(x+6,y+11); ctx.stroke();
  ctx.strokeStyle=th.stoneDark; ctx.lineWidth=1; rr(ctx,x+0.5,y+0.5,15,15,3.5); ctx.stroke(); }
function drawBrick(x,y,th){ const g=ctx.createLinearGradient(0,y,0,y+16); g.addColorStop(0,th.brick); g.addColorStop(1,th.brickLine); ctx.fillStyle=g; rr(ctx,x+0.5,y+0.5,15,15,2.5); ctx.fill();
  ctx.strokeStyle=th.brickLine; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x+1,y+8.5); ctx.lineTo(x+15,y+8.5); ctx.moveTo(x+8,y+1); ctx.lineTo(x+8,y+8); ctx.moveTo(x+4,y+9); ctx.lineTo(x+4,y+15); ctx.moveTo(x+12,y+9); ctx.lineTo(x+12,y+15); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.16)'; ctx.fillRect(x+1.5,y+1.4,13,1.3); ctx.fillStyle='rgba(0,0,0,0.14)'; ctx.fillRect(x+1.5,y+13.6,13,1.3); }
function drawUsed(x,y,th){ const g=ctx.createLinearGradient(0,y,0,y+16); g.addColorStop(0,th.used); g.addColorStop(1,th.usedDark); ctx.fillStyle=g; rr(ctx,x+0.5,y+0.5,15,15,3); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.12)'; rr(ctx,x+1.6,y+1.4,12.8,2.4,1.6); ctx.fill();
  ctx.fillStyle=th.usedDark; for(const c of [[3,3],[13,3],[3,13],[13,13]]){ ctx.beginPath(); ctx.arc(x+c[0],y+c[1],1.1,0,7); ctx.fill(); }
  ctx.strokeStyle='rgba(0,0,0,0.2)'; ctx.lineWidth=1; rr(ctx,x+0.5,y+0.5,15,15,3); ctx.stroke(); }
function drawQuestion(x,y){ const t=animClock; const g=ctx.createLinearGradient(0,y,0,y+16); g.addColorStop(0,'#ffd64f'); g.addColorStop(1,'#e0980f'); ctx.fillStyle=g; rr(ctx,x+0.5,y+0.5,15,15,3); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.4)'; rr(ctx,x+1.6,y+1.4,12.8,2.8,1.8); ctx.fill();
  ctx.fillStyle='#7a4e06'; for(const c of [[2.6,2.6],[13.4,2.6],[2.6,13.4],[13.4,13.4]]){ ctx.beginPath(); ctx.arc(x+c[0],y+c[1],1,0,7); ctx.fill(); }
  ctx.strokeStyle='#b9780c'; ctx.lineWidth=1; rr(ctx,x+0.5,y+0.5,15,15,3); ctx.stroke();
  const pulse=0.62+0.38*Math.sin(t*4+(x+y)*0.1); ctx.save(); ctx.globalAlpha=pulse; ctx.fillStyle='#fff3d0'; ctx.font='bold 11px "Press Start 2P", monospace'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('?',x+8.4,y+9.2); ctx.restore();
  ctx.fillStyle='#7a4e06'; ctx.font='bold 10px "Press Start 2P", monospace'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('?',x+8,y+8.6); }
function drawPipe(x,y,tx,ty){ const isTop=gget(tx,ty-1)!=='P', isLeft=gget(tx-1,ty)!=='P';
  const g=ctx.createLinearGradient(x,0,x+16,0); g.addColorStop(0,'#1f7e2e'); g.addColorStop(0.22,'#7be06a'); g.addColorStop(0.55,'#3ab24c'); g.addColorStop(1,'#1f7e2e'); ctx.fillStyle=g; ctx.fillRect(x,y,16,16);
  if(isTop){ const lx=isLeft?x-2:x, lw=18; const rg=ctx.createLinearGradient(lx,0,lx+lw,0); rg.addColorStop(0,'#1f7e2e'); rg.addColorStop(0.22,'#9ff08e'); rg.addColorStop(0.55,'#46c057'); rg.addColorStop(1,'#1f7e2e'); ctx.fillStyle=rg; rr(ctx,lx,y-1,lw,7,2.5); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.32)'; ctx.fillRect(lx+2,y,lw-4,1.3); ctx.fillStyle='rgba(0,0,0,0.16)'; ctx.fillRect(lx,y+5,lw,1.2); }
}
function drawCoinTile(tx,ty){ const cx=tx*16+8, cy=ty*16+8+Math.sin(animClock*3+tx)*1.5; drawCoin(cx,cy,5,animClock*5+tx); }
function star(cx,cy,r,fill,stroke){ ctx.beginPath(); for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, rad=(i%2)?r*0.45:r, x=cx+Math.cos(a)*rad, y=cy+Math.sin(a)*rad; i?ctx.lineTo(x,y):ctx.moveTo(x,y);} ctx.closePath(); ctx.fillStyle=fill; ctx.fill(); if(stroke){ ctx.strokeStyle=stroke; ctx.lineWidth=1; ctx.stroke(); } }
function drawGoal(th){ const px=game.goalX, baseY=game.goalGroundY, topY=game.goalPoleTop;
  const bg=ctx.createLinearGradient(0,baseY,0,baseY+16); bg.addColorStop(0,'#e2e6ed'); bg.addColorStop(1,'#9aa0aa'); ctx.fillStyle=bg; rr(ctx,px-9,baseY,18,16,3); ctx.fill(); ctx.fillStyle='rgba(255,255,255,0.28)'; rr(ctx,px-7.5,baseY+1.5,15,2.4,1.4); ctx.fill();
  const pg=ctx.createLinearGradient(px-2,0,px+2,0); pg.addColorStop(0,'#8a9098'); pg.addColorStop(0.4,'#eef1f5'); pg.addColorStop(1,'#aab0b8'); ctx.fillStyle=pg; ctx.fillRect(px-1.5,topY,3,baseY-topY);
  star(px,topY-3,5,'#ffd24d','#b9780c');
  const fy = (game.cleared && game.clearPhase==='slide') ? clamp(game.player.y, topY+4, baseY-12) : topY+8;
  const wav=Math.sin(animClock*6)*2; const fg=ctx.createLinearGradient(px,fy,px+20,fy+5); fg.addColorStop(0,'#ff6b6b'); fg.addColorStop(1,'#e23b50'); ctx.fillStyle=fg;
  ctx.beginPath(); ctx.moveTo(px+2,fy); ctx.lineTo(px+20+wav,fy+5); ctx.lineTo(px+2,fy+11); ctx.closePath(); ctx.fill(); ctx.fillStyle='rgba(255,255,255,0.92)'; ctx.beginPath(); ctx.arc(px+9,fy+5.5,2,0,7); ctx.fill();
  drawCastle(px+46,baseY,th);
}
function drawCastle(x,baseY,th){ const w=52,h=46, y=baseY-h+16;
  const wall=ctx.createLinearGradient(0,y,0,baseY+16); wall.addColorStop(0,'#d8c6a4'); wall.addColorStop(1,'#b59a72'); 
  ctx.fillStyle='#9c8158'; ctx.fillRect(x-6,y+6,10,h+10); ctx.fillRect(x+w-4,y+6,10,h+10);
  for(let i=-6;i<w+10;i+=8){ ctx.fillStyle='#8a7048'; ctx.fillRect(x+i,y+1,5,5); }
  ctx.fillStyle=wall; ctx.fillRect(x,y,w,h);
  ctx.fillStyle='#7a5a3a'; ctx.beginPath(); ctx.moveTo(x+w/2-7,baseY+16); ctx.lineTo(x+w/2-7,y+20); ctx.arc(x+w/2,y+20,7,Math.PI,0); ctx.lineTo(x+w/2+7,baseY+16); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#5a3f28'; ctx.fillRect(x+w/2-1,y+20,2,baseY-y-4);
  ctx.fillStyle='#3a2a44'; for(const wx of [x+7,x+w-13]){ rr(ctx,wx,y+10,6,9,3); ctx.fill(); }
  ctx.fillStyle='rgba(255,220,120,0.5)'; ctx.fillRect(x+8,y+12,4,5);
  ctx.fillStyle='#3aa33a'; ctx.fillRect(x+w/2-0.5,y-20,1.5,13); const fw=Math.sin(animClock*5)*2; ctx.fillStyle='#ff4d4d'; ctx.beginPath(); ctx.moveTo(x+w/2,y-20); ctx.lineTo(x+w/2+9+fw,y-16); ctx.lineTo(x+w/2,y-12); ctx.closePath(); ctx.fill();
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
  if(game.inBonus){ const s=Math.max(0,Math.ceil(game.bonusTimer)); ctx.font=Math.round(canvas.height*0.032)+'px "Hiragino Maru Gothic ProN",sans-serif'; ctx.textAlign='center'; ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillText('ボーナス '+s, canvas.width/2+1, pad+fs*1.7+1); ctx.fillStyle='#ffe24d'; ctx.fillText('ボーナス '+s, canvas.width/2, pad+fs*1.7); }
}
function dim(a){ ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle='rgba(8,12,30,'+a+')'; ctx.fillRect(0,0,canvas.width,canvas.height); }
function centerText(s,y,size,color,shadow){ ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font=size+'px "Press Start 2P", monospace'; if(shadow){ ctx.fillStyle=shadow; ctx.fillText(s,canvas.width/2+2,y+2); } ctx.fillStyle=color; ctx.fillText(s,canvas.width/2,y); }
function pauseButton(x,y,bw,bh,label,on,yes){
  const g=ctx.createLinearGradient(0,y-bh/2,0,y+bh/2);
  if(on){ if(yes){ g.addColorStop(0,'#ff8a6a'); g.addColorStop(1,'#e8531e'); } else { g.addColorStop(0,'#ffd24d'); g.addColorStop(1,'#f0991a'); } }
  else { g.addColorStop(0,'#67738c'); g.addColorStop(1,'#454f64'); }
  ctx.fillStyle=g; rr(ctx,x,y-bh/2,bw,bh,bh*0.28); ctx.fill();
  ctx.strokeStyle=on?'#ffffff':'rgba(0,0,0,0.4)'; ctx.lineWidth=on?3:2; rr(ctx,x,y-bh/2,bw,bh,bh*0.28); ctx.stroke();
  ctx.fillStyle=on?(yes?'#5a2406':'#7a3a06'):'rgba(255,255,255,0.88)';
  ctx.font='bold '+Math.round((canvas.height)*0.04)+'px "Baloo 2","Hiragino Maru Gothic ProN",sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(label,x+bw/2,y+1);
}
function drawPause(){ dim(0.58); const W=canvas.width,H=canvas.height; game._pauseHit=[];
  ctx.textAlign='center'; ctx.textBaseline='middle';
  if(game.pauseConfirm){
    centerText('マップにもどる？',H*0.27,Math.round(H*0.07),'#ffd23a','#7a4e06');
    ctx.font=Math.round(H*0.03)+'px "Hiragino Maru Gothic ProN",sans-serif'; ctx.fillStyle='#ffd0c0';
    ctx.fillText('いまの ステージは さいしょから になります', W/2, H*0.41);
    const opts=['もどる','つづける'], sel=game.confirmSel|0;
    const bw=H*0.4,bh=H*0.13,gap=H*0.06,total=bw*2+gap; let x=W/2-total/2; const y=H*0.57;
    for(let i=0;i<2;i++){ pauseButton(x,y,bw,bh,opts[i],i===sel,i===0); game._pauseHit.push({x,y:y-bh/2,w:bw,h:bh,act:i===0?'confirm-yes':'confirm-no'}); x+=bw+gap; }
    ctx.font=Math.round(H*0.026)+'px "Hiragino Maru Gothic ProN",sans-serif'; ctx.fillStyle='#cfe0ff'; ctx.fillText('タップ / \u2190 \u2192 でせんたく ・ ジャンプでけってい', W/2, H*0.74);
    return;
  }
  centerText('PAUSE',H*0.27,Math.round(H*0.08),'#ffd23a','#7a4e06');
  const opts=['つづける','マップにもどる'], sel=game.pauseSel|0;
  const bw=H*0.46,bh=H*0.13,gap=H*0.05,total=bw*2+gap; let x=W/2-total/2; const y=H*0.53;
  for(let i=0;i<2;i++){ pauseButton(x,y,bw,bh,opts[i],i===sel,false); game._pauseHit.push({x,y:y-bh/2,w:bw,h:bh,act:i===0?'resume':'retire'}); x+=bw+gap; }
  ctx.font=Math.round(H*0.026)+'px "Hiragino Maru Gothic ProN",sans-serif'; ctx.fillStyle='#cfe0ff'; ctx.fillText('タップ / \u2190 \u2192 でせんたく ・ ジャンプでけってい', W/2, H*0.74);
}
function drawGameOver(){ dim(0.62); const H=canvas.height; centerText('GAME OVER',H*0.4,Math.round(H*0.075),'#ff5d5d','#5a1010'); centerText('SCORE '+pad6(game.score),H*0.54,Math.round(H*0.036),'#fff','#000'); ctx.font=Math.round(H*0.026)+'px "Press Start 2P","Hiragino Maru Gothic ProN",sans-serif'; ctx.fillStyle='#cfe0ff'; ctx.textAlign='center'; if(Math.floor(animClock*2)%2===0) ctx.fillText('ENTER / タップ でリスタート',canvas.width/2,H*0.66); }
function drawWin(){ dim(0.5); for(const c of game.confetti) c.draw(); const H=canvas.height; const by=H*0.4+Math.sin(animClock*3)*6; centerText('YOU WIN!',by,Math.round(H*0.085),'#ffd23a','#b9780c'); ctx.font=Math.round(H*0.034)+'px "Press Start 2P","Hiragino Maru Gothic ProN",sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#000'; ctx.fillText('クリアおめでとう！',canvas.width/2+1,H*0.55+1); ctx.fillStyle='#fff'; ctx.fillText('クリアおめでとう！',canvas.width/2,H*0.55); centerText('SCORE '+pad6(game.score),H*0.64,Math.round(H*0.03),'#bfe9ff','#000'); ctx.font=Math.round(H*0.024)+'px "Press Start 2P","Hiragino Maru Gothic ProN",sans-serif'; ctx.fillStyle='#cfe0ff'; if(Math.floor(animClock*2)%2===0) ctx.fillText('ENTER / タップ でもう一度',canvas.width/2,H*0.74); }
function drawClearOverlay(){ const H=canvas.height, W=canvas.width, t=animClock; ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle='rgba(8,12,30,0.30)'; ctx.fillRect(0,0,W,H);
  const fwc=['#ffd34d','#ff7a3a','#7cc0ff','#ff9ad2','#7be06a'];
  for(let k=0;k<4;k++){ const cyc=(t*0.55+k*0.27)%1, fx=W*(0.18+0.64*(((k*0.37)+0.13)%1)), fy=H*(0.18+0.26*(((k*0.53)+0.2)%1)), rad=cyc*H*0.17, al=Math.max(0,1-cyc); const col=fwc[k%fwc.length];
    ctx.save(); ctx.globalAlpha=al*0.9; ctx.strokeStyle=col; ctx.lineWidth=2; for(let i=0;i<12;i++){ const a=i/12*6.28; ctx.beginPath(); ctx.moveTo(fx+Math.cos(a)*rad*0.5, fy+Math.sin(a)*rad*0.5); ctx.lineTo(fx+Math.cos(a)*rad, fy+Math.sin(a)*rad); ctx.stroke(); }
    ctx.fillStyle=col; for(let i=0;i<12;i++){ const a=i/12*6.28; ctx.beginPath(); ctx.arc(fx+Math.cos(a)*rad, fy+Math.sin(a)*rad,1.7,0,7); ctx.fill(); } ctx.restore(); }
  const by=H*0.34+Math.sin(t*4)*4, txt='ステージクリア！';
  ctx.font='bold '+Math.round(H*0.06)+'px "Baloo 2","Hiragino Maru Gothic ProN",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  const tw=ctx.measureText(txt).width+H*0.18, bx=W/2-tw/2, bh=H*0.115, byy=by-bh*0.55;
  const g=ctx.createLinearGradient(0,byy,0,byy+bh); g.addColorStop(0,'#ffd24d'); g.addColorStop(1,'#f0991a'); ctx.fillStyle=g; rr(ctx,bx,byy,tw,bh,bh*0.3); ctx.fill();
  ctx.strokeStyle='#9e5a12'; ctx.lineWidth=3; rr(ctx,bx,byy,tw,bh,bh*0.3); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.3)'; rr(ctx,bx+5,byy+4,tw-10,bh*0.26,bh*0.13); ctx.fill();
  star(bx+bh*0.55, byy+bh*0.5, bh*0.3, '#fff', '#d98a10'); star(bx+tw-bh*0.55, byy+bh*0.5, bh*0.3, '#fff', '#d98a10');
  ctx.fillStyle='#7a3a06'; ctx.fillText(txt, W/2+1.5, by+1.5); ctx.fillStyle='#fff'; ctx.fillText(txt, W/2, by);
  if(game.clearPhase==='tally'){ ctx.font='bold '+Math.round(H*0.03)+'px "Baloo 2","Hiragino Maru Gothic ProN",sans-serif';
    ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillText('タイムボーナス', W/2+1, H*0.52+1); ctx.fillStyle='#fff'; ctx.fillText('タイムボーナス', W/2, H*0.52);
    ctx.font=Math.round(H*0.032)+'px "Press Start 2P","Baloo 2",monospace'; ctx.fillStyle='#ffd23a'; ctx.fillText('SCORE '+pad6(game.score), W/2, H*0.6); }
}
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
  const dn=(DIFFICULTY[game.difficulty]||DIFFICULTY[0]).name, dy=H*0.55;
  ctx.font=(ts*0.6)+'px "Hiragino Maru Gothic ProN",sans-serif'; ctx.fillStyle='#ffd84d'; ctx.fillText('\u25c0',W*0.30,dy); ctx.fillText('\u25b6',W*0.70,dy);
  ctx.font=(ts*0.32)+'px "Hiragino Maru Gothic ProN",sans-serif'; ctx.fillStyle='#fff'; ctx.fillText('なんいど : '+dn,W/2,dy);
  ctx.font=(ts*0.2)+'px "Hiragino Maru Gothic ProN",sans-serif'; ctx.fillStyle='rgba(255,255,255,0.75)'; ctx.fillText('\u2190 \u2192 でへんこう',W/2,dy+ts*0.4);
  if(Math.floor(t*2)%2===0){ ctx.font=(ts*0.3)+'px "Press Start 2P","Hiragino Maru Gothic ProN",sans-serif'; ctx.fillStyle='#fff'; ctx.fillText('PRESS ENTER  /  タップでスタート',W/2,H*0.66); }
  ctx.font=(ts*0.24)+'px "Hiragino Maru Gothic ProN",sans-serif'; ctx.fillStyle='rgba(255,255,255,0.85)'; ctx.fillText('\u2190 \u2192 移動  \u30fb  SPACE ジャンプ  \u30fb  X ダッシュ/ファイア',W/2,H*0.74);
}

function renderTitle(){
  ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,canvas.width,canvas.height);
  const th = game.theme || THEMES.overworld;
  drawSky(th);
  drawTitle();
}

function drawZones(){ if(!game.zones||!game.zones.length) return; const t=animClock;
  for(const z of game.zones){
    if(z.kind==='conveyor'){
      ctx.save(); ctx.beginPath(); ctx.rect(z.x,z.y-1,z.w,5); ctx.clip();
      ctx.fillStyle='rgba(255,210,58,0.55)'; const off=((t*40*z.dir)%16+16)%16;
      for(let x=z.x-16;x<z.x+z.w+16;x+=16){ const cx=x+off; ctx.beginPath();
        if(z.dir>0){ ctx.moveTo(cx,z.y); ctx.lineTo(cx+5,z.y+2); ctx.lineTo(cx,z.y+4);} else { ctx.moveTo(cx+5,z.y); ctx.lineTo(cx,z.y+2); ctx.lineTo(cx+5,z.y+4);} ctx.fill(); }
      ctx.restore();
    } else if(z.kind==='current'){
      ctx.save(); ctx.globalAlpha=0.5; ctx.strokeStyle='#cdeeff'; ctx.lineWidth=1.6; ctx.lineCap='round';
      const dx=z.dx||0, dy=z.dy||0, cols=4, rows=4;
      for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){
        const baseX=z.x+(i+0.5)*z.w/cols, baseY=z.y+(j+0.5)*z.h/rows;
        const ph=((t*0.8+ i*0.13 + j*0.21)%1);
        const ax=baseX + dx*(ph-0.5)*z.w/cols*1.4, ay=baseY + dy*(ph-0.5)*z.h/rows*1.4;
        ctx.globalAlpha=0.5*(1-Math.abs(ph-0.5)*1.6);
        ctx.beginPath(); ctx.moveTo(ax-dx*4,ay-dy*4); ctx.lineTo(ax,ay); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(ax-dx*3+dy*2,ay-dy*3-dx*2); ctx.moveTo(ax,ay); ctx.lineTo(ax-dx*3-dy*2,ay-dy*3+dx*2); ctx.stroke();
      }
      ctx.restore();
    } else if(z.kind==='wind'){
      ctx.save(); ctx.globalAlpha=0.42; ctx.strokeStyle='#ffffff'; ctx.lineWidth=1.4; ctx.lineCap='round';
      for(let i=0;i<10;i++){ const len=8+(i%3)*5; const ax=z.x+(((i*61 + t*130*z.dir)%z.w)+z.w)%z.w, ay=z.y+((i*53)%z.h);
        ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(ax+z.dir*len,ay); ctx.stroke(); }
      ctx.restore();
    }
  }
}

function renderStage(){
  ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,canvas.width,canvas.height);
  const th = game.theme || THEMES.overworld;
  drawSky(th);
  if(!game.grid){ drawTitle(); return; }
  drawMountains(th);
  worldTransform(0.55); drawHills(th);
  worldTransform(0.35); drawClouds(th);
  worldTransform(1); drawBushes(th); drawTiles(th); drawGoal(th); drawZones();
  for(const cp of game.checkpoints) drawCheckpoint(cp);
  for(const pf of game.platforms) pf.draw();
  for(const it of game.items) it.draw();
  for(const hz of game.hazards) hz.draw();
  for(const e of game.enemies) e.draw();
  if(game.boss) game.boss.draw();
  for(const f of game.fireballs) f.draw();
  for(const p of game.particles) p.draw();
  if(game.player) game.player.draw();
  for(const pc of game.popcoins) pc.draw();
  for(const pu of game.popups) pu.draw();
  ctx.setTransform(1,0,0,1,0,0);
  if(game.water){ ctx.fillStyle='rgba(40,120,180,0.14)'; ctx.fillRect(0,0,canvas.width,canvas.height); }
  drawHUD();
  if(game.boss && !game.boss.dead) drawBossHP();
  if(game.state==='paused') drawPause();
  else if(game.state==='levelclear') drawClearOverlay();
  else if(game.state==='gameover') drawGameOver();
  else if(game.state==='win') drawWin();
}

export { centerText, dim, drawBrick, drawBush, drawBushes, drawCastle, drawClearOverlay, drawCloud, drawClouds, drawCoinHUD, drawCoinTile, drawGameOver, drawGoal, drawGround, drawHUD, drawHills, drawLifeHUD, drawPause, drawPipe, drawQuestion, drawSky, drawStone, drawTile, drawTiles, drawTitle, drawUsed, drawWin, pad6, renderStage, renderTitle };
