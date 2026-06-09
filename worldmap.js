import { canvas, ctx, ellipse, rr } from '../engine/canvas.js';
import { game } from '../game/state.js';
import { edge, inputBegin, inputEnd } from '../core/input.js';
import { startLevel } from '../game/flow.js';
import { MAP_NODES } from '../content/worldmap.js';
import { drawCreature } from '../draw/creatures.js';
import { animClock } from '../engine/loop.js';
import { sfxCoin, sfxJump, setMusicTrack } from '../engine/audio.js';

const NODE_ACCENT=['#57c84d','#57c84d','#5aa6ff','#5aa6ff','#ff8ad2','#b06aff','#b06aff'];
function mapStar(cx,cy,r,fill,stroke){ ctx.beginPath(); for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, rad=(i%2)?r*0.45:r, x=cx+Math.cos(a)*rad, y=cy+Math.sin(a)*rad; i?ctx.lineTo(x,y):ctx.moveTo(x,y);} ctx.closePath(); ctx.fillStyle=fill; ctx.fill(); if(stroke){ ctx.strokeStyle=stroke; ctx.lineWidth=1; ctx.stroke(); } }

class WorldMapScene{
  enter(){ this.t=0; this.vx=null; this.vy=null; setMusicTrack('map'); }
  nodePos(i){ const n=MAP_NODES[i]; return { x:n.nx*canvas.width, y:n.ny*canvas.height }; }
  unlocked(i){ return i <= (game.mapMaxUnlocked|0); }
  accent(i){ return NODE_ACCENT[i]||'#ffd23a'; }
  update(dt){
    inputBegin();
    const cur = game.mapNode|0;
    if(edge.left && cur>0){ game.mapNode=cur-1; sfxJump(); }
    else if(edge.right && cur<MAP_NODES.length-1 && this.unlocked(cur+1)){ game.mapNode=cur+1; sfxJump(); }
    else if(edge.jump || edge.start){ sfxCoin(); startLevel(game.mapNode|0); }
    inputEnd();
    this.t += dt;
    const p = this.nodePos(game.mapNode|0);
    if(this.vx==null){ this.vx=p.x; this.vy=p.y; }
    this.vx += (p.x-this.vx)*0.25; this.vy += (p.y-this.vy)*0.25;
  }
  cloud(x,y,r){ ctx.fillStyle='rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.arc(x+r,y+r*0.25,r*0.8,0,7); ctx.arc(x-r,y+r*0.25,r*0.75,0,7); ctx.fill(); ctx.fillRect(x-r,y+r*0.2,r*2,r*0.7); }
  hillBand(y,color,spd,amp){ const W=canvas.width,H=canvas.height; ctx.fillStyle=color; ctx.beginPath(); ctx.moveTo(0,H); for(let x=0;x<=W;x+=12){ const yy=y-Math.sin(x*0.004+spd)*amp-Math.sin(x*0.011+spd)*amp*0.4; ctx.lineTo(x,yy);} ctx.lineTo(W,H); ctx.closePath(); ctx.fill(); }
  render(){
    const W=canvas.width, H=canvas.height, t=animClock;
    ctx.setTransform(1,0,0,1,0,0);
    const sky=ctx.createLinearGradient(0,0,0,H); sky.addColorStop(0,'#ffe1b4'); sky.addColorStop(0.42,'#bfe6ff'); sky.addColorStop(1,'#e9f8ff'); ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
    const sx=W*0.16, sy=H*0.2; const sg=ctx.createRadialGradient(sx,sy,4,sx,sy,H*0.55); sg.addColorStop(0,'rgba(255,246,205,0.95)'); sg.addColorStop(1,'rgba(255,246,205,0)'); ctx.fillStyle=sg; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(255,255,255,0.92)'; ctx.beginPath(); ctx.arc(sx,sy,H*0.05,0,7); ctx.fill();
    for(let i=0;i<5;i++){ const x=(((i*0.26+t*0.008)%1.25)-0.12)*W, y=H*(0.12+i*0.055); this.cloud(x,y,H*0.026); }
    this.hillBand(H*0.64,'#cdeccf',0.0,H*0.045);
    this.hillBand(H*0.71,'#9bdf94',1.7,H*0.05);
    ctx.fillStyle='#6cc756'; ctx.fillRect(0,H*0.75,W,H*0.25); ctx.fillStyle='#57b246'; ctx.fillRect(0,H*0.75,W,H*0.018);
    ctx.fillStyle='rgba(70,150,230,0.8)'; ellipse(W*0.66,H*0.92,W*0.12,H*0.045); ctx.fillStyle='rgba(255,255,255,0.4)'; ellipse(W*0.62,H*0.905,W*0.03,H*0.01);
    this.drawPaths();
    const last=MAP_NODES[MAP_NODES.length-1]; this.drawCastle(last.nx*W + W*0.085, last.ny*H + H*0.004);
    for(let i=0;i<MAP_NODES.length;i++) this.drawNode(i);
    if(this.vx!=null){ const bob=Math.abs(Math.sin(t*3))*H*0.012; const form=(game.player&&game.player.form)||'small'; drawCreature(this.vx, this.vy-H*0.018-bob, H*0.05, form, {facing:1,onGround:true,vy:0,walkPhase:t*5,blink:(t%3>2.85)}); }
    this.banner(W/2,H*0.13,'ワールドマップ');
    ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font=Math.round(H*0.027)+'px "Baloo 2","Hiragino Maru Gothic ProN",sans-serif';
    if(Math.floor(t*2)%2===0){ ctx.fillStyle='rgba(20,40,70,0.55)'; ctx.fillText('\u2190 \u2192 でせんたく ・ ジャンプでスタート', W/2, H*0.95); }
    const lv=(game.lives<0?0:game.lives), hx=H*0.04, hy=H*0.06, r=H*0.022;
    ctx.fillStyle='rgba(0,0,0,0.28)'; rr(ctx,hx-r*0.5,hy-r,r*3.4,r*2,r); ctx.fill();
    ctx.fillStyle='#ff5d6c'; ctx.beginPath(); const cxh=hx+r*0.7, cyh=hy; ctx.moveTo(cxh,cyh+r*0.6); ctx.bezierCurveTo(cxh-r*0.9,cyh-r*0.4,cxh-r*0.2,cyh-r*0.9,cxh,cyh-r*0.3); ctx.bezierCurveTo(cxh+r*0.2,cyh-r*0.9,cxh+r*0.9,cyh-r*0.4,cxh,cyh+r*0.6); ctx.fill();
    ctx.fillStyle='#fff'; ctx.textAlign='left'; ctx.textBaseline='middle'; ctx.font='bold '+Math.round(H*0.034)+'px "Baloo 2",sans-serif'; ctx.fillText('\u00d7'+lv, hx+r*1.5, hy);
  }
  drawPaths(){ const pts=MAP_NODES.map((_,i)=>this.nodePos(i)); const H=canvas.height;
    ctx.lineCap='round'; ctx.lineJoin='round';
    const seg=(i)=>{ ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); const mx=(pts[i].x+pts[i+1].x)/2, my=(pts[i].y+pts[i+1].y)/2-H*0.05; ctx.quadraticCurveTo(mx,my,pts[i+1].x,pts[i+1].y); ctx.stroke(); };
    for(let i=0;i<pts.length-1;i++){ const open=this.unlocked(i+1); ctx.strokeStyle= open?'#caa46a':'rgba(120,122,132,0.4)'; ctx.lineWidth=H*0.028; seg(i); }
    for(let i=0;i<pts.length-1;i++){ if(!this.unlocked(i+1))continue; ctx.strokeStyle='#f0dcae'; ctx.lineWidth=H*0.018; seg(i); }
    ctx.setLineDash([H*0.012,H*0.012]); ctx.strokeStyle='rgba(255,255,255,0.85)'; ctx.lineWidth=H*0.0045;
    for(let i=0;i<pts.length-1;i++){ if(!this.unlocked(i+1))continue; seg(i); } ctx.setLineDash([]);
  }
  drawNode(i){ const p=this.nodePos(i), R=canvas.height*0.036, acc=this.accent(i);
    const cur=(game.mapNode|0)===i, cleared=!!(game.mapCleared&&game.mapCleared[i]), locked=!this.unlocked(i), boss=(i===MAP_NODES.length-1);
    ctx.fillStyle='rgba(0,0,0,0.18)'; ellipse(p.x,p.y+R*0.92,R*0.92,R*0.32);
    const g=ctx.createLinearGradient(0,p.y-R,0,p.y+R); if(locked){ g.addColorStop(0,'#c4c9d1'); g.addColorStop(1,'#969ba3'); } else { g.addColorStop(0,'#ffffff'); g.addColorStop(1,'#e7eef6'); }
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,R,0,7); ctx.fill();
    ctx.strokeStyle= locked?'#7a808a':acc; ctx.lineWidth=R*0.2; ctx.beginPath(); ctx.arc(p.x,p.y,R*0.87,0,7); ctx.stroke();
    ctx.strokeStyle='rgba(0,0,0,0.22)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(p.x,p.y,R,0,7); ctx.stroke();
    ctx.textAlign='center'; ctx.textBaseline='middle';
    if(boss && !locked){ ctx.fillStyle='#ffcf3f'; const cw=R*0.92, x0=p.x-cw/2, y0=p.y-R*0.12; ctx.beginPath(); ctx.moveTo(x0,y0+R*0.42); ctx.lineTo(x0,y0); ctx.lineTo(x0+cw*0.25,y0+R*0.22); ctx.lineTo(x0+cw*0.5,y0-R*0.2); ctx.lineTo(x0+cw*0.75,y0+R*0.22); ctx.lineTo(x0+cw,y0); ctx.lineTo(x0+cw,y0+R*0.42); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#b6860a'; ctx.lineWidth=1; ctx.stroke(); ctx.fillStyle='#e23b50'; ctx.beginPath(); ctx.arc(p.x,p.y+R*0.5,R*0.12,0,7); ctx.fill(); }
    else if(cleared){ mapStar(p.x,p.y,R*0.52,'#ffd24d','#b9780c'); }
    else if(locked){ ctx.fillStyle='#5f656d'; rr(ctx,p.x-R*0.34,p.y-R*0.04,R*0.68,R*0.5,2); ctx.fill(); ctx.strokeStyle='#5f656d'; ctx.lineWidth=R*0.15; ctx.beginPath(); ctx.arc(p.x,p.y-R*0.06,R*0.26,Math.PI,0); ctx.stroke(); ctx.fillStyle='#33373e'; ctx.beginPath(); ctx.arc(p.x,p.y+R*0.14,R*0.07,0,7); ctx.fill(); }
    else { ctx.fillStyle=acc; ctx.font='bold '+Math.round(R*0.95)+'px "Baloo 2","Hiragino Maru Gothic ProN",sans-serif'; ctx.fillText(String(i+1),p.x,p.y+R*0.05); }
    if(cur){ const pr=R+canvas.height*0.014+Math.sin(animClock*5)*canvas.height*0.004; ctx.strokeStyle='#ffd23a'; ctx.lineWidth=R*0.16; ctx.beginPath(); ctx.arc(p.x,p.y,pr,0,7); ctx.stroke();
      const ay=p.y-pr-canvas.height*0.018-Math.abs(Math.sin(animClock*4))*canvas.height*0.006; ctx.fillStyle='#ffd23a'; ctx.beginPath(); ctx.moveTo(p.x-R*0.3,ay); ctx.lineTo(p.x+R*0.3,ay); ctx.lineTo(p.x,ay+R*0.34); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#b9780c'; ctx.lineWidth=1; ctx.stroke(); }
    const nm=MAP_NODES[i].name||''; ctx.font='bold '+Math.round(R*0.5)+'px "Baloo 2","Hiragino Maru Gothic ProN",sans-serif'; const tw=ctx.measureText(nm).width+R*0.6;
    ctx.fillStyle='rgba(20,30,50,0.42)'; rr(ctx,p.x-tw/2,p.y+R*1.18,tw,R*0.72,R*0.36); ctx.fill();
    ctx.fillStyle='#fff'; ctx.fillText(nm,p.x,p.y+R*1.18+R*0.4);
  }
  drawCastle(x,y){ const W=canvas.width, w=W*0.058, h=w*1.0, top=y-h;
    ctx.fillStyle='rgba(0,0,0,0.15)'; ellipse(x+w*0.5,y+h*0.06,w*0.7,h*0.12);
    ctx.fillStyle='#9c8158'; ctx.fillRect(x-w*0.12,top+h*0.12,w*0.2,h*0.95); ctx.fillRect(x+w*0.92,top+h*0.12,w*0.2,h*0.95);
    const wall=ctx.createLinearGradient(0,top,0,y); wall.addColorStop(0,'#d8c6a4'); wall.addColorStop(1,'#b59a72'); ctx.fillStyle=wall; ctx.fillRect(x,top,w,h);
    ctx.fillStyle='#8a7048'; for(let i=-0.12;i<1.1;i+=0.22) ctx.fillRect(x+w*i,top-h*0.08,w*0.12,h*0.1);
    ctx.fillStyle='#7a5a3a'; ctx.beginPath(); ctx.moveTo(x+w*0.34,y); ctx.lineTo(x+w*0.34,top+h*0.5); ctx.arc(x+w*0.5,top+h*0.5,w*0.16,Math.PI,0); ctx.lineTo(x+w*0.66,y); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#3a2a44'; rr(ctx,x+w*0.12,top+h*0.22,w*0.16,h*0.22,3); ctx.fill(); rr(ctx,x+w*0.72,top+h*0.22,w*0.16,h*0.22,3); ctx.fill();
    ctx.fillStyle='#3aa33a'; ctx.fillRect(x+w*0.49,top-h*0.34,w*0.04,h*0.26); const fw=Math.sin(animClock*5)*2; ctx.fillStyle='#ff4d4d'; ctx.beginPath(); ctx.moveTo(x+w*0.5,top-h*0.34); ctx.lineTo(x+w*0.5+w*0.34+fw,top-h*0.26); ctx.lineTo(x+w*0.5,top-h*0.18); ctx.closePath(); ctx.fill();
  }
  banner(cx,cy,text){ const H=canvas.height; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font='bold '+Math.round(H*0.05)+'px "Baloo 2","Hiragino Maru Gothic ProN",sans-serif';
    const w=ctx.measureText(text).width+H*0.12, h=H*0.084, x=cx-w/2, y=cy-h/2;
    ctx.fillStyle='#c2581f'; ctx.beginPath(); ctx.moveTo(x,y+h*0.1); ctx.lineTo(x-H*0.05,y+h/2); ctx.lineTo(x,y+h*0.9); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(x+w,y+h*0.1); ctx.lineTo(x+w+H*0.05,y+h/2); ctx.lineTo(x+w,y+h*0.9); ctx.closePath(); ctx.fill();
    const g=ctx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,'#ffb14d'); g.addColorStop(1,'#ef7a1e'); ctx.fillStyle=g; rr(ctx,x,y,w,h,h*0.28); ctx.fill();
    ctx.strokeStyle='#9e3f12'; ctx.lineWidth=2; rr(ctx,x,y,w,h,h*0.28); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.3)'; rr(ctx,x+4,y+3,w-8,h*0.26,h*0.13); ctx.fill();
    ctx.fillStyle='#fff'; ctx.fillText(text,cx,cy+1); ctx.strokeStyle='rgba(120,50,10,0.5)'; ctx.lineWidth=0.6; ctx.strokeText(text,cx,cy+1);
  }
}

export { WorldMapScene };
