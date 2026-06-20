import { DIFFICULTY, SKINS } from '../core/constants.js';
import { edge, inputBegin, inputEnd } from '../core/input.js';
import { renderTitle } from '../draw/render.js';
import { sfxCoin } from '../engine/audio.js';
import { saveProgress, updateMenu } from '../game/flow.js';
import { game, skinUnlocked } from '../game/state.js';

class TitleScene{
  update(dt){ inputBegin();
    if(edge.left||edge.right){ const n=DIFFICULTY.length; game.difficulty=(game.difficulty+(edge.right?1:n-1))%n; game.diff=DIFFICULTY[game.difficulty]; game.lives=game.diff.lives; sfxCoin(); saveProgress(); }
    if(edge.up||edge.down){ const dir=edge.down?1:-1; let i=game.skin|0; for(let k=0;k<SKINS.length;k++){ i=(i+dir+SKINS.length)%SKINS.length; if(skinUnlocked(i)){ game.skin=i; sfxCoin(); saveProgress(); break; } } }
    updateMenu(dt); inputEnd(); }
  render(){ renderTitle(); }
}

export { TitleScene };
