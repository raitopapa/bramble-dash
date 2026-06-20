import { THEMES } from '../core/constants.js';
import { mulberry32 } from '../core/utils.js';

// ============ LEVELS ============
class Grid{
  constructor(w,h){ this.w=w; this.h=h; this.c=[]; for(let y=0;y<h;y++) this.c.push(new Array(w).fill(' ')); this.gy=h-2; }
  set(x,y,ch){ if(x<0||x>=this.w||y<0||y>=this.h) return; this.c[y][x]=ch; }
  get(x,y){ if(x<0||x>=this.w||y<0||y>=this.h) return ' '; return this.c[y][x]; }
}
function pipe(g,x,h,gy){ for(let j=0;j<h;j++){ g.set(x,gy-1-j,'P'); g.set(x+1,gy-1-j,'P'); } }
function warpPipe(g,x,gy,h){ h=h||2; pipe(g,x,h,gy); g.set(x, gy-1-h, 'N'); }
function stairUp(g,x,n,gy){ for(let i=0;i<n;i++) for(let j=0;j<=i;j++) g.set(x+i,gy-1-j,'S'); }
function stairDown(g,x,n,gy){ for(let i=0;i<n;i++) for(let j=0;j<=(n-1-i);j++) g.set(x+i,gy-1-j,'S'); }
function row(g,x,y,n,ch){ for(let i=0;i<n;i++) g.set(x+i,y,ch); }
function makeDecor(W,H,seed,themeName){
  const rng=mulberry32(seed); const clouds=[],hills=[],bushes=[],crystals=[]; const horizon=(H-2)*16;
  if(themeName!=='cave'){ const n=Math.floor(W/14); for(let i=0;i<n;i++) clouds.push({x:rng()*W*16,y:10+rng()*70,s:0.7+rng()*0.9,spd:4+rng()*9}); }
  const hn=Math.floor(W/16); for(let i=0;i<hn;i++) hills.push({x:rng()*W*16,s:0.8+rng()*1.4,y:horizon});
  const bn=Math.floor(W/12); for(let i=0;i<bn;i++) bushes.push({x:rng()*W*16,s:0.7+rng()*0.8});
  if(themeName==='cave'){ const cn=Math.floor(W/8); for(let i=0;i<cn;i++) crystals.push({x:rng()*W*16,y:18+rng()*120,s:0.5+rng()}); }
  return {clouds,hills,bushes,crystals};
}
function finalize(g,opts){
  const theme=THEMES[opts.theme]||THEMES.overworld;
  const decor=makeDecor(g.w,g.h,opts.seed||1,opts.theme);
  const gy=opts.gy!=null?opts.gy:g.gy;
  return { grid:g, theme, themeName:opts.theme, decor, time:opts.time||300, name:opts.name||'1-1',
    spawnX:(opts.spawnTX||2)*16+2, spawnFeetY:gy*16, goalX:(opts.goalTX)*16+8,
    goalGroundY:(opts.goalGroundY!=null?opts.goalGroundY:gy)*16, goalPoleTop:(opts.goalPoleTopY!=null?opts.goalPoleTopY:4)*16,
    water:!!opts.water, platforms:opts.platforms||[],
    world:opts.world||1, isBoss:!!opts.boss, bossHP:opts.bossHP||3, bossPal:opts.bossPal||null, bossName:opts.bossName||'ボス', zones:opts.zones||[], bossAtk:opts.bossAtk||null };
}
function buildLevel1(){
  const W=212,H=15,gy=13; const g=new Grid(W,H); g.gy=gy;
  for(let x=0;x<W;x++){ g.set(x,gy,'X'); g.set(x,gy+1,'X'); }
  const pit=(x,w)=>{ for(let i=0;i<w;i++){ g.set(x+i,gy,' '); g.set(x+i,gy+1,' '); } };
  g.set(14,gy-1,'g');
  g.set(16,9,'?'); g.set(20,9,'!'); g.set(24,9,'?'); g.set(22,9,'B'); g.set(26,9,'B');
  row(g,30,9,3,'o');
  g.set(34,gy-1,'g');
  pit(40,3);
  pipe(g,48,2,gy);
  pipe(g,60,3,gy); g.set(60,gy-4,'c');
  g.set(72,gy-1,'k');
  stairUp(g,80,4,gy);
  pit(92,3);
  row(g,98,8,4,'B'); g.set(100,8,'?'); row(g,98,6,2,'o');
  g.set(110,gy-1,'g'); g.set(113,gy-1,'g');
  pipe(g,120,3,gy); g.set(120,gy-4,'c');
  row(g,128,9,5,'o');
  pit(138,4);
  g.set(150,gy-1,'k');
  row(g,158,8,3,'B'); g.set(160,5,'?');
  stairUp(g,180,5,gy);
  g.set(36,gy,'T'); g.set(36,8,'o'); g.set(36,7,'o');
  g.set(76,gy-1,'p');
  g.set(88,gy-1,'H');
warpPipe(g,8,gy,3);
    return finalize(g,{theme:'overworld',time:300,name:'1-1',spawnTX:3,gy,goalTX:198,goalGroundY:gy,goalPoleTopY:4,seed:11});
}
function buildLevel2(){
  const W=224,H=15,gy=13; const g=new Grid(W,H); g.gy=gy;
  for(let x=0;x<W;x++){ g.set(x,gy,'X'); g.set(x,gy+1,'X'); }
  const pit=(x,w)=>{ for(let i=0;i<w;i++){ g.set(x+i,gy,' '); g.set(x+i,gy+1,' '); } };
  g.set(10,9,'?'); g.set(13,9,'!');
  g.set(18,gy-1,'g'); g.set(20,gy-1,'g');
  pit(26,3);
  row(g,32,8,5,'B'); g.set(34,8,'?'); g.set(36,8,'?'); row(g,33,6,3,'o');
  pit(44,4);
  pipe(g,52,2,gy); pipe(g,60,4,gy); g.set(60,gy-5,'c');
  g.set(70,gy-1,'k'); g.set(73,gy-1,'k');
  stairUp(g,80,3,gy);
  row(g,90,7,4,'o');
  pit(96,4);
  row(g,104,4,4,'S'); g.set(106,4,'?'); row(g,104,5,2,'o'); g.set(112,gy-1,'g');
  pipe(g,118,3,gy); g.set(118,gy-4,'c');
  pit(128,5);
  row(g,136,3,9,'B'); g.set(138,5,'!');
  g.set(146,gy-1,'k');
  pit(154,4);
  stairUp(g,160,4,gy); stairDown(g,168,4,gy);
  g.set(178,gy-1,'g'); g.set(181,gy-1,'g');
  pipe(g,188,2,gy);
  stairUp(g,196,5,gy);
  g.set(48,gy,'T'); g.set(48,8,'o'); g.set(48,7,'o');
  g.set(126,gy-1,'p');
  g.set(108,gy-1,'H');
  g.set(34,gy-4,'G');
  return finalize(g,{theme:'overworld',time:300,name:'1-2',spawnTX:3,gy,goalTX:212,goalGroundY:gy,goalPoleTopY:4,seed:42,
    platforms:[{tx:43,ty:11,w:3,axis:'h',range:3,speed:0.9}]});
}
function buildLevel3(){
  const W=204,H=15,gy=13; const g=new Grid(W,H); g.gy=gy;
  for(let x=0;x<W;x++){ g.set(x,gy,'S'); g.set(x,gy+1,'S'); g.set(x,0,'S'); g.set(x,1,'S'); }
  const pit=(x,w)=>{ for(let i=0;i<w;i++){ g.set(x+i,gy,' '); g.set(x+i,gy+1,' '); } };
  const stal=(x,len)=>{ for(let j=0;j<len;j++) g.set(x,2+j,'S'); };
  g.set(12,gy-1,'g');
  stal(16,3); stal(17,2);
  g.set(22,9,'?'); g.set(24,9,'B'); g.set(26,9,'?');
  pit(32,3);
  row(g,38,4,6,'S'); g.set(40,gy-1,'k'); row(g,39,6,2,'o');
  stal(46,4);
  pit(52,4);
  row(g,60,5,7,'S'); row(g,61,5,3,'o'); g.set(63,5,'?');
  g.set(70,gy-1,'g'); g.set(73,gy-1,'g');
  pit(80,3);
  stairUp(g,86,4,gy);
  row(g,94,7,3,'S'); g.set(96,7,'!');
  pit(104,4);
  g.set(112,gy-1,'k');
  stal(116,3); stal(118,4);
  row(g,124,5,3,'B');
  pit(132,5);
  row(g,140,4,9,'S'); g.set(142,gy-1,'g'); row(g,141,8,3,'o');
  pit(152,3);
  g.set(160,gy-1,'k');
  stairUp(g,168,4,gy);
  g.set(50,7,'b'); g.set(120,6,'b');
  g.set(96,gy-1,'H');
warpPipe(g,10,gy,3);
    return finalize(g,{theme:'cave',time:320,name:'4-1',spawnTX:3,gy,goalTX:190,goalGroundY:gy,goalPoleTopY:4,seed:77,zones:[{tx:6,ty:13,w:8,h:1,kind:'conveyor',dir:1,power:0.5},{tx:40,ty:13,w:8,h:1,kind:'conveyor',dir:1,power:0.5}]});
}
function buildLevel4(){
  // 2-2 : Underground (cave). Ceiling + stalactites, raised stone, piranha pipes.
  const W=212,H=15,gy=13; const g=new Grid(W,H); g.gy=gy;
  for(let x=0;x<W;x++){ g.set(x,gy,'S'); g.set(x,gy+1,'S'); g.set(x,0,'S'); g.set(x,1,'S'); }
  const pit=(x,w)=>{ for(let i=0;i<w;i++){ g.set(x+i,gy,' '); g.set(x+i,gy+1,' '); } };
  const stal=(x,len)=>{ for(let j=0;j<len;j++) g.set(x,2+j,'S'); };
  const ped=(x,n,w)=>{ for(let i=0;i<w;i++) for(let j=0;j<n;j++) g.set(x+i,gy-1-j,'S'); };
  stal(6,3); stal(7,2); stal(15,4); stal(16,3);
  g.set(10,9,'?'); g.set(12,9,'!');
  g.set(14,gy-1,'k');
  pit(22,3);
  ped(28,2,3); g.set(28,9,'o'); g.set(29,9,'o'); g.set(30,9,'o'); g.set(31,gy-1,'g');
  stal(36,5); stal(38,3);
  pipe(g,44,3,gy); g.set(44,gy-4,'c');
  pit(52,4);
  row(g,60,8,4,'S'); g.set(61,7,'o'); g.set(62,7,'o'); g.set(63,7,'?');
  stal(68,4);
  g.set(72,gy-1,'k'); g.set(76,gy-1,'g');
  pit(82,4);
  ped(90,3,2); ped(95,2,2); g.set(90,8,'o'); g.set(91,8,'o'); g.set(95,9,'o');
  stal(100,5); stal(102,3);
  pipe(g,108,2,gy); g.set(108,gy-3,'c');
  pit(116,3);
  row(g,124,7,3,'B'); g.set(126,7,'!');
  g.set(132,gy-1,'k');
  stal(138,4); stal(140,5);
  pit(146,4);
  row(g,154,6,5,'S'); g.set(155,5,'o'); g.set(156,5,'o'); g.set(157,5,'o'); g.set(156,gy-1,'g');
  stal(163,4);
  ped(170,2,2); ped(174,3,2); ped(178,4,2);
  stairUp(g,186,4,gy);
  g.set(34,7,'b'); g.set(86,6,'b'); g.set(150,7,'b');
  g.set(104,gy-1,'H');
  g.set(30,gy-4,'G');
  return finalize(g,{theme:'cave',time:340,name:'4-2',spawnTX:3,gy,goalTX:202,goalGroundY:gy,goalPoleTopY:4,seed:123,zones:[{tx:8,ty:13,w:8,h:1,kind:'conveyor',dir:1,power:0.55},{tx:50,ty:13,w:8,h:1,kind:'conveyor',dir:-1,power:0.45}]});
}
function buildLevel5(){
  // 3-1 : Sky athletic. Floating islands over a void (falling = death).
  const W=212,H=15,gy=13; const g=new Grid(W,H); g.gy=gy;
  const isle=(x,w)=>{ for(let i=0;i<w;i++){ g.set(x+i,gy,'X'); g.set(x+i,gy+1,'X'); } };
  const plat=(x,y,w)=>{ for(let i=0;i<w;i++) g.set(x+i,y,'X'); };
  isle(0,8);
  g.set(3,9,'?'); g.set(5,9,'o');
  const spots=[];
  for(let x=12; x<=156; x+=9){ isle(x,5); spots.push(x); }
  isle(164,44);                       // big final island carries the goal
  for(let i=0;i<spots.length;i++){ const sx=spots[i], m=i%4;
    if(i===5){ g.set(sx+2,9,'!'); }
    else if(m===0){ g.set(sx+1,9,'o'); g.set(sx+2,8,'o'); g.set(sx+3,9,'o'); }
    else if(m===1){ plat(sx+6,8,3); g.set(sx+7,7,'o'); }
    else if(m===2){ g.set(sx+2,gy-1,'k'); }
    else { g.set(sx+2,9,'?'); }
  }
  g.set(176,9,'?'); g.set(178,9,'o'); g.set(180,8,'o'); g.set(184,gy-1,'g');
  for(let i=0;i<4;i++){ g.set(53+i,gy,'D'); g.set(107+i,gy,'D'); }
  g.set(140,gy,'T'); g.set(140,7,'o'); g.set(140,6,'o');
  g.set(80,7,'b'); g.set(150,6,'b');
  g.set(103,gy-1,'H');
warpPipe(g,3,gy,2);
    return finalize(g,{theme:'sky',time:320,name:'3-1',spawnTX:3,gy,goalTX:196,goalGroundY:gy,goalPoleTopY:3,seed:321,zones:[{tx:40,ty:5,w:28,h:6,kind:'wind',dir:1,power:0.32},{tx:108,ty:5,w:28,h:6,kind:'wind',dir:-1,power:0.3}],
    platforms:[{tx:89,ty:9,w:3,axis:'v',range:3,speed:0.9},{tx:125,ty:9,w:3,axis:'h',range:3,speed:1.0}]});
}
function buildLevel6(){
  // 3-2 : Castle. Stone & breakable brick, battlements, piranha pipes, harder.
  const W=218,H=15,gy=13; const g=new Grid(W,H); g.gy=gy;
  for(let x=0;x<W;x++){ g.set(x,gy,'S'); g.set(x,gy+1,'S'); }
  const pit=(x,w)=>{ for(let i=0;i<w;i++){ g.set(x+i,gy,' '); g.set(x+i,gy+1,' '); } };
  const pillar=(x,n)=>{ for(let j=0;j<n;j++) g.set(x,gy-1-j,'S'); };
  g.set(8,9,'B'); g.set(9,9,'?'); g.set(10,9,'B'); g.set(11,9,'!'); g.set(12,9,'B');
  g.set(15,gy-1,'k');
  pillar(19,3); pillar(20,3); g.set(19,8,'o'); g.set(20,8,'o');
  pit(26,3);
  row(g,32,8,5,'B'); g.set(34,8,'?'); g.set(33,7,'o'); g.set(35,7,'o');
  g.set(40,gy-1,'g');
  pipe(g,46,3,gy); g.set(46,gy-4,'c');
  pit(54,4);
  pillar(60,2); pillar(61,4); pillar(62,4); pillar(63,2); g.set(61,8,'o'); g.set(62,8,'o');
  g.set(70,gy-1,'k'); g.set(73,gy-1,'k');
  row(g,80,8,4,'B'); g.set(82,8,'!'); g.set(81,7,'o');
  pit(88,4);
  pipe(g,96,2,gy); g.set(96,gy-3,'c');
  stairUp(g,102,4,gy); stairDown(g,110,4,gy);
  g.set(118,gy-1,'g');
  pillar(124,3); pillar(125,3); g.set(124,8,'o'); g.set(125,8,'o');
  pit(132,5);
  row(g,140,6,3,'B'); g.set(142,6,'?'); g.set(141,5,'o');
  g.set(148,gy-1,'k');
  pipe(g,154,3,gy); g.set(154,gy-4,'c');
  pit(162,4);
  row(g,170,8,5,'S'); g.set(171,7,'o'); g.set(173,7,'o');
  pillar(180,2); pillar(181,3); pillar(182,4);
  g.set(188,gy-1,'g'); g.set(191,gy-1,'k');
  stairUp(g,196,4,gy);
  g.set(50,8,'F'); g.set(126,8,'F');
  g.set(30,gy-1,'p'); g.set(150,gy-1,'p');
  g.set(116,gy-1,'H');
  return finalize(g,{theme:'castle',time:360,name:'3-2',spawnTX:3,gy,goalTX:210,goalGroundY:gy,goalPoleTopY:3,seed:222,
    platforms:[{tx:131,ty:11,w:3,axis:'h',range:3,speed:0.9}]});
}
function buildLevel7(){
  // Boss arena: an enclosed castle hall. Stomp the boss 3 times (or hit with fireballs) to win.
  const W=34,H=15,gy=13; const g=new Grid(W,H); g.gy=gy;
  for(let x=0;x<W;x++){ g.set(x,gy,'S'); g.set(x,gy+1,'S'); }
  for(let y=0;y<gy;y++){ g.set(0,y,'S'); g.set(1,y,'S'); g.set(W-2,y,'S'); g.set(W-1,y,'S'); }
  for(let y=2;y<gy;y+=2){ g.set(2,y,'o'); g.set(W-3,y,'o'); }   // little coin columns by the walls
  g.set(18,gy-1,'O');                                            // the boss
  return finalize(g,{theme:'castle',time:400,name:'ボス',spawnTX:3,gy,goalTX:W+3,goalGroundY:gy,goalPoleTopY:3,seed:777});
}
function buildLevelWater(){
  // Underwater swim stage. Bob with jump; collect coins through open water.
  const W=208,H=15,gy=13; const g=new Grid(W,H); g.gy=gy;
  for(let x=0;x<W;x++){ g.set(x,gy,'X'); g.set(x,gy+1,'X'); }     // seabed floor
  g.set(0, gy-1,'S'); g.set(1,gy-1,'S');
  // floating coral blocks to swim around + coin arcs
  const block=(x,y,n)=>{ for(let i=0;i<n;i++) g.set(x+i,y,'S'); };
  const arc=(x,y)=>{ g.set(x,y,'o'); g.set(x+1,y-1,'o'); g.set(x+2,y-1,'o'); g.set(x+3,y,'o'); };
  block(18,9,3); arc(17,7); block(30,6,2); arc(33,5); block(40,10,3);
  for(let y=3;y<=10;y+=2) g.set(50,y,'o');                         // vertical coin column (swim up)
  block(60,7,4); arc(66,5); block(74,10,2); block(82,5,3); arc(88,8);
  for(let y=4;y<=9;y++) g.set(98,y,'o');
  block(104,8,3); arc(110,6); block(120,11,3); block(128,6,2); arc(132,4);
  block(140,9,4); for(let y=3;y<=8;y+=2) g.set(150,y,'o'); block(158,10,3);
  block(168,6,3); arc(172,9); block(182,8,3); arc(188,6);
  g.set(96,gy-1,'H');                                              // mid checkpoint
  // a couple of gentle bats acting as fish
  g.set(36,7,'b'); g.set(112,6,'b'); g.set(176,8,'b');
  // a star reward up high + a wing
  g.set(50,2,'*'); g.set(150,2,'^');
warpPipe(g,10,gy,2);
    g.set(72,4,'G');
    return finalize(g,{theme:'water',water:true,time:340,name:'2-1',spawnTX:3,gy,goalTX:W-4,goalGroundY:gy,goalPoleTopY:3,seed:404,zones:[{tx:49,ty:2,w:3,h:9,kind:'current',dy:-1,power:2.0},{tx:100,ty:5,w:18,h:7,kind:'current',dx:1,power:0.35}]});
}
function buildBonus(){
  // Small coin room reached through a warp star. Grab coins before the timer runs out!
  const W=26,H=13,gy=11; const g=new Grid(W,H); g.gy=gy;
  for(let x=0;x<W;x++){ g.set(x,gy,'S'); g.set(x,gy+1,'S'); g.set(x,0,'S'); }
  for(let y=0;y<=gy;y++){ g.set(0,y,'S'); g.set(W-1,y,'S'); }
  // platforms + coins galore
  for(let x=3;x<W-3;x++){ g.set(x,gy-1,'o'); g.set(x,3,'o'); }
  for(let x=5;x<W-5;x++){ g.set(x,6,'S'); g.set(x,5,'o'); }
  for(let x=7;x<W-7;x++){ g.set(x,gy-4,'S'); g.set(x,gy-5,'o'); }
  g.set(4,8,'o'); g.set(W-5,8,'o'); g.set(4,2,'o'); g.set(W-5,2,'o');
  return finalize(g,{theme:'sky',time:300,name:'ボーナス',spawnTX:2,gy,goalTX:W+8,goalGroundY:gy,goalPoleTopY:3,seed:99});
}

