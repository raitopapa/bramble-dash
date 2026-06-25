// 4 worlds, each = 2 stages + 1 boss. Nodes climb toward each world's boss.
const MAP_NODES = [
  { nx:0.06, ny:0.64, name:'1-1', world:1 },
  { nx:0.135, ny:0.50, name:'1-2', world:1 },
  { nx:0.215, ny:0.40, name:'ボス', world:1, boss:true },
  { nx:0.31, ny:0.64, name:'2-1', world:2 },
  { nx:0.385, ny:0.50, name:'2-2', world:2 },
  { nx:0.465, ny:0.40, name:'ボス', world:2, boss:true },
  { nx:0.555, ny:0.64, name:'3-1', world:3 },
  { nx:0.63, ny:0.50, name:'3-2', world:3 },
  { nx:0.71, ny:0.40, name:'ボス', world:3, boss:true },
  { nx:0.80, ny:0.64, name:'4-1', world:4 },
  { nx:0.875, ny:0.50, name:'4-2', world:4 },
  { nx:0.95, ny:0.40, name:'ボス', world:4, boss:true },
];
const MAP_PATHS = [];
for (let i = 0; i < MAP_NODES.length - 1; i++) MAP_PATHS.push([i, i + 1]);
const WORLD_NAMES = ['ワールド1 くさはら', 'ワールド2 みずべ', 'ワールド3 おおぞら', 'ワールド4 まおうのしろ'];
const WORLD_COLORS = ['#57c84d', '#3fc6c0', '#ff8ad2', '#b06aff'];
export { MAP_NODES, MAP_PATHS, WORLD_COLORS, WORLD_NAMES };
