(function () {
  'use strict';
  // 建築：小屋加水晶（小屋＋三顆藍色水晶；人物不在這裡，見 characters\）
  // 本檔案自成一體：用到的小零件都放在這裡，不和其他建築共用

  function houseMesh(roof, w = 2.4, h = 1.6, d = 2.2) {
    const g = new THREE.Group();
    g.add(mk(new THREE.BoxGeometry(w, h, d), 0xfff1d6, 0, h / 2, 0));
    const r = mk(new THREE.ConeGeometry(Math.max(w, d) * 0.82, h * 0.85, 4), roof, 0, h + h * 0.42, 0); r.rotation.y = Math.PI / 4; g.add(r);
    g.add(mk(new THREE.BoxGeometry(0.5, 0.9, 0.06), 0x8a5a35, 0, 0.45, d / 2 + 0.02));
    g.add(mk(new THREE.BoxGeometry(0.45, 0.4, 0.06), 0x9ccfe0, w * 0.28, h * 0.62, d / 2 + 0.02));
    return g;
  }

  // build(color, ctx)：回傳建築的 THREE.Group；ctx = { index, r, face, onUpdate(fn) }，要每幀動的東西用 ctx.onUpdate(function (dt) {…}) 登記
  (window.ISLAND_SHAPES = window.ISLAND_SHAPES || {}).crystal = {
    label: "小屋加水晶", desc: "小屋＋三顆藍色水晶", themed: false, treeLeft: true, treeBehind: true,
    build(color, ctx) {
      const col = new THREE.Color(color), g = new THREE.Group();
      g.add(houseMesh(col, 2.6, 1.7, 2.2).translateX(-1));
      for (let k = 0; k < 3; k++) {
        const m = mk(new THREE.OctahedronGeometry(0.55 + k * 0.18), 0x9cc8f0, 1.9 + k * 0.5, 1 + k * 0.25, -0.6 + (k % 2) * 1.2);
        m.scale.y = 1.9; g.add(m);
      }
      return g;
    }
  };
})();
