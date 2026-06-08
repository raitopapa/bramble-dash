import { COYOTE, GRAVITY, GRAVITY_E, GROWANIM, HOLD_G, INVINC, JBUF, JUMP_V, MAXFALL } from '../core/constants.js';
import { edge, input } from '../core/input.js';
import { clamp, lerp, rand } from '../core/utils.js';
import { drawCoin, drawCreature, shellDome } from '../draw/creatures.js';
import { duckMusic, sfxBump, sfxDie, sfxFire, sfxJump, sfxKick, sfxPowerup, sfxShrink } from '../engine/audio.js';
import { camW, ctx, ellipse, rr, scale } from '../engine/canvas.js';
import { collideX, collideY, countFB, game, solidTile, spawnDust, spawnFireball, spawnSpark } from './state.js';

// ============ PLAYER ============
class Player{
  constructor(){ this.form='small'; this.sizeFromForm(); this.x=0; this.y=0; this.vx=0; this.vy=0;
    this.facing=1; this.onGround=false; this.jumping=false; this.jumpHeld=false; this.coyote=0; this.jumpBuffer=0;
    this.invinc=0; this.growT=0; this.combo=0; this.crouch=false; this.dead=false; this.onPole=false;
    this.walkPhase=0; this.blink=false; this.blinkT=2; this.landT=0; this._lastGround=false; }
  sizeFromForm(){ if(this.form==='small'){ this.w=12; this.h=14; } else { this.w=12; this.h=24; } }
  setSizeKeepFeet(){ const feet=this.y+this.h; this.sizeFromForm(); this.y=feet-this.h; }
  resetForLevel(lvl){ this.sizeFromForm(); this.x=lvl.spawnX; this.y=lvl.spawnFeetY-this.h; this.vx=0; this.vy=0;
    this.facing=1; this.onGround=false; this.jumping=false; this.coyote=0; this.jumpBuffer=0; this.invinc=0; this.growT=0;
    this.combo=0; this.crouch=false; this.dead=false; this.onPole=false; this.walkPhase=0; this.blink=false; this.blinkT=rand(2,4); this.landT=0; this._lastGround=false; }
  grow(){ if(this.form==='small'){ this.form='big'; this.setSizeKeepFeet(); this.growT=GROWANIM; this.invinc=Math.max(this.invinc,0.6); sfxPowerup(); spawnSpark(this.x+this.w/2,this.y+this.h/2,'#fff'); } }
  toFire(){ this.form='fire'; this.setSizeKeepFeet(); this.growT=GROWANIM; this.invinc=Math.max(this.invinc,0.6); sfxPowerup(); spawnSpark(this.x+this.w/2,this.y+this.h/2,'#ffae3a'); }
  hurt(){ if(this.invinc>0||this.dead) return;
    if(this.form==='fire'){ this.form='big'; this.setSizeKeepFeet(); this.invinc=INVINC; sfxShrink(); spawnSpark(this.x+this.w/2,this.y,'#fff'); }
    else if(this.form==='big'){ this.form='small'; this.setSizeKeepFeet(); this.invinc=INVINC; sfxShrink(); spawnSpark(this.x+this.w/2,this.y,'#fff'); }
    else this.die();
  }
  die(){ if(this.dead) return; this.dead=true; game.lives--; game.state='dying'; game.deathTimer=1.8; this.vx=0; this.vy=-6.6; duckMusic(0); sfxDie(); }
  update(dt){
    if(this.invinc>0) this.invinc-=dt;
    if(this.growT>0) this.growT-=dt;
    if(this.landT>0) this.landT-=dt;
    this.blinkT-=dt; if(this.blinkT<=0){ if(this.blink){ this.blink=false; this.blinkT=rand(1.6,4.5); } else { this.blink=true; this.blinkT=0.12; } }
    this.crouch = (this.form!=='small' && input.down && this.onGround && Math.abs(this.vx)<0.7);
    const running=input.fire, onG=this.onGround;
    const maxWalk=1.7, maxRun=2.95, maxS=running?maxRun:maxWalk;
    const accel = onG?(running?0.235:0.16):0.12;
    let dir=0; if(input.left) dir=-1; else if(input.right) dir=1;
    if(this.crouch) dir=0;
    if(dir!==0){ this.facing=dir; if(Math.sign(this.vx)!==dir || Math.abs(this.vx)<maxS) this.vx+=accel*dir; }
    else { const f=onG?0.2:0.05; if(this.vx>0){ this.vx-=f; if(this.vx<0)this.vx=0; } else if(this.vx<0){ this.vx+=f; if(this.vx>0)this.vx=0; } }
    if(this.vx>maxS && onG && dir>=0) this.vx=Math.max(maxS,this.vx-0.08);
    if(this.vx<-maxS && onG && dir<=0) this.vx=Math.min(-maxS,this.vx+0.08);
    this.vx=clamp(this.vx,-maxRun,maxRun);
    if(onG) this.coyote=COYOTE; else if(this.coyote>0) this.coyote--;
    if(edge.jump) this.jumpBuffer=JBUF; else if(this.jumpBuffer>0) this.jumpBuffer--;
    if(this.jumpBuffer>0 && (onG||this.coyote>0)){ this.vy=-JUMP_V; this.onGround=false; this.coyote=0; this.jumpBuffer=0; this.jumping=true; sfxJump(); spawnDust(this.x+this.w/2,this.y+this.h); }
    this.jumpHeld=input.jump;
    if(this.vy<0 && !this.jumpHeld && this.jumping){ this.vy*=0.45; this.jumping=false; }
    const g=(this.vy<0 && this.jumpHeld)?HOLD_G:GRAVITY;
    this.vy+=g; if(this.vy>MAXFALL) this.vy=MAXFALL;
    this._hitL=this._hitR=this._hitU=this._hitD=false; this.onGround=false;
    collideX(this); collideY(this,true);
    if(this._hitD) this.jumping=false;
    if(this.onGround && !this._lastGround){ this.landT=0.12; spawnDust(this.x+this.w/2,this.y+this.h); }
    this._lastGround=this.onGround;
    if(onG && Math.abs(this.vx)>0.3) this.walkPhase += Math.abs(this.vx)*dt*9;
    if(this.y > game.worldH+40){ this.die(); return; }
    if(this.form==='fire' && edge.fire && countFB()<2){ spawnFireball(this); sfxFire(); }
    if(this.onGround) this.combo=0;
  }
  draw(){
    if(this.invinc>0 && game.state==='playing' && Math.floor(this.invinc*16)%2===0) return;
    let sx=1, sy=1;
    if(!this.onGround){ if(this.vy<-0.5){ sy=1.12; sx=0.9; } else if(this.vy>1){ sy=0.95; sx=1.06; } }
    if(this.landT>0){ const k=this.landT/0.12; sy=1-0.16*k; sx=1+0.2*k; }
    if(this.growT>0){ const k=this.growT/GROWANIM; const w=Math.sin(k*Math.PI*4)*0.08*k; sx+=w; sy-=w; }
    const size = this.form==='small'?14:22;
    drawCreature(this.x+this.w/2, this.y+this.h, size, this.form, {facing:this.facing, onGround:this.onGround, vy:this.vy, walkPhase:this.walkPhase, blink:this.blink, crouch:this.crouch, sx, sy});
  }
}

