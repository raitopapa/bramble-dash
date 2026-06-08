import { edge, inputBegin, inputEnd } from '../core/input.js';
import { renderStage } from '../draw/render.js';
import { duckMusic, sfxPause } from '../engine/audio.js';
import { updateClear, updateDying, updateMenu, updateParticlesOnly, updatePlaying } from '../game/flow.js';
import { game } from '../game/state.js';

class StageScene{
  update(dt){
    inputBegin();
    if(game.state==='gameover'||game.state==='win') updateMenu(dt);
    else if(game.state==='paused'){ if(edge.pause||edge.start){ game.state='playing'; duckMusic(1); sfxPause(); } }
    else if(game.state==='playing') updatePlaying(dt);
    else if(game.state==='dying'){ updateDying(dt); updateParticlesOnly(dt); }
    else if(game.state==='levelclear'){ updateClear(dt); updateParticlesOnly(dt); }
    inputEnd();
  }
  render(){ renderStage(); }
}

export { StageScene };
