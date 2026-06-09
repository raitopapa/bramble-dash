import { THEMES } from '../core/constants.js';
import { mulberry32 } from '../core/utils.js';

// ============ LEVELS ============
class Grid{
  constructor(w,h){ this.w=w; this.h=h; this.c=[]; for(let y=0;y<h;y++) this.c.push(new Array(w).fill(' ')); this.gy=h-2; }
  set(x,y,ch){ if(x<0||x>=this.w||y<0||y>=this.h) return; this.c[y][x]=ch; }
  get(x,y){ if(x<0||x>=this.w||y<0||y>=this.h) return ' '; return this.c[y][x]; }
}
function pipe(g,x,h,gy){ for(let j=0;j<h;j++){ g.set(x,gy-1-j,'P'); g.set(x+1,gy-1-j,'P'); } }
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
    platforms:opts.platforms||[] };
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
  return finalize(g,{theme:'cave',time:320,name:'2-1',spawnTX:3,gy,goalTX:190,goalGroundY:gy,goalPoleTopY:4,seed:77});
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
  return finalize(g,{theme:'cave',time:340,name:'2-2',spawnTX:3,gy,goalTX:202,goalGroundY:gy,goalPoleTopY:4,seed:123});
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
  return finalize(g,{theme:'sky',time:320,name:'3-1',spawnTX:3,gy,goalTX:196,goalGroundY:gy,goalPoleTopY:3,seed:321,
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
const LEVELS=[buildLevel1, buildLevel2, buildLevel3, buildLevel4, buildLevel5, buildLevel6];

export { Grid, LEVELS, buildLevel1, buildLevel2, buildLevel3, buildLevel4, buildLevel5, buildLevel6, finalize, makeDecor, pipe, row, stairDown, stairUp };
