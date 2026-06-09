import { DIFFICULTY, SPRING_V, THEMES } from '../core/constants.js';
import { rand } from '../core/utils.js';
import { sfx1up, sfxBreak, sfxBump, sfxCoin, sfxSpring, sfxSprout } from '../engine/audio.js';
import { Fireball, Flower, Mushroom, Particle, PopCoin, Popup } from './entities.js';

// ============ GAME STATE ============
const game = {
  state:'title', oneShotStart:false,
  level:null, levelIndex:0, grid:null, theme:THEMES.overworld,
  worldW:0, worldH:0, goalX:0, goalGroundY:0, goalPoleTop:0,
  camX:0, camY:0,
  score:0, coins:0, lives:3, time:300,
  enemies:[], items:[], fireballs:[], particles:[], popups:[], popcoins:[], bumps:[],
  hazards:[], crumbles:[], platforms:[], checkpoints:[], checkpointX:0,
  player:null,
  cleared:false, clearPhase:null, clearTimer:0, holdT:0, fanfarePlayed:false,
  deathTimer:0, confetti:[],
  mapNode:0, mapMaxUnlocked:0, mapCleared:[],
  difficulty:0, diff:DIFFICULTY[0]
};

const SOLID = new Set(['X','S','B','?','!','U','P','T','D']);
function isSolidCh(c){ return SOLID.has(c); }
function solidTile(tx,ty){
  if(ty<0) return false;
  if(tx<0) return true;
  if(tx>=game.grid.w) return false;
  if(ty>=game.grid.h) return false;
  return isSolidCh(game.grid.c[ty][tx]);
}
function gget(x,y){ if(x<0||x>=game.grid.w||y<0||y>=game.grid.h) return ' '; return game.grid.c[y][x]; }
function gset(x,y,ch){ if(x<0||x>=game.grid.w||y<0||y>=game.grid.h) return; game.grid.c[y][x]=ch; }
function collideX(e){
  e.x += e.vx;
  const top=Math.floor(e.y/16), bot=Math.floor((e.y+e.h-1)/16);
  if(e.vx>0){ const tx=Math.floor((e.x+e.w-1)/16); for(let ty=top;ty<=bot;ty++){ if(solidTile(tx,ty)){ e.x=tx*16-e.w; e.vx=0; e._hitR=true; break; } } }
  else if(e.vx<0){ const tx=Math.floor(e.x/16); for(let ty=top;ty<=bot;ty++){ if(solidTile(tx,ty)){ e.x=(tx+1)*16; e.vx=0; e._hitL=true; break; } } }
}
function collideY(e,isPlayer){
  e.y += e.vy;
  const left=Math.floor(e.x/16), right=Math.floor((e.x+e.w-1)/16);
  if(e.vy>0){ const ty=Math.floor((e.y+e.h-1)/16);
    for(let tx=left;tx<=right;tx++){ if(solidTile(tx,ty)){ e.y=ty*16-e.h;
        if(isPlayer && game.grid.c[ty][tx]==='T'){ e.vy=-SPRING_V; e.onGround=false; e._hitD=false; sfxSpring(); spawnDust(e.x+e.w/2,e.y+e.h); }
        else { e.vy=0; e.onGround=true; e._hitD=true; }
        break; } }
  } else if(e.vy<0){ const ty=Math.floor(e.y/16); const hits=[];
    for(let tx=left;tx<=right;tx++){ if(solidTile(tx,ty)) hits.push(tx); }
    if(hits.length){ e.y=(ty+1)*16; e.vy=0; e._hitU=true;
      if(isPlayer){ const cxf=(e.x+e.w/2)/16; let best=hits[0],bd=1e9; for(const t of hits){ const d=Math.abs(t+0.5-cxf); if(d<bd){bd=d;best=t;} } bumpBlock(best,ty); }
    }
  }
}

