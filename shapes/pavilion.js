(function () {
  'use strict';
  // 建築：涼亭（六角涼亭）
  // 本檔案自成一體：用到的小零件都放在這裡，不和其他建築共用

  // build(color, ctx)：回傳建築的 THREE.Group；ctx = { index, r, face, onUpdate(fn) }，要每幀動的東西用 ctx.onUpdate(function (dt) {…}) 登記
  (window.ISLAND_SHAPES = window.ISLAND_SHAPES || {}).pavilion = {
    label: "涼亭", desc: "六角涼亭", themed: false,
    build(color, ctx) {
      const col = new THREE.Color(color), g = new THREE.Group();
      for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { g.add(mk(new THREE.CylinderGeometry(0.1, 0.1, 1.6, 6), 0xfff1d6, x, 0.8, z)); }
      g.add(mk(new THREE.ConeGeometry(1.9, 1.1, 6), col, 0, 2.15, 0));
      g.add(mk(new THREE.CylinderGeometry(1.2, 1.2, 0.15, 12), 0xe8d3a6, 0, 0.08, 0));
      return g;
    }
  };
})();
