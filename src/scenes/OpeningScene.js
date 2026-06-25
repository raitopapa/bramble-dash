import { edge, inputBegin, inputEnd } from '../core/input.js';
import { setMusicTrack, sfxCoin, sfxJump } from '../engine/audio.js';
import { game } from '../game/state.js';
import { hasSave, loadProgress, wipeSave } from '../game/flow.js';
import { renderOpening } from '../draw/render.js';

class OpeningScene{
  enter(){ this.sel = hasSave() ? 1 : 0; setMusicTrack('map'); }
  update(){
    inputBegin();
    const canLoad = hasSave();
    if(!canLoad) this.sel = 0;
    if(edge.left || edge.right){ if(canLoad){ this.sel = this.sel === 0 ? 1 : 0; sfxJump(); } }
    else if(edge.jump || edge.start){ this._choose(canLoad); }
    inputEnd();
  }
  _choose(canLoad){
    if(this.sel === 1 && canLoad) loadProgress(); else wipeSave();
    sfxCoin(); game.state = 'title';
  }
  render(){ renderOpening(this.sel, hasSave()); }
}
export { OpeningScene };
