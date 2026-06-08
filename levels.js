import { inputBegin, inputEnd } from '../core/input.js';
import { renderTitle } from '../draw/render.js';
import { updateMenu } from '../game/flow.js';

class TitleScene{
  update(dt){ inputBegin(); updateMenu(dt); inputEnd(); }
  render(){ renderTitle(); }
}

export { TitleScene };