function buildWater2(){
  // 2-2 : open water, swim up coin columns, dodge fish (bats).
  const W=200,H=15,gy=13; const g=new Grid(W,H); g.gy=gy;
  for(let x=0;x<W;x++){ g.set(x,gy,'X'); g.set(x,gy+1,'X'); }
  g.set(0,gy-1,'S'); g.set(1,gy-1,'S');
  const blk=(x,y,n)=>{ for(let i=0;i<n;i++) g.set(x+i,y,'S'); };
  const col=(x,y0,y1)=>{ for(let y=y0;y<=y1;y++) g.set(x,y,'o'); };
  blk(16,8,3); col(20,3,9); blk(28,5,2); blk(36,10,3);
  blk(48,7,4); col(56,3,8); blk(64,10,2); blk(72,5,3);
  blk(88,8,3); col(96,4,9); blk(108,6,3); blk(120,11,3);
  blk(132,7,4); col(140,3,8); blk(150,10,3); blk(162,6,3);
  blk(174,9,4); col(182,3,8);
  g.set(40,7,'b'); g.set(78,6,'b'); g.set(118,6,'b'); g.set(158,8,'b');
  g.set(96,gy-1,'H');
  g.set(56,2,'^'); g.set(140,2,'*');
  return finalize(g,{theme:'water',water:true,time:340,name:'2-2',spawnTX:3,gy,goalTX:W-4,goalGroundY:gy,goalPoleTopY:3,seed:414,zones:[{tx:55,ty:2,w:3,h:9,kind:'current',dy:-1,power:2.0},{tx:95,ty:3,w:3,h:9,kind:'current',dy:-1,power:1.9},{tx:120,ty:5,w:16,h:7,kind:'current',dx:1,power:0.35}]});
}
function buildSky2(){
  // 3-2 : floating islands, springs and moving platforms (falling = death).
  const W=212,H=15,gy=13; const g=new Grid(W,H); g.gy=gy;
  const isle=(x,w)=>{ for(let i=0;i<w;i++){ g.set(x+i,gy,'X'); g.set(x+i,gy+1,'X'); } };
  const plat=(x,y,w)=>{ for(let i=0;i<w;i++) g.set(x+i,y,'X'); };
  isle(0,8); g.set(3,9,'?'); g.set(5,9,'o');
  const spots=[];
  for(let x=12;x<=156;x+=9){ isle(x,5); spots.push(x); }
  isle(164,44);
  for(let i=0;i<spots.length;i++){ const sx=spots[i], m=i%4;
    if(i===6){ g.set(sx+2,9,'!'); }
    else if(m===0){ g.set(sx+1,9,'o'); g.set(sx+2,8,'o'); g.set(sx+3,9,'o'); }
    else if(m===1){ plat(sx+6,8,3); g.set(sx+7,7,'o'); }
    else if(m===2){ g.set(sx+2,gy-1,'b'); }
    else { g.set(sx+2,9,'?'); }
  }
  g.set(176,9,'?'); g.set(178,9,'o'); g.set(180,8,'o'); g.set(184,gy-1,'k');
  g.set(140,gy,'T'); g.set(140,7,'o'); g.set(140,6,'o');
  g.set(72,7,'b'); g.set(150,6,'b');
  g.set(103,gy-1,'H'); g.set(95,2,'*'); g.set(186,gy-4,'G');
  return finalize(g,{theme:'sky',time:330,name:'3-2',spawnTX:3,gy,goalTX:196,goalGroundY:gy,goalPoleTopY:3,seed:521,zones:[{tx:30,ty:5,w:26,h:6,kind:'wind',dir:1,power:0.3},{tx:100,ty:5,w:26,h:6,kind:'wind',dir:-1,power:0.3}],
    platforms:[{tx:89,ty:9,w:3,axis:'v',range:3,speed:0.9},{tx:125,ty:9,w:3,axis:'h',range:3,speed:1.0}]});
}
function makeBossArena(o){
  // Per-world boss hall. Defeat the boss (stomp or fireball, bossHP times) to win.
  const W=34,H=15,gy=13; const g=new Grid(W,H); g.gy=gy;
  for(let x=0;x<W;x++){ g.set(x,gy,'X'); g.set(x,gy+1,'X'); }
  for(let y=0;y<gy;y++){ g.set(0,y,'S'); g.set(1,y,'S'); g.set(W-2,y,'S'); g.set(W-1,y,'S'); }
  for(let y=2;y<gy;y+=2){ g.set(2,y,'o'); g.set(W-3,y,'o'); }
  g.set(9,gy-2,'B'); g.set(10,gy-2,'B'); g.set(W-11,gy-2,'B'); g.set(W-10,gy-2,'B');
  if(o.spring){ g.set(6,gy,'T'); g.set(W-7,gy,'T'); }
  g.set(18,gy-1,'O');
  return finalize(g,{theme:o.theme,water:!!o.water,time:o.time||400,name:o.name,boss:true,world:o.world,bossHP:o.hp,bossPal:o.pal,bossName:o.bossName,spawnTX:3,gy,goalTX:W+3,goalGroundY:gy,goalPoleTopY:3,seed:o.seed,zones:o.zones||[],bossAtk:o.atk||null});
}
function bossW1(){ return makeBossArena({theme:'overworld',world:1,hp:3,name:'1-ボス',bossName:'もりのおやぶん',seed:701,atk:{every:2.6,shoot:{n:1,kind:'acorn',speed:2.4,grav:0.16}}}); }
function bossW2(){ return makeBossArena({theme:'water',water:true,world:2,hp:4,name:'2-ボス',bossName:'うずまきボス',pal:{body:'#3f7fb0',belly:'#cdeefd',horn:'#27607e',brow:'#1d4257'},seed:702,zones:[{tx:2,ty:8,w:30,h:5,kind:'current',dx:1,power:0.22}],atk:{every:2.3,shoot:{n:3,spread:0.7,kind:'bubble',speed:2.1,grav:-0.015}}}); }
function bossW3(){ return makeBossArena({theme:'sky',world:3,hp:4,name:'3-ボス',bossName:'かみなりボス',spring:true,pal:{body:'#c75f8f',belly:'#ffd9ea',horn:'#8a3a66',brow:'#6e2a4e'},seed:703,zones:[{tx:2,ty:4,w:30,h:5,kind:'wind',dir:1,power:0.25}],atk:{every:2.0,shoot:{n:1,kind:'bolt',speed:3.8,grav:0},charge:{speed:5.5,dur:0.85}}}); }
function bossW4(){ return makeBossArena({theme:'castle',world:4,hp:6,name:'4-ボス',bossName:'まおうブランブル',pal:{body:'#7a4a9e',belly:'#ead9f5',horn:'#4a2a6a',brow:'#3a1f54'},seed:704,zones:[{tx:2,ty:13,w:14,h:1,kind:'conveyor',dir:1,power:0.45},{tx:18,ty:13,w:14,h:1,kind:'conveyor',dir:-1,power:0.45}],atk:{every:1.7,shoot:{n:3,spread:0.8,kind:'orb',speed:3.0,grav:0},charge:{speed:6.2,dur:1.0}}}); }

const LEVELS=[
  buildLevel1, buildLevel2, bossW1,
  buildLevelWater, buildWater2, bossW2,
  buildLevel5, buildSky2, bossW3,
  buildLevel3, buildLevel4, bossW4,
];

export { Grid, LEVELS, bossW1, bossW2, bossW3, bossW4, buildBonus, buildLevel1, buildLevel2, buildLevel3, buildLevel4, buildLevel5, buildLevel6, buildLevel7, buildSky2, buildLevelWater, buildWater2, finalize, makeBossArena, makeDecor, pipe, row, stairDown, stairUp, warpPipe };
