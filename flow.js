import { canvas, ctx } from '../engine/canvas.js';

class BossScene{
  update(dt){}
  render(){
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle='#10183a'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#cfe0ff'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.font=Math.round(canvas.height*0.05)+'px "Press Start 2P", monospace';
    ctx.fillText('BOSS', canvas.width/2, canvas.height*0.42);
    ctx.font=Math.round(canvas.height*0.03)+'px "Press Start 2P","Hiragino Maru Gothic ProN",sans-serif';
    ctx.fillText('準備中', canvas.width/2, canvas.height*0.56);
  }
}

export { BossScene };