function addScore(n){ game.score+=n; }
function addCoin(n){ game.coins+=n; while(game.coins>=100){ game.coins-=100; game.lives++; sfx1up(); popupWorld(game.player.x, game.player.y-12, '1UP', '#fff'); } }
function popupWorld(x,y,text,color){ game.popups.push(new Popup(x,y,text,color||'#fff')); }
function spawnItem(it){ game.items.push(it); }
function spawnFireball(p){ const x = p.facing>0? p.x+p.w : p.x-8; game.fireballs.push(new Fireball(x, p.y+p.h*0.4, p.facing)); }
function countFB(){ let n=0; for(const f of game.fireballs) if(!f.dead) n++; return n; }
function bumpAnim(tx,ty){ game.bumps.push({tx,ty,t:0,dur:0.16}); }
function bumpOffset(tx,ty){ for(const b of game.bumps){ if(b.tx===tx&&b.ty===ty) return Math.sin((b.t/b.dur)*Math.PI)*5; } return 0; }
function crumbleOffset(tx,ty){ for(const c of game.crumbles){ if(c.tx===tx&&c.ty===ty) return Math.sin(c.t*45)*1.4; } return 0; }
function bumpBlock(tx,ty){
  const ch=gget(tx,ty);
  if(ch==='?'||ch==='!'){
    if(ch==='?'){ spawnPopCoin(tx,ty); addCoin(1); addScore(200); sfxCoin(); }
    else { if(game.player.form==='small') spawnItem(new Mushroom(tx,ty-1)); else spawnItem(new Flower(tx,ty)); addScore(1000); sfxSprout(); }
    gset(tx,ty,'U'); bumpAnim(tx,ty);
  } else if(ch==='B'){
    if(game.player.form!=='small'){ gset(tx,ty,' '); spawnBrickDebris(tx,ty); addScore(50); sfxBreak(); }
    else { bumpAnim(tx,ty); sfxBump(); }
  } else { bumpAnim(tx,ty); sfxBump(); }
  bumpEnemiesAbove(tx,ty);
}
function bumpEnemiesAbove(tx,ty){
  const x0=tx*16, x1=tx*16+16, topY=ty*16;
  for(const e of game.enemies){ if(e.dead||(e.squash&&e.squash>0)||e.type==='chomper') continue;
    const feet=e.y+e.h;
    if(e.x+e.w>x0 && e.x<x1 && feet>=topY-6 && feet<=topY+8){
      if(e.type==='stomper'){ killEnemy(e); addScore(100); popupWorld(e.x,e.y-4,'100'); }
      else if(e.type==='shellback'){ e.toShell(); addScore(100); popupWorld(e.x,e.y-4,'100'); }
      else if(e.type==='spiker'||e.type==='bat'){ killEnemy(e); addScore(100); popupWorld(e.x,e.y-4,'100'); }
      e.vy=-2.6;
    }
  }
}
function killEnemy(e){ e.dead=true; spawnPuff(e.x+e.w/2, e.y+e.h/2); }
function spawnPuff(x,y){ for(let i=0;i<5;i++) game.particles.push(new Particle(x,y, rand(-1,1), rand(-1.4,-0.2), {type:'puff', size:rand(2.5,4), life:rand(0.25,0.4), g:0, color:'#ffffff'})); }
function spawnDust(x,y){ for(let i=0;i<3;i++) game.particles.push(new Particle(x+rand(-3,3),y, rand(-0.6,0.6), rand(-0.6,-0.1), {type:'puff', size:rand(1.6,2.6), life:rand(0.2,0.3), g:0.04, color:'#e9d8b6'})); }
function spawnBrickDebris(tx,ty){ const cx=tx*16+8, cy=ty*16+8, c=game.theme.brick; const v=[[-1.4,-3.4],[1.4,-3.4],[-1.0,-2.0],[1.0,-2.0]]; for(const d of v) game.particles.push(new Particle(cx,cy,d[0],d[1],{type:'debris', size:4, life:0.8, g:0.32, color:c, rotv:rand(-0.4,0.4)})); }
function spawnSpark(x,y,color){ for(let i=0;i<5;i++){ const a=Math.random()*Math.PI*2, s=rand(0.6,2); game.particles.push(new Particle(x,y,Math.cos(a)*s,Math.sin(a)*s-0.6,{type:'spark', size:rand(1,2), life:rand(0.25,0.45), g:0.08, color:color||'#ffe79a'})); } }
function spawnPopCoin(tx,ty){ game.popcoins.push(new PopCoin(tx,ty)); }

export { SOLID, addCoin, addScore, bumpAnim, bumpBlock, bumpEnemiesAbove, bumpOffset, collideX, collideY, countFB, crumbleOffset, game, gget, gset, isSolidCh, killEnemy, popupWorld, solidTile, spawnBrickDebris, spawnDust, spawnFireball, spawnItem, spawnPopCoin, spawnPuff, spawnSpark };
