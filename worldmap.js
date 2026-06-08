import { canvas, ctx, ellipse } from '../engine/canvas.js';
import { game } from '../game/state.js';
import { edge, inputBegin, inputEnd } from '../core/input.js';
import { startLevel } from '../game/flow.js';
import { MAP_NODES } from '../content/worldmap.js';
import { drawCreature } from '../draw/creatures.js';
import { animClock } from '../engine/loop.js';
import { sfxCoin, sfxJump } from '../engine/audio.js';

class WorldMapScene{
  enter(){ this.t=0; this.vx=null; this.vy=null; }
  nodePos(i){ const n=MAP_NODES[i]; return { x:n.nx*canvas.width, y:n.ny*canvas.height }; }
  unlocked(i){ return i <= (game.mapMaxUnlocked|0); }
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
  render(){
    const W=canvas.width, H=canvas.height, t=animClock;
    ctx.setTransform(1,0,0,1,0,0);
    const sky=ctx.createLinearGradient(0,0,0,H); sky.addColorStop(0,'#8fd0ff'); sky.addColorStop(1,'#dff4ff');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(255,255,255,0.9)'; for(let i=0;i<4;i++){ const x=((i*0.28+t*0.01)%1.1)*W, y=H*(0.13+i*0.05), r=H*0.025; ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.arc(x+r,y+r*0.3,r*0.8,0,7); ctx.arc(x-r,y+r*0.3,r*0.8,0,7); ctx.fill(); ctx.fillRect(x-r*2,y+r*0.4,r*4,r*0.7); }
    ctx.fillStyle='#7cc86a'; for(let i=0;i<4;i++){ const hx=W*(0.1+i*0.27), w=W*0.36, hh=H*0.2; ctx.beginPath(); ctx.moveTo(hx-w/2,H*0.82); ctx.quadraticCurveTo(hx,H*0.82-hh,hx+w/2,H*0.82); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle='#69c24a'; ctx.fillRect(0,H*0.80,W,H*0.20);
    ctx.fillStyle='#4ea83a'; ctx.fillRect(0,H*0.80,W,H*0.025);
    ctx.fillStyle='rgba(70,150,230,0.85)'; ellipse(W*0.62,H*0.90,W*0.12,H*0.05);
    ctx.fillStyle='rgba(255,255,255,0.35)'; ellipse(W*0.58,H*0.885,W*0.03,H*0.012);
    this.drawPaths();
    const last=MAP_NODES[MAP_NODES.length-1];
    this.drawCastle(last.nx*W + W*0.12, last.ny*H + H*0.01);
    for(let i=0;i<MAP_NODES.length;i++) this.drawNode(i);
    if(this.vx!=null){ const bob=Math.abs(Math.sin(t*3))*H*0.012; const form=(game.player&&game.player.form)||'small'; drawCreature(this.vx, this.vy-H*0.004-bob, H*0.052, form, {facing:1,onGround:true,vy:0,walkPhase:t*4,blink:(t%3>2.85)}); }
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.font=Math.round(H*0.06)+'px "Press Start 2P", monospace';
    ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillText('WORLD MAP', W/2+2, H*0.12+2);
    ctx.fillStyle='#ffd23a'; ctx.fillText('WORLD MAP', W/2, H*0.12);
    ctx.font=Math.round(H*0.022)+'px "Press Start 2P","Hiragino Maru Gothic ProN",sans-serif';
    if(Math.floor(t*2)%2===0){ ctx.fillStyle='#0b2a4a'; ctx.fillText('\u2190 \u2192 \u3067\u79fb\u52d5  \u30fb  SPACE \u3067\u30b9\u30c6\u30fc\u30b8\u3078', W/2, H*0.93); }
    ctx.textAlign='left'; ctx.textBaseline='top'; ctx.font=Math.round(H*0.034)+'px "Press Start 2P", monospace';
    const lv=(game.lives<0?0:game.lives);
    ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillText('\u2665'+lv, H*0.03+1, H*0.04+1);
    ctx.fillStyle='#ff5d5d'; ctx.fillText('\u2665', H*0.03, H*0.04);
    ctx.fillStyle='#fff'; ctx.fillText(' '+lv, H*0.03, H*0.04);
  }
  drawPaths(){
    for(let i=0;i<MAP_NODES.length-1;i++){
      const a=this.nodePos(i), b=this.nodePos(i+1), open=this.unlocked(i+1), dots=11;
      for(let d=1;d<dots;d++){ const x=a.x+(b.x-a.x)*d/dots, y=a.y+(b.y-a.y)*d/dots;
        ctx.fillStyle = open ? '#caa46a' : 'rgba(110,110,120,0.4)';
        ctx.beginPath(); ctx.arc(x,y,Math.max(2,canvas.height*0.006),0,7); ctx.fill(); }
    }
  }
  drawNode(i){
    const p=this.nodePos(i), R=canvas.height*0.030;
    const cur=(game.mapNode|0)===i, cleared=!!(game.mapCleared && game.mapCleared[i]), locked=!this.unlocked(i);
    ctx.fillStyle = locked ? '#9aa0a8' : (cleared ? '#4ec24a' : '#ffffff');
    ctx.strokeStyle='#243018'; ctx.lineWidth=Math.max(1,R*0.12);
    ctx.beginPath(); ctx.arc(p.x,p.y,R,0,7); ctx.fill(); ctx.stroke();
    ctx.textAlign='center'; ctx.textBaseline='middle';
    if(cleared){ ctx.strokeStyle='#1c5e1c'; ctx.lineWidth=Math.max(2,R*0.2); ctx.beginPath(); ctx.moveTo(p.x-R*0.42,p.y); ctx.lineTo(p.x-R*0.05,p.y+R*0.38); ctx.lineTo(p.x+R*0.46,p.y-R*0.42); ctx.stroke(); }
    else if(locked){ ctx.fillStyle='#5f656d'; ctx.fillRect(p.x-R*0.32,p.y-R*0.02,R*0.64,R*0.5); ctx.strokeStyle='#5f656d'; ctx.lineWidth=Math.max(1,R*0.14); ctx.beginPath(); ctx.arc(p.x,p.y-R*0.04,R*0.24,Math.PI,0); ctx.stroke(); }
    else { ctx.fillStyle='#243018'; ctx.font=Math.round(R*0.95)+'px "Press Start 2P", monospace'; ctx.fillText(String(i+1), p.x, p.y+R*0.06); }
    if(cur){ const pr=R+canvas.height*0.012+Math.sin(animClock*5)*canvas.height*0.004; ctx.strokeStyle='#ffd23a'; ctx.lineWidth=Math.max(2,R*0.22); ctx.beginPath(); ctx.arc(p.x,p.y,pr,0,7); ctx.stroke(); }
    ctx.fillStyle='#0b2a4a'; ctx.font=Math.round(R*0.6)+'px "Press Start 2P","Hiragino Maru Gothic ProN",sans-serif'; ctx.textBaseline='top';
    ctx.fillText(MAP_NODES[i].name||'', p.x, p.y+R*1.3);
  }
  drawCastle(x,y){
    const W=canvas.width, w=W*0.05, h=w*0.95;
    ctx.fillStyle='#c9b89a'; ctx.fillRect(x-w/2,y-h,w,h);
    ctx.fillStyle='#b0a084'; for(let i=0;i<=w;i+=w/4) ctx.fillRect(x-w/2+i,y-h-w*0.08,w*0.12,w*0.1);
    ctx.fillStyle='#7a5a3a'; ctx.fillRect(x-w*0.13,y-h*0.5,w*0.26,h*0.5);
    ctx.fillStyle='#9a8a6a'; ctx.fillRect(x-w*0.36,y-h*0.62,w*0.16,w*0.2); ctx.fillRect(x+w*0.2,y-h*0.62,w*0.16,w*0.2);
    ctx.fillStyle='#3aa33a'; ctx.fillRect(x-1,y-h-w*0.42,2,w*0.34);
    ctx.fillStyle='#ff4d4d'; ctx.beginPath(); ctx.moveTo(x+1,y-h-w*0.42); ctx.lineTo(x+w*0.22,y-h-w*0.3); ctx.lineTo(x+1,y-h-w*0.18); ctx.closePath(); ctx.fill();
  }
}

export { WorldMapScene };
