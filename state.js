import { stage } from '../engine/canvas.js';
import { game } from '../game/state.js';
import { BossScene } from './BossScene.js';
import { CutsceneScene } from './CutsceneScene.js';
import { StageScene } from './StageScene.js';
import { TitleScene } from './TitleScene.js';
import { OpeningScene } from './OpeningScene.js';
import { WorldMapScene } from './WorldMapScene.js';

class SceneManager{
  constructor(){ this.scenes={}; this.current=null; this.currentName=null; }
  register(name, scene){ this.scenes[name]=scene; scene.manager=this; }
  set(name){ const s=this.scenes[name]; if(s){ this.currentName=name; this.current=s; if(s.enter) s.enter(); } }
  sync(){ let want='stage'; if(game.state==='opening') want='opening'; else if(game.state==='title') want='title'; else if(game.state==='worldmap') want='worldmap'; if(want!==this.currentName) this.set(want); }
  update(dt){ if(this.current && this.current.update) this.current.update(dt); this.sync(); }
  render(){ if(this.current && this.current.render) this.current.render(); }
}
const scenes = new SceneManager();
scenes.register('opening', new OpeningScene());
scenes.register('title', new TitleScene());
scenes.register('stage', new StageScene());
scenes.register('worldmap', new WorldMapScene());
scenes.register('boss', new BossScene());
scenes.register('cutscene', new CutsceneScene());

export { SceneManager, scenes };