// ============ ENEMIES ============
class Stomper{
  constructor(tx,ty){ this.type='stomper'; this.w=14; this.h=14; this.x=tx*16+1; this.y=(ty+1)*16-this.h; this.vx=0; this.vy=0; this.dir=-1; this.squash=0; this.dead=false; this.walk=0; }
  stomp(){ this.squash=0.4; this.vx=0; }
  update(dt){
    if(this.squash>0){ this.squash-=dt; if(this.squash<=0) this.dead=true; return; }
    this.walk+=dt*6; this.vx=this.dir*0.55; this.vy+=GRAVITY_E; if(this.vy>7)this.vy=7;
    this._hitL=this._hitR=this._hitD=false; this.onGround=false;
    collideX(this); if(this._hitL) this.dir=1; if(this._hitR) this.dir=-1;
    collideY(this,false);
    if(this.y>game.worldH+80) this.dead=true;
  }
  draw(){ const cx=this.x+this.w/2, feet=this.y+this.h;
    ctx.fillStyle='rgba(0,0,0,0.18)'; ellipse(cx,feet+1.5,this.w*0.5,2.2);
    if(this.squash>0){ ctx.fillStyle='#9a5230'; rr(ctx,cx-8,feet-5,16,5,2.5); ctx.fill(); ctx.strokeStyle='#5a2e15'; ctx.lineWidth=1; rr(ctx,cx-8,feet-5,16,5,2.5); ctx.stroke(); return; }
    const wob=Math.sin(this.walk);
    ctx.fillStyle='#6e3a1f'; ellipse(cx-4.5,feet-1-(wob>0?1:0),3.2,2.2); ellipse(cx+4.5,feet-1-(wob<0?1:0),3.2,2.2);
    ctx.fillStyle='#a85c2e'; rr(ctx,cx-7,feet-13,14,13,6); ctx.fill();
    ctx.save(); ctx.globalAlpha=0.22; ctx.fillStyle='#6e3a1f'; rr(ctx,cx-7,feet-6.5,14,6.5,5); ctx.fill(); ctx.restore();
    ctx.fillStyle='#fff'; ellipse(cx-3.2,feet-8.6,2.4,2.9); ellipse(cx+3.2,feet-8.6,2.4,2.9);
    ctx.fillStyle='#1a1008'; const lk=this.dir*0.8; ellipse(cx-3.2+lk,feet-8.1,1.1,1.5); ellipse(cx+3.2+lk,feet-8.1,1.1,1.5);
    ctx.strokeStyle='#3a1f10'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(cx-5.5,feet-12); ctx.lineTo(cx-1.5,feet-10.3); ctx.moveTo(cx+5.5,feet-12); ctx.lineTo(cx+1.5,feet-10.3); ctx.stroke();
    ctx.strokeStyle='#5a2e15'; ctx.lineWidth=1; rr(ctx,cx-7,feet-13,14,13,6); ctx.stroke();
  }
}
class Shellback{
  constructor(tx,ty){ this.type='shellback'; this.w=14; this.h=22; this.x=tx*16+1; this.y=(ty+1)*16-this.h; this.vx=0; this.vy=0; this.dir=-1; this.state='walk'; this.dead=false; this.wake=0; this.noHit=0; this.walk=0; this.t=0; }
  toShell(){ const feet=this.y+this.h; this.state='shell'; this.h=14; this.y=feet-this.h; this.vx=0; this.wake=0; }
  toWalk(){ const feet=this.y+this.h; this.state='walk'; this.h=22; this.y=feet-this.h; this.dir=Math.random()<0.5?-1:1; }
  kick(d){ this.state='slide'; this.dir=d; this.noHit=0.2; sfxKick(); }
  update(dt){
    this.t+=dt; this._hitL=this._hitR=this._hitD=false; this.onGround=false;
    if(this.state==='walk'){
      this.walk+=dt*6; this.vx=this.dir*0.5; this.vy+=GRAVITY_E; if(this.vy>7)this.vy=7;
      collideX(this); if(this._hitL)this.dir=1; if(this._hitR)this.dir=-1;
      collideY(this,false);
      if(this.onGround){ const ftx=this.dir>0?Math.floor((this.x+this.w+1)/16):Math.floor((this.x-1)/16); const bty=Math.floor((this.y+this.h+1)/16); if(!solidTile(ftx,bty)) this.dir*=-1; }
    } else if(this.state==='shell'){
      this.vx=0; this.vy+=GRAVITY_E; if(this.vy>7)this.vy=7; collideX(this); collideY(this,false);
      this.wake+=dt; if(this.wake>6) this.toWalk();
    } else {
      this.noHit-=dt; this.vx=this.dir*3.2; this.vy+=GRAVITY_E; if(this.vy>7)this.vy=7;
      collideX(this); if(this._hitL){ this.dir=1; sfxBump(); } if(this._hitR){ this.dir=-1; sfxBump(); }
      collideY(this,false);
    }
    if(this.y>game.worldH+80) this.dead=true;
  }
  draw(){ const cx=this.x+this.w/2, feet=this.y+this.h;
    ctx.fillStyle='rgba(0,0,0,0.18)'; ellipse(cx,feet+1.5,this.w*0.55,2.2);
    if(this.state==='walk'){
      const wob=Math.sin(this.walk);
      ctx.fillStyle='#e8b84a'; ellipse(cx-4,feet-1-(wob>0?1:0),3,2); ellipse(cx+4,feet-1-(wob<0?1:0),3,2);
      const hx=cx+this.dir*5.5, hy=feet-14;
      ctx.fillStyle='#9ad97f'; ellipse(hx,hy,4,4.4);
      ctx.fillStyle='#fff'; ellipse(hx+this.dir*1.2,hy-0.5,1.5,1.9); ctx.fillStyle='#1a1008'; ellipse(hx+this.dir*1.8,hy-0.3,0.9,1.2);
      shellDome(cx,feet,'#2faa46',13);
    } else {
      shellDome(cx,feet,'#2faa46',13);
      if(this.state==='slide'){ ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.lineWidth=1; const dir=this.dir; for(let i=0;i<2;i++){ const ax=cx-dir*(9+i*3); ctx.beginPath(); ctx.arc(ax,feet-7,3+i, dir>0?0.6:2.0, dir>0?2.0:3.6); ctx.stroke(); } }
      else { ctx.fillStyle='#e8b84a'; ellipse(cx-7,feet-3,2.2,1.6); ellipse(cx+7,feet-3,2.2,1.6); }
    }
  }
}
class Chomper{
  constructor(tx,ty){ this.type='chomper'; this.centerX=tx*16+16; this.w=16; this.x=this.centerX-8; this.baseY=(ty+1)*16; this.h=16; this.t=rand(0,6); this.up=0; this.cyc=0; this.dead=false; this.y=this.baseY; }
  update(dt){
    const p=game.player;
    const near = Math.abs((p.x+p.w/2)-this.centerX)<26 && (p.y+p.h) < this.baseY+10;
    this.t+=dt*1.1; const cyc=Math.sin(this.t)*0.5+0.5; const target=near?0:cyc;
    this.up=lerp(this.up,target,0.12); this.cyc=cyc;
    this.y=this.baseY-this.up*24;
  }
  draw(){ const cx=this.centerX;
    ctx.save(); ctx.beginPath(); ctx.rect(cx-30, this.baseY-220, 60, 220); ctx.clip();
    const headY=this.y+6;
    ctx.strokeStyle='#3aa33a'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(cx,this.baseY); ctx.lineTo(cx,headY+2); ctx.stroke();
    ctx.strokeStyle='#2c8a2c'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(cx-1.2,this.baseY); ctx.lineTo(cx-1.2,headY+2); ctx.stroke();
    ctx.fillStyle='#46b846'; ellipse(cx-5,headY+8,4,2); ellipse(cx+5,headY+8,4,2);
    const open=(this.cyc||0)*3.2;
    ctx.fillStyle='#e23b3b'; ctx.beginPath(); ctx.arc(cx,headY,7,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#7a1414'; ctx.beginPath(); ctx.ellipse(cx,headY+0.5,5.5,2.0+open*0.6,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff';
    for(let i=-2;i<=2;i++){ const tx=cx+i*2.2;
      ctx.beginPath(); ctx.moveTo(tx-1,headY-1.4-open*0.6); ctx.lineTo(tx+1,headY-1.4-open*0.6); ctx.lineTo(tx,headY+0.4-open*0.4); ctx.fill();
      ctx.beginPath(); ctx.moveTo(tx-1,headY+1.4+open*0.6); ctx.lineTo(tx+1,headY+1.4+open*0.6); ctx.lineTo(tx,headY-0.4+open*0.4); ctx.fill(); }
    ctx.fillStyle='#ffd23a'; ctx.beginPath(); ctx.arc(cx-3,headY-3,1.1,0,7); ctx.arc(cx+3,headY-3,1.1,0,7); ctx.fill();
    ctx.strokeStyle='#a02020'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx,headY,7,0,Math.PI*2); ctx.stroke();
    ctx.restore();
  }
}
// ============ ITEMS / PROJECTILES ============
class Mushroom{
  constructor(tx,ty){ this.type='mushroom'; this.w=14; this.h=14; this.x=tx*16+1; this.y=ty*16; this.vx=0; this.vy=0; this.dir=1; this.state='emerge'; this.emerge=16; this.dead=false; }
  update(dt){
    if(this.state==='emerge'){ this.y-=0.6; this.emerge-=0.6; if(this.emerge<=0) this.state='walk'; return; }
    this.vx=this.dir*0.95; this.vy+=GRAVITY_E; if(this.vy>7)this.vy=7;
    this._hitL=this._hitR=this._hitD=false; this.onGround=false;
    collideX(this); if(this._hitL)this.dir=1; if(this._hitR)this.dir=-1;
    collideY(this,false);
    if(this.y>game.worldH+80) this.dead=true;
  }
  draw(){ const cx=this.x+this.w/2, feet=this.y+this.h;
    ctx.fillStyle='rgba(0,0,0,0.18)'; ellipse(cx,feet+1.5,this.w*0.5,2);
    ctx.fillStyle='#ffe8c8'; rr(ctx,cx-4,feet-7,8,7,2); ctx.fill();
    ctx.fillStyle='#3a2a1a'; ellipse(cx-2,feet-4,0.9,1.4); ellipse(cx+2,feet-4,0.9,1.4);
    ctx.fillStyle='#e23b3b'; rr(ctx,cx-8,feet-15,16,9,5); ctx.fill();
    ctx.fillStyle='#fff'; ellipse(cx,feet-11,2.4,2.2); ellipse(cx-5,feet-10,1.6,1.5); ellipse(cx+5,feet-10,1.6,1.5);
    ctx.strokeStyle='#a02020'; ctx.lineWidth=1; rr(ctx,cx-8,feet-15,16,9,5); ctx.stroke();
  }
}
class Flower{
  constructor(tx,ty){ this.type='flower'; this.w=14; this.h=14; this.x=tx*16+1; this.baseY=(ty-1)*16; this.y=ty*16; this.state='emerge'; this.emerge=16; this.t=0; this.dead=false; }
  update(dt){
    if(this.state==='emerge'){ this.y-=0.6; this.emerge-=0.6; if(this.emerge<=0) this.state='idle'; return; }
    this.t+=dt; this.y=this.baseY+Math.sin(this.t*3)*1.5;
  }
  draw(){ const cx=this.x+this.w/2, cy=this.y+this.h/2;
    ctx.save(); ctx.globalAlpha=0.3; ctx.fillStyle='#ffd23a'; ellipse(cx,cy,this.w*0.8,this.h*0.8); ctx.restore();
    ctx.strokeStyle='#3aa33a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(cx,this.y+this.h); ctx.lineTo(cx,cy+2); ctx.stroke();
    const pc=8; for(let i=0;i<pc;i++){ const a=i/pc*Math.PI*2+this.t; ctx.fillStyle=i%2?'#ff7a3a':'#ffb13a'; ellipse(cx+Math.cos(a)*5,cy+Math.sin(a)*5,2.6,2.6); }
    ctx.fillStyle='#ffe06a'; ctx.beginPath(); ctx.arc(cx,cy,3.2,0,7); ctx.fill();
    ctx.fillStyle='#b9780c'; ctx.beginPath(); ctx.arc(cx,cy,1.4,0,7); ctx.fill();
  }
}
class Fireball{
  constructor(x,y,dir){ this.type='fireball'; this.w=8; this.h=8; this.x=x; this.y=y; this.vx=dir*4.6; this.vy=2; this.dir=dir; this.dead=false; this.life=2.6; this.spin=0; }
  update(dt){
    this.spin+=dt*22; this.vy+=0.45; if(this.vy>6.5)this.vy=6.5;
    this._hitL=this._hitR=this._hitD=this._hitU=false;
    collideX(this); if(this._hitL||this._hitR){ this.dead=true; spawnSpark(this.x+this.w/2,this.y+this.h/2,'#ffae3a'); }
    collideY(this,false); if(this._hitD){ this.vy=-3.4; }
    this.life-=dt; if(this.life<=0) this.dead=true;
    if(this.x<game.camX-120 || this.x>game.camX+camW+120) this.dead=true;
  }
  draw(){ const cx=this.x+this.w/2, cy=this.y+this.h/2;
    ctx.save(); ctx.globalAlpha=0.4; ctx.fillStyle='#ffae3a'; ctx.beginPath(); ctx.arc(cx,cy,7,0,7); ctx.fill(); ctx.restore();
    ctx.fillStyle='#ff7a1a'; ctx.beginPath(); ctx.arc(cx,cy,4.2,0,7); ctx.fill();
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(this.spin); ctx.fillStyle='#ffe06a'; ctx.fillRect(-2.6,-1,5.2,2); ctx.fillRect(-1,-2.6,2,5.2); ctx.restore();
  }
}
class PopCoin{
  constructor(tx,ty){ this.x=tx*16+8; this.y=ty*16-2; this.vy=-4.4; this.t=0; this.spin=0; this.dead=false; }
  update(dt){ this.vy+=0.28; this.y+=this.vy; this.t+=dt; this.spin+=dt*16; if(this.t>0.5) this.dead=true; }
  draw(){ drawCoin(this.x,this.y,5,this.spin); }
}
class Particle{
  constructor(x,y,vx,vy,o){ this.x=x; this.y=y; this.vx=vx; this.vy=vy; o=o||{}; this.type=o.type||'puff'; this.size=o.size||3; this.life=o.life||0.4; this.max=this.life; this.g=o.g!=null?o.g:0.1; this.color=o.color||'#fff'; this.rot=0; this.rotv=o.rotv||0; this.dead=false; }
  update(dt){ this.x+=this.vx; this.y+=this.vy; this.vy+=this.g; this.rot+=this.rotv; this.life-=dt; if(this.life<=0) this.dead=true; }
  draw(){ const a=clamp(this.life/this.max,0,1);
    if(this.type==='debris'){ ctx.save(); ctx.globalAlpha=a; ctx.translate(this.x,this.y); ctx.rotate(this.rot); ctx.fillStyle=this.color; ctx.fillRect(-this.size/2,-this.size/2,this.size,this.size); ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(-this.size/2,this.size/2-1,this.size,1); ctx.restore(); }
    else if(this.type==='spark'){ ctx.save(); ctx.globalAlpha=a; ctx.fillStyle=this.color; ellipse(this.x,this.y,this.size,this.size); ctx.restore(); }
    else if(this.type==='confetti'){ ctx.save(); ctx.globalAlpha=a; ctx.translate(this.x,this.y); ctx.rotate(this.rot); ctx.fillStyle=this.color; ctx.fillRect(-this.size/2,-this.size/2,this.size,this.size*0.6); ctx.restore(); }
    else { ctx.save(); ctx.globalAlpha=a*0.85; ctx.fillStyle=this.color; const s=this.size*(1+(1-a)*1.4); ellipse(this.x,this.y,s,s); ctx.restore(); }
  }
}
class Popup{
  constructor(x,y,text,color){ this.x=x; this.y=y; this.text=text; this.color=color||'#fff'; this.t=0; this.life=0.85; this.dead=false; }
  update(dt){ this.y-=20*dt; this.t+=dt; if(this.t>this.life) this.dead=true; }
  draw(){ const a=clamp(1-(this.t/this.life),0,1); const sc=1+Math.min(this.t*3,0.3);
    ctx.save(); ctx.globalAlpha=a; ctx.translate(this.x,this.y); ctx.scale(sc,sc);
    ctx.font='7px "Press Start 2P", monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillText(this.text,0.6,0.6);
    ctx.fillStyle=this.color; ctx.fillText(this.text,0,0); ctx.restore();
  }
}

export { Chomper, Fireball, Flower, Mushroom, Particle, Player, PopCoin, Popup, Shellback, Stomper };
