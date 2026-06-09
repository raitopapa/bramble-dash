import { DIFFICULTY, THEMES } from '../core/constants.js';
import { clamp } from '../core/utils.js';
import { drawCoin, drawCreature } from './creatures.js';
import { camH, camW, canvas, ctx, ellipse, rr, worldTransform } from '../engine/canvas.js';
import { animClock } from '../engine/loop.js';
import { bumpOffset, crumbleOffset, game, gget, solidTile } from '../game/state.js';

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
function drawCheckpoint(cp){ const x=cp.x, baseY=cp.y+16, topY=cp.y-32, t=animClock;
  ctx.strokeStyle='#9aa3b3'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x,baseY); ctx.lineTo(x,topY); ctx.stroke();
  ctx.fillStyle='#cfd6e2'; ctx.beginPath(); ctx.arc(x,topY,3,0,7); ctx.fill();
  const wav = cp.active ? Math.sin(t*6)*2 : 0;
  ctx.fillStyle = cp.active ? '#3ad36a' : '#9aa0a8';
  ctx.beginPath(); ctx.moveTo(x,topY+2); ctx.lineTo(x+13,topY+5+wav); ctx.lineTo(x,topY+10); ctx.closePath(); ctx.fill();
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
function renderStage(){
  ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,canvas.width,canvas.height);
  const th = game.theme || THEMES.overworld;
  drawSky(th);
  if(!game.grid){ drawTitle(); return; }
  worldTransform(0.55); drawHills(th);
  worldTransform(0.35); drawClouds(th);
  worldTransform(1); drawBushes(th); drawTiles(th); drawGoal(th);
  for(const cp of game.checkpoints) drawCheckpoint(cp);
  for(const pf of game.platforms) pf.draw();
  for(const it of game.items) it.draw();
  for(const hz of game.hazards) hz.draw();
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

export { centerText, dim, drawBrick, drawBush, drawBushes, drawCastle, drawClearOverlay, drawCloud, drawClouds, drawCoinHUD, drawCoinTile, drawGameOver, drawGoal, drawGround, drawHUD, drawHills, drawLifeHUD, drawPause, drawPipe, drawQuestion, drawSky, drawStone, drawTile, drawTiles, drawTitle, drawUsed, drawWin, pad6, renderStage, renderTitle };
