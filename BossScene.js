// ============ AUDIO ============
let AC=null, master=null, sfxGain=null, musicGain=null, audioReady=false, muted=false, musicOn=true;
let musicTimer=null, seqArr=[], loopBeats=8, schedIdx=0, loopStartTime=0; const BPM=138, SPB=60/BPM;
function initAudioOnce(){
  if(audioReady){ if(AC.state==='suspended') AC.resume(); return; }
  try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return; }
  master=AC.createGain(); master.gain.value=muted?0:0.85; master.connect(AC.destination);
  sfxGain=AC.createGain(); sfxGain.gain.value=0.5; sfxGain.connect(master);
  musicGain=AC.createGain(); musicGain.gain.value=0.18; musicGain.connect(master);
  audioReady=true; startMusic();
}
function toggleMute(){ muted=!muted; if(master) master.gain.value=muted?0:0.85; document.getElementById('muteBtn').innerHTML=muted?'&#9834;&#824;':'&#9834;'; }
function duckMusic(v){ if(musicGain&&AC) musicGain.gain.setTargetAtTime(0.18*v, AC.currentTime, 0.05); }
function blip(o){
  if(!audioReady) return;
  const t0=AC.currentTime+(o.when||0); const dur=o.dur||0.1;
  const osc=AC.createOscillator(), g=AC.createGain();
  osc.type=o.type||'square';
  osc.frequency.setValueAtTime(o.f0||440,t0);
  if(o.f1 && o.f1!==o.f0) osc.frequency.exponentialRampToValueAtTime(Math.max(1,o.f1), t0+dur);
  g.gain.setValueAtTime(0.0001,t0);
  g.gain.exponentialRampToValueAtTime(o.vol||0.3, t0+0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
  osc.connect(g); g.connect(o.bus||sfxGain); osc.start(t0); osc.stop(t0+dur+0.03);
}
function noiseBurst(o){
  if(!audioReady) return;
  const t0=AC.currentTime+(o.when||0); const dur=o.dur||0.15;
  const buf=AC.createBuffer(1, Math.ceil(AC.sampleRate*dur), AC.sampleRate);
  const d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  const src=AC.createBufferSource(); src.buffer=buf;
  const f=AC.createBiquadFilter(); f.type=o.filter||'lowpass'; f.frequency.value=o.freq||1400;
  const g=AC.createGain(); g.gain.setValueAtTime(o.vol||0.3,t0); g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  src.connect(f); f.connect(g); g.connect(sfxGain); src.start(t0); src.stop(t0+dur);
}
function seq(notes,type,vol){ if(!audioReady) return; let w=0; for(const n of notes){ blip({type:type||'square', f0:n[0], f1:n[0], dur:n[1]*0.92, vol:vol||0.26, when:w}); w+=n[1]; } }
const sfxJump   = ()=> blip({type:'square', f0:300, f1:660, dur:0.15, vol:0.22});
const sfxStomp  = ()=> { noiseBurst({filter:'lowpass', freq:1100, dur:0.1, vol:0.32}); blip({type:'square', f0:220, f1:90, dur:0.1, vol:0.2}); };
const sfxCoin   = ()=> { blip({type:'square', f0:988, dur:0.06, vol:0.25}); blip({type:'square', f0:1319, dur:0.14, vol:0.25, when:0.06}); };
const sfxBump   = ()=> blip({type:'square', f0:180, f1:120, dur:0.08, vol:0.22});
const sfxBreak  = ()=> { noiseBurst({filter:'lowpass', freq:2600, dur:0.18, vol:0.4}); blip({type:'square', f0:240, f1:120, dur:0.1, vol:0.2}); };
const sfxKick   = ()=> blip({type:'square', f0:520, f1:180, dur:0.12, vol:0.25});
const sfxFire   = ()=> { blip({type:'sawtooth', f0:700, f1:1500, dur:0.08, vol:0.18}); noiseBurst({filter:'highpass', freq:1800, dur:0.06, vol:0.14}); };
const sfxSprout = ()=> seq([[330,0.07],[440,0.07],[554,0.07],[659,0.12]],'square',0.24);
const sfxPowerup= ()=> seq([[392,0.06],[523,0.06],[659,0.06],[784,0.06],[1047,0.14]],'square',0.26);
const sfxShrink = ()=> { blip({type:'square', f0:520, f1:170, dur:0.22, vol:0.24}); noiseBurst({filter:'lowpass', freq:900, dur:0.12, vol:0.18}); };
const sfx1up    = ()=> seq([[659,0.1],[784,0.1],[1047,0.1],[1319,0.22]],'square',0.24);
const sfxFlag   = ()=> seq([[523,0.09],[659,0.09],[784,0.09],[1047,0.18]],'triangle',0.26);
const sfxFlagDn = ()=> blip({type:'square', f0:400, f1:200, dur:0.12, vol:0.2});
const sfxTick   = ()=> blip({type:'square', f0:1200, dur:0.03, vol:0.13});
const sfxClear  = ()=> seq([[523,0.13],[659,0.13],[784,0.13],[1047,0.13],[784,0.13],[1047,0.34]],'triangle',0.28);
const sfxDie    = ()=> seq([[440,0.14],[392,0.14],[330,0.14],[262,0.14],[196,0.32]],'triangle',0.28);
const sfxWin    = ()=> seq([[523,0.12],[523,0.12],[523,0.12],[523,0.18],[415,0.18],[466,0.18],[523,0.18],[1,0.1],[466,0.12],[523,0.4]],'square',0.26);
const sfxPause  = ()=> blip({type:'square', f0:600, dur:0.05, vol:0.18});
function buildSeq(){
  const chords=[ [60,64,67], [57,60,64], [53,57,60], [55,59,62] ];
  seqArr=[]; let tb=0; const e=0.5;
  for(const ch of chords){
    const pat=[ch[0]+12, ch[1]+12, ch[2]+12, ch[1]+12];
    for(let i=0;i<4;i++) seqArr.push({t:tb+i*e, dur:e*0.9, midi:pat[i], voice:'lead'});
    seqArr.push({t:tb, dur:0.9, midi:ch[0]-12, voice:'bass'});
    seqArr.push({t:tb+1, dur:0.9, midi:ch[2]-12, voice:'bass'});
    tb+=2;
  }
  loopBeats=tb;
}
const ntf = n=> 440*Math.pow(2,(n-69)/12);
function startMusic(){
  if(!audioReady||musicTimer) return;
  buildSeq(); loopStartTime=AC.currentTime+0.12; schedIdx=0;
  musicTimer=setInterval(()=>{
    if(!musicOn||!audioReady) return;
    const ahead=0.2;
    for(let guard=0; guard<64; guard++){
      const ev=seqArr[schedIdx]; const et=loopStartTime+ev.t*SPB;
      if(et < AC.currentTime+ahead){
        const o=AC.createOscillator(), g=AC.createGain();
        o.type = ev.voice==='lead'?'square':'triangle';
        o.frequency.value=ntf(ev.midi);
        const peak = ev.voice==='lead'?0.16:0.2;
        g.gain.setValueAtTime(0.0001,et);
        g.gain.linearRampToValueAtTime(peak, et+0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, et+ev.dur*SPB);
        o.connect(g); g.connect(musicGain); o.start(et); o.stop(et+ev.dur*SPB+0.05);
        schedIdx++; if(schedIdx>=seqArr.length){ schedIdx=0; loopStartTime+=loopBeats*SPB; }
      } else break;
    }
  },30);
}

export { AC, BPM, SPB, audioReady, blip, buildSeq, duckMusic, initAudioOnce, loopBeats, loopStartTime, master, musicGain, musicOn, musicTimer, muted, noiseBurst, ntf, schedIdx, seq, seqArr, sfx1up, sfxBreak, sfxBump, sfxClear, sfxCoin, sfxDie, sfxFire, sfxFlag, sfxFlagDn, sfxGain, sfxJump, sfxKick, sfxPause, sfxPowerup, sfxShrink, sfxSprout, sfxStomp, sfxTick, sfxWin, startMusic, toggleMute };
