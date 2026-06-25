import { edge, inputBegin, inputEnd } from '../core/input.js';
import { renderStage } from '../draw/render.js';
import { duckMusic, sfxJump, sfxPause } from '../engine/audio.js';
import { returnToMap, updateClear, updateDying, updateMenu, updateParticlesOnly, updatePlaying } from '../game/flow.js';
import { game } from '../game/state.js';

class StageScene{
  update(dt){
    inputBegin();
    if(game.state==='gameover'||game.state==='win') updateMenu(dt);
    else if(game.state==='paused'){
      if(game.pauseConfirm){
        if(edge.left){ if(game.confirmSel!==0){ game.confirmSel=0; sfxJump(); } }
        else if(edge.right){ if(game.confirmSel!==1){ game.confirmSel=1; sfxJump(); } }
        else if(edge.jump||edge.start){ if((game.confirmSel|0)===0){ returnToMap(); } else { game.pauseConfirm=false; sfxPause(); } }
        else if(edge.pause){ game.pauseConfirm=false; sfxPause(); }
      } else {
        if(edge.pause){ game.state='playing'; duckMusic(1); sfxPause(); }
        else if(edge.left){ if(game.pauseSel!==0){ game.pauseSel=0; sfxJump(); } }
        else if(edge.right){ if(game.pauseSel!==1){ game.pauseSel=1; sfxJump(); } }
        else if(edge.jump||edge.start){ if((game.pauseSel|0)===1){ game.pauseConfirm=true; game.confirmSel=1; sfxPause(); } else { game.state='playing'; duckMusic(1); sfxPause(); } }
      }
    }
    else if(game.state==='playing') updatePlaying(dt);
    else if(game.state==='dying'){ updateDying(dt); updateParticlesOnly(dt); }
    else if(game.state==='levelclear'){ updateClear(dt); updateParticlesOnly(dt); }
    inputEnd();
  }
  render(){ renderStage(); }
}

export { StageScene };
