// 要載入的 js（依序載入，順序不能亂）：
//   core → scene → 各種建築（shapes）→ 島上人物（characters）→ island → satellites → 生物（creatures）→ sky → main
// 新增一種建築 = 在 shapes\ 放一個檔案，再把檔名加到下面的 shapes\ 區；維護工具的 shape 選單會自動多一項
window.ISLAND_SCRIPTS = [
  'js/core.js',
  'js/scene.js',
  'shapes/mall.js',
  'shapes/reception.js',
  'shapes/toy.js',
  'shapes/server.js',
  'shapes/pavilion.js',
  'shapes/cinema.js',
  'shapes/crystal.js',
  'shapes/fashion.js',
  'shapes/tower.js',
  'shapes/house.js',
  'shapes/isle_lighthouse.js',
  'shapes/isle_pool.js',
  'shapes/isle_nature.js',
  'characters/hostess.js',
  'characters/serverman.js',
  'js/island.js',
  'js/satellites.js',
  'creatures/walker.js',
  'creatures/fish.js',
  'creatures/seagull.js',
  'js/sky.js',
  'js/main.js'
];
