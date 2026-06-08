import { LEVELS } from '../content/levels.js';
import { GRAVITY } from '../core/constants.js';
import { edge, input } from '../core/input.js';
import { aabb, clamp, lerp, rand } from '../core/utils.js';
import { duckMusic, setMusicTrack, sfx1up, sfxClear, sfxCoin, sfxCrumble, sfxFlag, sfxFlagDn, sfxKick, sfxPause, sfxStomp, sfxTick, sfxWin } from '../engine/audio.js';
import { camH, camW, canvas } from '../engine/canvas.js';
import { Bat, Chomper, FireBar, Particle, Player, Shellback, Spiker, Stomper } from './entities.js';
import { addCoin, addScore, collideX, collideY, game, gget, gset, killEnemy, popupWorld, spawnBrickDebris, spawnPuff, spawnSpark } from './state.js';

// ============ GAME FLOW ============
function newGame(){ game.score=0; game.coins=0; game.lives=3; if(!game.player) game.player=new Player(); game.player.form='small'; game.confetti=[]; game.mapNode=0; game.mapMaxUnlocked=0; game.mapCleared=[]; game.state='worldmap'; setMusicTrack('map'); duckMusic(1); }
function startLevel(idx){
  const lvl=LEVELS[idx]();
  game.levelIndex=idx; game.level=lvl; game.grid=lvl.grid; game.theme=lvl.theme;
  game.worldW=lvl.grid.w*16; game.worldH=lvl.grid.h*16;
  game.goalX=lvl.goalX; game.goalGroundY=lvl.goalGroundY; game.goalPoleTop=lvl.goalPoleTop;
  game.enemies=[]; game.items=[]; game.fireballs=[]; game.particles=[]; game.popups=[]; game.popcoins=[]; game.bumps=[]; game.hazards=[]; game.crumbles=[];
  const g=lvl.grid;
  for(let y=0;y<g.h;y++) for(let x=0;x<g.w;x++){ const c=g.c[y][x];
    if(c==='g'){ game.enemies.push(new Stomper(x,y)); g.c[y][x]=' '; }
    else if(c==='k'){ game.enemies.push(new Shellback(x,y)); g.c[y][x]=' '; }
    else if(c==='c'){ game.enemies.push(new Chomper(x,y)); g.c[y][x]=' '; }
    else if(c==='p'){ game.enemies.push(new Spiker(x,y)); g.c[y][x]=' '; }
    else if(c==='b'){ game.enemies.push(new Bat(x,y)); g.c[y][x]=' '; }
    else if(c==='F'){ game.hazards.push(new FireBar(x*16+8, y*16+8)); g.c[y][x]='S'; }
  }
  setMusicTrack(lvl.themeName||'overworld');
  game.time=lvl.time; game.cleared=false; game.clearPhase=null; game.clearTimer=0; game.holdT=0; game.fanfarePlayed=false; game.deathTimer=0;
  if(!game.player) game.player=new Player();
  game.player.resetForLevel(lvl);
  game.camX=clamp(game.player.x-camW*0.4,0,Math.max(0,game.worldW-camW));
  const cyMin=Math.min(0,game.worldH-camH), cyMax=Math.max(0,game.worldH-camH);
  game.camY=clamp(game.player.y-camH*0.55,cyMin,cyMax);
  game.state='playing'; duckMusic(1);
}
function nextLevel(){ const idx=game.levelIndex; if(game.mapCleared) game.mapCleared[idx]=true; const ni=idx+1; if(ni>=LEVELS.length){ game.state='win'; duckMusic(0); sfxWin(); } else { game.mapMaxUnlocked=Math.max(game.mapMaxUnlocked|0, ni); game.mapNode=ni; game.state='worldmap'; setMusicTrack('map'); duckMusic(1); } }
function startClear(){ game.state='levelclear'; game.cleared=true; game.clearPhase='slide'; const p=game.player; p.onPole=true; p.x=game.goalX-p.w/2; p.vx=0; p.vy=0; game.fanfarePlayed=false; game.holdT=0; duckMusic(0); sfxFlag(); }
function updateClear(dt){
  const p=game.player;
  if(game.clearPhase==='slide'){ p.onPole=true; p.vx=0; p.facing=-1; p.y+=1.8; const baseY=game.goalGroundY; if(p.y+p.h>=baseY){ p.y=baseY-p.h; game.clearPhase='pause'; game.clearTimer=0.5; sfxFlagDn(); } }
  else if(game.clearPhase==='pause'){ game.clearTimer-=dt; if(game.clearTimer<=0) game.clearPhase='walk'; }
  else if(game.clearPhase==='walk'){ p.onPole=false; p.facing=1; p.vx=1.5; p.vy+=GRAVITY; p._hitL=p._hitR=p._hitD=false; p.onGround=false; collideX(p); collideY(p,false); p.walkPhase+=Math.abs(p.vx)*dt*9; if(p.x>game.goalX+64){ game.clearPhase='tally'; game.clearTimer=0; if(!game.fanfarePlayed){ sfxClear(); game.fanfarePlayed=true; } } }
  else if(game.clearPhase==='tally'){ game.clearTimer+=dt; if(game.time>0){ if(game.clearTimer>0.02){ game.clearTimer=0; const dec=Math.min(game.time,3); game.time-=dec; addScore(Math.round(dec*50)); sfxTick(); } } else { game.holdT+=dt; if(game.holdT>1.3){ game.holdT=0; nextLevel(); } } }
}
function updateDying(dt){ const p=game.player; p.vy+=GRAVITY; if(p.vy>9)p.vy=9; p.y+=p.vy; game.deathTimer-=dt; if(game.deathTimer<=0){ if(game.lives<0){ game.state='gameover'; duckMusic(0); } else { p.form='small'; startLevel(game.levelIndex); } } }
function doStompBounce(){ const p=game.player; p.vy=input.jump?-5.7:-3.8; p.onGround=false; p.jumping=true; sfxStomp(); spawnPuff(p.x+p.w/2,p.y+p.h); }
function stompReward(e){ const SC=[100,200,400,800,1000,2000,4000,8000]; const idx=Math.min(game.player.combo,SC.length-1); const val=SC[idx]; game.player.combo++; if(game.player.combo>=SC.length){ game.lives++; sfx1up(); popupWorld(e.x,e.y-6,'1UP','#fff'); } else { addScore(val); popupWorld(e.x,e.y-6,''+val); } }
function resolvePlayerEnemies(){
  const p=game.player; if(p.dead) return;
  for(const e of game.enemies){ if(e.dead||(e.squash&&e.squash>0)) continue; if(!aabb(p,e)) continue;
    const fromAbove = p.vy>0.5 && (p.y+p.h)-e.y < e.h*0.7;
    if(e.type==='stomper'){ if(fromAbove){ e.stomp(); doStompBounce(); stompReward(e); } else { p.hurt(); if(p.dead) return; } }
    else if(e.type==='shellback'){
      if(e.state==='walk'){ if(fromAbove){ e.toShell(); doStompBounce(); stompReward(e); } else { p.hurt(); if(p.dead) return; } }
      else if(e.state==='shell'){ const d=(p.x+p.w/2<e.x+e.w/2)?1:-1; if(fromAbove){ e.kick(d); doStompBounce(); } else { e.kick(d); if(d>0)e.x=p.x+p.w+1; else e.x=p.x-e.w-1; } }
      else { if(fromAbove){ e.state='shell'; e.vx=0; e.wake=0; doStompBounce(); } else if(e.noHit<=0){ p.hurt(); if(p.dead) return; } }
    }
    else if(e.type==='chomper'){ if(e.up>0.35){ p.hurt(); if(p.dead) return; } }
    else if(e.type==='spiker'){ p.hurt(); if(p.dead) return; }
    else if(e.type==='bat'){ if(fromAbove){ killEnemy(e); doStompBounce(); stompReward(e); } else { p.hurt(); if(p.dead) return; } }
  }
}
function updateCamera(){
  const p=game.player;
  const tx=p.x+p.w/2-camW*0.45;
  game.camX=lerp(game.camX,tx,0.12); game.camX=clamp(game.camX,0,Math.max(0,game.worldW-camW));
  const ty=p.y+p.h/2-camH*0.55;
  const cyMin=Math.min(0,game.worldH-camH), cyMax=Math.max(0,game.worldH-camH);
  game.camY=lerp(game.camY,ty,0.12); game.camY=clamp(game.camY,cyMin,cyMax);
}
function collectCoins(p){
  const x0=Math.floor(p.x/16),x1=Math.floor((p.x+p.w-1)/16),y0=Math.floor(p.y/16),y1=Math.floor((p.y+p.h-1)/16);
  for(let ty=y0;ty<=y1;ty++) for(let tx=x0;tx<=x1;tx++){ if(gget(tx,ty)==='o'){ gset(tx,ty,' '); addCoin(1); addScore(100); sfxCoin(); spawnSpark(tx*16+8,ty*16+8,'#ffe79a'); } }
}
function cull(){ game.enemies=game.enemies.filter(e=>!e.dead); game.items=game.items.filter(e=>!e.dead); game.fireballs=game.fireballs.filter(e=>!e.dead); }
function updateParticlesOnly(dt){ for(const p of game.particles)p.update(dt); game.particles=game.particles.filter(p=>!p.dead); for(const p of game.popups)p.update(dt); game.popups=game.popups.filter(p=>!p.dead); for(const p of game.popcoins)p.update(dt); game.popcoins=game.popcoins.filter(p=>!p.dead); }
function updatePlaying(dt){
  const p=game.player;
  if(edge.pause||edge.start){ game.state='paused'; duckMusic(0); sfxPause(); return; }
  game.time-=dt*2.4; if(game.time<0)game.time=0;
  if(game.time<=0 && !p.dead){ p.die(); return; }
  p.update(dt);
  if(game.state!=='playing') return;
  for(const it of game.items){ it.update(dt); if(it.dead) continue; if(aabb(p,it)){ if(it.type==='mushroom'){ if(p.form==='small') p.grow(); addScore(1000); popupWorld(it.x,it.y-4,'1000'); it.dead=true; } else if(it.type==='flower'){ p.toFire(); addScore(1000); popupWorld(it.x,it.y-4,'1000'); it.dead=true; } } }
  for(const e of game.enemies) e.update(dt);
  for(const e of game.enemies){ if(e.dead)continue; if(e.type==='shellback'&&e.state==='slide'){ for(const o of game.enemies){ if(o===e||o.dead||(o.squash&&o.squash>0)||o.type==='chomper')continue; if(aabb(e,o)){ killEnemy(o); addScore(200); popupWorld(o.x,o.y-4,'200'); sfxKick(); } } } }
  resolvePlayerEnemies();
  if(game.state!=='playing') return;
  for(const hz of game.hazards) hz.update(dt);
  if(game.state!=='playing') return;
  // crumbling platforms: stand on a 'D' tile -> it shakes then drops
  if(p.onGround){ const fx0=Math.floor(p.x/16), fx1=Math.floor((p.x+p.w-1)/16), fyr=Math.floor((p.y+p.h)/16);
    for(let tx=fx0;tx<=fx1;tx++){ if(gget(tx,fyr)==='D'){ let has=false; for(const c of game.crumbles){ if(c.tx===tx&&c.ty===fyr){ has=true; break; } } if(!has) game.crumbles.push({tx,ty:fyr,t:0}); } } }
  for(const c of game.crumbles) c.t+=dt;
  for(const c of game.crumbles){ if(c.t>=0.55 && gget(c.tx,c.ty)==='D'){ gset(c.tx,c.ty,' '); spawnBrickDebris(c.tx,c.ty); sfxCrumble(); } }
  game.crumbles = game.crumbles.filter(c=> gget(c.tx,c.ty)==='D');
  for(const fb of game.fireballs){ fb.update(dt); if(fb.dead)continue; for(const e of game.enemies){ if(e.dead||(e.squash&&e.squash>0))continue; if(e.type==='chomper'){ if(e.up>0.1&&aabb(fb,e)){ e.dead=true; spawnPuff(e.centerX,e.y+e.h/2); addScore(200); popupWorld(e.x,e.y-4,'200'); fb.dead=true; spawnSpark(fb.x,fb.y,'#ffae3a'); sfxStomp(); break; } } else { if(aabb(fb,e)){ killEnemy(e); addScore(100); popupWorld(e.x,e.y-4,'100'); fb.dead=true; spawnSpark(fb.x,fb.y,'#ffae3a'); break; } } } }
  collectCoins(p);
  for(const b of game.bumps) b.t+=dt; game.bumps=game.bumps.filter(b=>b.t<b.dur);
  updateParticlesOnly(dt);
  updateCamera();
  if(!game.cleared && (p.x+p.w/2)>=game.goalX) startClear();
  cull();
}
function updateMenu(dt){
  if(edge.start||edge.jump||game.oneShotStart){ game.oneShotStart=false; newGame(); return; }
  game.oneShotStart=false;
  if(game.state==='win'){
    if(game.confetti.length<80 && Math.random()<0.5){ const cols=['#ff5d5d','#ffd23a','#5fd24a','#5db4ff','#ff8a3a']; game.confetti.push(new Particle(rand(0,canvas.width), -10, rand(-0.6,0.6), rand(1,3), {type:'confetti', size:rand(4,7), life:rand(2.5,4), g:0.05, color:cols[Math.floor(rand(0,5))], rotv:rand(-0.3,0.3)})); }
    for(const c of game.confetti) c.update(dt); game.confetti=game.confetti.filter(c=>!c.dead && c.y<canvas.height+20);
  }
}

export { collectCoins, cull, doStompBounce, newGame, nextLevel, resolvePlayerEnemies, startClear, startLevel, stompReward, updateCamera, updateClear, updateDying, updateMenu, updateParticlesOnly, updatePlaying };
