import { DIFFICULTY } from '../core/constants.js';
import { edge, inputBegin, inputEnd } from '../core/input.js';
import { renderTitle } from '../draw/render.js';
import { sfxCoin } from '../engine/audio.js';
import { saveProgress, updateMenu } from '../game/flow.js';
import { game } from '../game/state.js';

class TitleScene{
  update(dt){ inputBegin();
    if(edge.left||edge.right){ const n=DIFFICULTY.length; game.difficulty=(game.difficulty+(edge.right?1:n-1))%n; game.diff=DIFFICULTY[game.difficulty]; game.lives=game.diff.lives; sfxCoin(); saveProgress(); }
    updateMenu(dt); inputEnd(); }
  render(){ renderTitle(); }
}

export { TitleScene };
