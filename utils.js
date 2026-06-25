import { LEVELS, buildBonus } from '../content/levels.js';
import { DIFFICULTY, GRAVITY } from '../core/constants.js';
import { edge, input } from '../core/input.js';
import { aabb, clamp, lerp, rand } from '../core/utils.js';
import { duckMusic, setMusicTrack, sfx1up, sfxBossDown, sfxBossHit, sfxCheckpoint, sfxClear, sfxCoin, sfxCrumble, sfxFlag, sfxFlagDn, sfxKick, sfxPause, sfxPowerup, sfxStomp, sfxTick, sfxWarp, sfxWin } from '../engine/audio.js';
import { camH, camW, canvas } from '../engine/canvas.js';
import { Bat, Boss, Chomper, FireBar, MovingPlatform, Particle, Player, Shellback, Spiker, Star, Stomper, WarpGate, Wing, Gem } from './entities.js';
import { addCoin, addScore, collideX, collideY, game, gget, gset, killEnemy, popupWorld, spawnBrickDebris, spawnPuff, spawnSpark } from './state.js';

// ============ GAME FLOW ============
function newGame(){ game.diff=DIFFICULTY[game.difficulty]||DIFFICULTY[0]; if(!game.player) game.player=new Player(); if(game.lives<=0) game.lives=game.diff.lives; game.player.form=game.diff.startBig?'big':'small'; game.confetti=[]; game.mapNode=Math.max(0, Math.min(game.mapMaxUnlocked|0, LEVELS.length-1)); game.state='worldmap'; setMusicTrack('map'); duckMusic(1); }
function saveProgress(){ try{ localStorage.setItem('brambleDash.save', JSON.stringify({ cleared:game.mapCleared, unlocked:game.mapMaxUnlocked, coins:game.coins, lives:Math.max(0,game.lives), score:game.score, difficulty:game.difficulty, gems:Object.keys(game.gems||{}).map(Number), skin:game.skin|0 })); }catch(e){} }
function hasSave(){ try{ return !!localStorage.getItem('brambleDash.save'); }catch(e){ return false; } }
function wipeSave(){ try{ localStorage.removeItem('brambleDash.save'); }catch(e){} game.mapCleared=[]; game.mapMaxUnlocked=0; game.mapNode=0; game.coins=0; game.score=0; game.gems={}; game.skin=0; game.lives=(game.diff&&game.diff.lives)||3; }
function loadProgress(){ try{ const s=localStorage.getItem('brambleDash.save'); if(!s) return; const d=JSON.parse(s); if(Array.isArray(d.cleared)) game.mapCleared=d.cleared; if(typeof d.unlocked==='number') game.mapMaxUnlocked=d.unlocked; if(typeof d.coins==='number') game.coins=d.coins; if(typeof d.lives==='number') game.lives=d.lives; if(typeof d.score==='number') game.score=d.score; if(typeof d.difficulty==='number'){ game.difficulty=Math.max(0,Math.min(d.difficulty,DIFFICULTY.length-1)); game.diff=DIFFICULTY[game.difficulty]; } if(Array.isArray(d.gems)){ game.gems={}; for(const k of d.gems) game.gems[k]=true; } if(typeof d.skin==='number') game.skin=d.skin|0; }catch(e){} }
function startLevel(idx, respawn){
  const lvl=LEVELS[idx]();
  game.diff=DIFFICULTY[game.difficulty]||DIFFICULTY[0];
  game.levelIndex=idx; game.level=lvl; game.grid=lvl.grid; game.theme=lvl.theme;
  game.worldW=lvl.grid.w*16; game.worldH=lvl.grid.h*16;
  game.goalX=lvl.goalX; game.goalGroundY=lvl.goalGroundY; game.goalPoleTop=lvl.goalPoleTop;
  game.enemies=[]; game.items=[]; game.fireballs=[]; game.particles=[]; game.popups=[]; game.popcoins=[]; game.bumps=[]; game.hazards=[]; game.crumbles=[]; game.platforms=[]; game.checkpoints=[]; game.boss=null; game.bossShots=[]; game.bossWinTimer=0; game.pauseConfirm=false;
  game.water=!!lvl.water; game.inBonus=false; game.bonusTimer=0; game._bonus=null;
  game.zones=(lvl.zones||[]).map(z=>({x:z.tx*16,y:z.ty*16,w:z.w*16,h:z.h*16,kind:z.kind,dir:z.dir||0,dx:z.dx||0,dy:z.dy||0,power:z.power||0.4}));
  const g=lvl.grid;
  for(let y=0;y<g.h;y++) for(let x=0;x<g.w;x++){ const c=g.c[y][x];
    if(c==='g'){ game.enemies.push(new Stomper(x,y)); g.c[y][x]=' '; }
    else if(c==='k'){ game.enemies.push(new Shellback(x,y)); g.c[y][x]=' '; }
    else if(c==='c'){ game.enemies.push(new Chomper(x,y)); g.c[y][x]=' '; }
    else if(c==='p'){ game.enemies.push(new Spiker(x,y)); g.c[y][x]=' '; }
    else if(c==='b'){ game.enemies.push(new Bat(x,y)); g.c[y][x]=' '; }
    else if(c==='F'){ game.hazards.push(new FireBar(x*16+8, y*16+8)); g.c[y][x]='S'; }
    else if(c==='H'){ game.checkpoints.push({x:x*16+8, y:y*16, active:false}); g.c[y][x]=' '; }
    else if(c==='O'){ game.boss=new Boss(x,y); g.c[y][x]=' '; }
    else if(c==='*'){ const s=new Star(x,y); s.state='idle'; s.baseY=y*16; game.items.push(s); g.c[y][x]=' '; }
    else if(c==='^'){ const w=new Wing(x,y); w.state='idle'; w.baseY=y*16; game.items.push(w); g.c[y][x]=' '; }
    else if(c==='N'){ game.items.push(new WarpGate(x,y)); g.c[y][x]=' '; }
    else if(c==='G'){ const gm=new Gem(x,y); gm.lvl=game.levelIndex; game.items.push(gm); g.c[y][x]=' '; }
  }
  game.platforms = (lvl.platforms||[]).map(d=>new MovingPlatform(d));
  if(!respawn) game.checkpointX = lvl.spawnX;
  if(game.boss){ const hp=lvl.bossHP||3; game.boss.hp=hp; game.boss.maxhp=hp; game.boss.pal=lvl.bossPal||null; game.boss.name=lvl.bossName||'ボス'; game.boss.pattern=lvl.bossAtk||null; game.boss.atkT=(lvl.bossAtk&&lvl.bossAtk.every)||2.4; }
  setMusicTrack(game.boss ? 'boss' : (lvl.themeName||'overworld'));
  game.time=lvl.time; game.cleared=false; game.clearPhase=null; game.clearTimer=0; game.holdT=0; game.fanfarePlayed=false; game.deathTimer=0;
  if(!game.player) game.player=new Player();
  game.player.resetForLevel(lvl);
  if(respawn && game.checkpointX>lvl.spawnX){ game.player.x=game.checkpointX; for(const cp of game.checkpoints){ if(cp.x<=game.checkpointX) cp.active=true; } }
  game.camX=clamp(game.player.x-camW*0.4,0,Math.max(0,game.worldW-camW));
  const cyMin=Math.min(0,game.worldH-camH), cyMax=Math.max(0,game.worldH-camH);
  game.camY=clamp(game.player.y-camH*0.55,cyMin,cyMax);
  game.state='playing'; duckMusic(1);
}
function collectGem(lvl){ if(!game.gems) game.gems={}; game.gems[lvl]=true; const n=Object.keys(game.gems).length;
  addScore(2000); popupWorld(game.player.x, game.player.y-14, 'ジェム '+n+'/4', '#9be8ff'); sfxPowerup();
  if(n>=4) popupWorld(game.player.x, game.player.y-28, 'にじいろ かいほう！', '#ff8ad2');
  saveProgress();
}
function nextLevel(){ const idx=game.levelIndex; if(game.mapCleared) game.mapCleared[idx]=true; const ni=idx+1; if(ni>=LEVELS.length){ game.state='win'; duckMusic(0); sfxWin(); } else { game.mapMaxUnlocked=Math.max(game.mapMaxUnlocked|0, ni); game.mapNode=ni; game.state='worldmap'; setMusicTrack('map'); duckMusic(1); } saveProgress(); }
function bossDefeated(){ const b=game.boss; game.bossWinTimer=1.8; sfxBossDown(); addScore(3000); popupWorld(b.x+b.w/2,b.y-18,'3000','#ffd34d'); const cs=['#ffd34d','#9effa0','#7cc0ff','#ff9ad2']; for(let i=0;i<26;i++) game.particles.push(new Particle(b.x+b.w/2,b.y+b.h/2, rand(-3,3), rand(-4.5,-0.5), {type:'spark', size:rand(2,3.5), life:rand(0.5,0.95), g:0.12, color:cs[i%cs.length]})); }
function startClear(){ game.state='levelclear'; game.cleared=true; game.clearPhase='slide'; const p=game.player; p.onPole=true; p.x=game.goalX-p.w/2; p.vx=0; p.vy=0; game.fanfarePlayed=false; game.holdT=0; duckMusic(0); sfxFlag(); }
function clearBurst(x,y){ const cs=['#ffd34d','#ff7a3a','#5fd24a','#7cc0ff','#ff9ad2','#ffffff']; for(let i=0;i<24;i++){ const a=Math.random()*6.28, sp=rand(1.5,5.2); game.particles.push(new Particle(x,y, Math.cos(a)*sp, Math.sin(a)*sp-1.6, {type: Math.random()<0.5?'confetti':'spark', size:rand(2,4), life:rand(0.6,1.15), g:0.12, color:cs[i%cs.length], rotv:rand(-0.4,0.4)})); } }
function updateClear(dt){
  const p=game.player;
  if(game.clearPhase==='slide'){ p.onPole=true; p.vx=0; p.facing=-1; p.y+=1.8; const baseY=game.goalGroundY; if(p.y+p.h>=baseY){ p.y=baseY-p.h; game.clearPhase='pause'; game.clearTimer=0.5; sfxFlagDn(); } }
  else if(game.clearPhase==='pause'){ game.clearTimer-=dt; if(game.clearTimer<=0) game.clearPhase='walk'; }
  else if(game.clearPhase==='walk'){ p.onPole=false; p.facing=1; p.vx=1.5; p.vy+=GRAVITY; p._hitL=p._hitR=p._hitD=false; p.onGround=false; collideX(p); collideY(p,false); p.walkPhase+=Math.abs(p.vx)*dt*9; if(p.x>game.goalX+64){ game.clearPhase='tally'; game.clearTimer=0; if(!game.fanfarePlayed){ sfxClear(); game.fanfarePlayed=true; clearBurst(p.x+p.w/2,p.y+2); clearBurst(game.goalX+46,game.goalGroundY-30); } } }
  else if(game.clearPhase==='tally'){ game.clearTimer+=dt; if(game.time>0){ if(game.clearTimer>0.02){ game.clearTimer=0; const dec=Math.min(game.time,3); game.time-=dec; addScore(Math.round(dec*50)); sfxTick(); game.particles.push(new Particle(p.x+p.w/2,p.y,rand(-1,1),rand(-3,-1.2),{type:'spark',size:rand(1.6,3),life:0.6,g:0.12,color:'#ffd34d'})); } } else { game.holdT+=dt; if(game.holdT>1.3){ game.holdT=0; nextLevel(); } } }
}
function updateDying(dt){ const p=game.player; p.vy+=GRAVITY; if(p.vy>9)p.vy=9; p.y+=p.vy; game.deathTimer-=dt; if(game.deathTimer<=0){ if(game.lives<0 && !game.diff.noGameOver){ game.state='gameover'; duckMusic(0); saveProgress(); } else { if(game.lives<0) game.lives=0; p.form=game.diff.startBig?'big':'small'; startLevel(game.levelIndex, true); saveProgress(); } } }
function doStompBounce(){ const p=game.player; p.vy=input.jump?-5.7:-3.8; p.onGround=false; p.jumping=true; sfxStomp(); spawnPuff(p.x+p.w/2,p.y+p.h); }
function stompReward(e){ const SC=[100,200,400,800,1000,2000,4000,8000]; const idx=Math.min(game.player.combo,SC.length-1); const val=SC[idx]; game.player.combo++; if(game.player.combo>=SC.length){ game.lives++; sfx1up(); popupWorld(e.x,e.y-6,'1UP','#fff'); } else { addScore(val); popupWorld(e.x,e.y-6,''+val); } }
function resolvePlayerEnemies(){
  const p=game.player; if(p.dead) return;
  for(const e of game.enemies){ if(e.dead||(e.squash&&e.squash>0)) continue; if(!aabb(p,e)) continue;
    if(p.star>0){ killEnemy(e); addScore(200); popupWorld(e.x,e.y-4,'200','#ffe24d'); sfxStomp(); continue; }
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

function applyZones(p){
  if(!game.zones||!game.zones.length) return;
  const ox=p.x+p.w*0.5, top=p.y, bot=p.y+p.h;
  for(const z of game.zones){
    const inX=ox>=z.x && ox<=z.x+z.w;
    if(z.kind==='conveyor'){
      if(inX && p.onGround && Math.abs(bot-z.y)<6){ p.x+=z.dir*z.power; p._hitL=p._hitR=false; collideX(p); }
    } else if(z.kind==='current'){
      if(game.water && inX && bot>=z.y && top<=z.y+z.h){ if(z.dx){ p.x+=z.dx*Math.min(z.power,1.2); collideX(p); } if(z.dy){ const tv=z.dy*z.power; if(z.dy<0) p.vy=Math.min(p.vy,tv); else p.vy=Math.max(p.vy,tv); } }
    } else if(z.kind==='wind'){
      if(inX && bot>=z.y && top<=z.y+z.h){ p.x+=z.dir*z.power*(p.onGround?0.45:1); collideX(p); }
    }
  }
}

function updatePlaying(dt){
  const p=game.player;
  if(edge.pause||edge.start){ game.state='paused'; game.pauseSel=0; game.pauseConfirm=false; duckMusic(0); sfxPause(); return; }
  if(game.inBonus){ game.bonusTimer-=dt; if(game.bonusTimer<=0){ exitBonus(); return; } }
  game.time-=dt*2.4*game.diff.timeMul; if(game.time<0)game.time=0;
  if(game.time<=0 && game.diff.timeMul>0 && !p.dead){ p.die(); return; }
  for(const pf of game.platforms) pf.update(dt);
  if(p.riding){ p.x += p.riding.dx; p.y += p.riding.dy; }
  p.riding=null;
  p.update(dt);
  applyZones(p);
  if(game.state!=='playing') return;
  for(const pf of game.platforms){ if(p.vy>=0){ const feet=p.y+p.h, overX=(p.x+p.w>pf.x && p.x<pf.x+pf.w); if(overX && feet>=pf.y-3 && feet<=pf.y+pf.h+6){ p.y=pf.y-p.h; p.vy=0; p.onGround=true; p._hitD=true; p.riding=pf; } } }
  for(const cp of game.checkpoints){ if(!cp.active && (p.x+p.w/2)>=cp.x){ cp.active=true; game.checkpointX=cp.x; popupWorld(cp.x, cp.y-18, 'CHECK!', '#9effa0'); sfxCheckpoint(); } }
  for(const it of game.items){ it.update(dt); if(it.dead) continue; if(aabb(p,it)){ if(it.type==='mushroom'){ if(p.form==='small') p.grow(); addScore(1000); popupWorld(it.x,it.y-4,'1000'); it.dead=true; } else if(it.type==='flower'){ p.toFire(); addScore(1000); popupWorld(it.x,it.y-4,'1000'); it.dead=true; } else if(it.type==='star'){ p.star=Math.max(p.star,9); p.invinc=Math.max(p.invinc,0.3); addScore(1000); popupWorld(it.x,it.y-4,'STAR!','#ffe24d'); it.dead=true; sfxPowerup(); } else if(it.type==='wing'){ p.fly=Math.max(p.fly,9); addScore(1000); popupWorld(it.x,it.y-4,'FLY!','#bfe9ff'); it.dead=true; sfxPowerup(); } else if(it.type==='warp'){ it.dead=true; sfxWarp(); enterBonus(); return; } else if(it.type==='gem'){ it.dead=true; collectGem(it.lvl); } } }
  for(const e of game.enemies) e.update(dt);
  for(const e of game.enemies){ if(e.dead)continue; if(e.type==='shellback'&&e.state==='slide'){ for(const o of game.enemies){ if(o===e||o.dead||(o.squash&&o.squash>0)||o.type==='chomper')continue; if(aabb(e,o)){ killEnemy(o); addScore(200); popupWorld(o.x,o.y-4,'200'); sfxKick(); } } } }
  resolvePlayerEnemies();
  if(game.state!=='playing') return;
  if(game.boss){ const b=game.boss; b.update(dt);
    if(!b.dead){
      if(aabb(p,b)){ const fromAbove = p.vy>0.5 && (p.y+p.h)-b.y < b.h*0.6;
        if(fromAbove){ const r=b.hit(); doStompBounce(); if(r===2) bossDefeated(); else if(r===1){ addScore(500); popupWorld(b.x+b.w/2,b.y-6,'500'); sfxBossHit(); } }
        else if(b.invuln<=0){ p.hurt(); if(p.dead) return; }
      }
      for(const fb of game.fireballs){ if(fb.dead)continue; if(aabb(fb,b)){ const r=b.hit(); fb.dead=true; spawnSpark(fb.x,fb.y,'#ffae3a'); if(r===2) bossDefeated(); else if(r===1) sfxBossHit(); } }
    } else {
      game.bossWinTimer-=dt;
      if(game.bossWinTimer<=0 && game.state==='playing'){ game.state='levelclear'; game.cleared=true; game.clearPhase='tally'; game.clearTimer=0; game.holdT=0; if(!game.fanfarePlayed){ sfxClear(); game.fanfarePlayed=true; } duckMusic(0); }
    }
  }
  if(game.bossShots.length){
    for(const sh of game.bossShots) sh.update(dt);
    for(const sh of game.bossShots){ if(sh.dead)continue; if(aabb(sh,p)){ if(p.star>0){ sh.dead=true; } else if(p.invinc<=0){ sh.dead=true; p.hurt(); if(p.dead) return; } } }
    for(const fb of game.fireballs){ if(fb.dead)continue; for(const sh of game.bossShots){ if(sh.dead)continue; if(aabb(fb,sh)){ fb.dead=true; sh.dead=true; spawnSpark(sh.cx,sh.cy,'#ffd34d'); } } }
    game.bossShots=game.bossShots.filter(s=>!s.dead);
  }
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
  if(!game.boss && !game.cleared && (p.x+p.w/2)>=game.goalX) startClear();
  cull();
}
function enterBonus(){
  const p=game.player;
  game._bonus={ grid:game.grid, level:game.level, theme:game.theme, worldW:game.worldW, worldH:game.worldH,
    goalX:game.goalX, goalGroundY:game.goalGroundY, goalPoleTop:game.goalPoleTop,
    enemies:game.enemies, items:game.items, fireballs:game.fireballs, particles:game.particles, popups:game.popups, popcoins:game.popcoins, bumps:game.bumps, hazards:game.hazards, crumbles:game.crumbles, platforms:game.platforms, checkpoints:game.checkpoints, checkpointX:game.checkpointX, boss:game.boss, bossShots:game.bossShots,
    camX:game.camX, camY:game.camY, time:game.time, levelIndex:game.levelIndex, water:game.water, zones:game.zones, px:p.x, py:p.y, form:p.form };
  const b=buildBonus();
  game.level=b; game.grid=b.grid; game.theme=b.theme; game.worldW=b.grid.w*16; game.worldH=b.grid.h*16;
  game.goalX=99999; game.goalGroundY=b.goalGroundY; game.goalPoleTop=b.goalPoleTop;
  game.enemies=[]; game.items=[]; game.fireballs=[]; game.particles=[]; game.popups=[]; game.popcoins=[]; game.bumps=[]; game.hazards=[]; game.crumbles=[]; game.platforms=[]; game.checkpoints=[]; game.boss=null; game.bossShots=[];
  game.water=false; game.zones=[]; game.inBonus=true; game.bonusTimer=12;
  p.x=b.spawnX; p.y=b.spawnFeetY-p.h; p.vx=0; p.vy=0; p.onGround=false; p.star=0; p.fly=0;
  game.camX=0; game.camY=0; setMusicTrack('bonus'); duckMusic(1); sfxPowerup();
}
function exitBonus(){ const s=game._bonus; if(!s){ game.inBonus=false; return; } const p=game.player;
  game.grid=s.grid; game.level=s.level; game.theme=s.theme; game.worldW=s.worldW; game.worldH=s.worldH;
  game.goalX=s.goalX; game.goalGroundY=s.goalGroundY; game.goalPoleTop=s.goalPoleTop;
  game.enemies=s.enemies; game.items=s.items; game.fireballs=s.fireballs; game.particles=s.particles; game.popups=s.popups; game.popcoins=s.popcoins; game.bumps=s.bumps; game.hazards=s.hazards; game.crumbles=s.crumbles; game.platforms=s.platforms; game.checkpoints=s.checkpoints; game.checkpointX=s.checkpointX; game.boss=s.boss; game.bossShots=s.bossShots||[];
  game.levelIndex=s.levelIndex; game.water=s.water; game.zones=s.zones||[]; game.time=s.time;
  p.form=s.form; p.sizeFromForm(); p.x=s.px; p.y=s.py; p.vx=0; p.vy=0;
  game.camX=s.camX; game.camY=s.camY; game.inBonus=false; game.bonusTimer=0; game._bonus=null;
  setMusicTrack(game.level.themeName||'overworld'); duckMusic(1);
}
function returnToMap(){ game.inBonus=false; game.bonusTimer=0; game._bonus=null; game.water=false; game.zones=[]; game.bossShots=[]; const p=game.player; if(p){ p.star=0; p.fly=0; } game.state='worldmap'; game.mapNode=Math.max(0,Math.min(game.mapNode|0,LEVELS.length-1)); setMusicTrack('map'); duckMusic(1); saveProgress(); }
function updateMenu(dt){
  if(edge.start||edge.jump||game.oneShotStart){ game.oneShotStart=false; newGame(); return; }
  game.oneShotStart=false;
  if(game.state==='win'){
    if(game.confetti.length<80 && Math.random()<0.5){ const cols=['#ff5d5d','#ffd23a','#5fd24a','#5db4ff','#ff8a3a']; game.confetti.push(new Particle(rand(0,canvas.width), -10, rand(-0.6,0.6), rand(1,3), {type:'confetti', size:rand(4,7), life:rand(2.5,4), g:0.05, color:cols[Math.floor(rand(0,5))], rotv:rand(-0.3,0.3)})); }
    for(const c of game.confetti) c.update(dt); game.confetti=game.confetti.filter(c=>!c.dead && c.y<canvas.height+20);
  }
}

export { collectCoins, cull, doStompBounce, enterBonus, exitBonus, loadProgress, newGame, nextLevel, resolvePlayerEnemies, returnToMap, saveProgress, startClear, startLevel, stompReward, updateCamera, updateClear, updateDying, updateMenu, updateParticlesOnly, updatePlaying, collectGem, hasSave, wipeSave };
