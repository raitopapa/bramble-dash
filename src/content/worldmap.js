// content/worldmap.js — overworld layout. Node index N corresponds to LEVELS[N].
// Coordinates are normalized (0..1) of the canvas so the map scales to any size.
// When adding stages: append a level to content/levels.js AND a node here.

const MAP_NODES = [
  { nx: 0.08, ny: 0.66, name: '1-1' },
  { nx: 0.20, ny: 0.45, name: '1-2' },
  { nx: 0.32, ny: 0.63, name: '2-1' },
  { nx: 0.44, ny: 0.44, name: '2-2' },
  { nx: 0.56, ny: 0.63, name: '2-3' },
  { nx: 0.68, ny: 0.44, name: '3-1' },
  { nx: 0.80, ny: 0.62, name: '3-2' },
  { nx: 0.92, ny: 0.45, name: 'ボス' },
];

const MAP_PATHS = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]];

export { MAP_NODES, MAP_PATHS };
