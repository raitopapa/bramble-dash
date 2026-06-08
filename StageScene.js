import { STEP } from '../core/constants.js';
import { scenes } from '../scenes/SceneManager.js';

let animClock = 0, last = 0, acc = 0;
function frame(t){ if(!last) last=t; let dt=(t-last)/1000; last=t; if(dt>0.1)dt=0.1; animClock+=dt; acc+=dt; let steps=0; while(acc>=STEP && steps<5){ scenes.update(STEP); acc-=STEP; steps++; } if(acc>STEP) acc=0; scenes.render(); requestAnimationFrame(frame); }
function startLoop(){ requestAnimationFrame(frame); }

export { acc, animClock, frame, last, startLoop };
