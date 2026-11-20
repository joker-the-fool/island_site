(function () {
  'use strict';
  // 建築：燈塔（燈塔＋小屋）
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
  (window.ISLAND_SHAPES = window.ISLAND_SHAPES || {}).tower = {
    label: "燈塔", desc: "燈塔＋小屋", themed: false,
    build(color, ctx) {
      const col = new THREE.Color(color), g = new THREE.Group();
      g.add(mk(new THREE.CylinderGeometry(0.75, 1.05, 3.2, 10), 0xfff1d6, 0, 1.6, 0));
      g.add(mk(new THREE.CylinderGeometry(0.85, 0.9, 0.6, 10), col, 0, 1.4, 0));
      g.add(mk(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 10), 0xffe9a8, 0, 3.45, 0));
      g.add(mk(new THREE.ConeGeometry(0.85, 0.9, 10), col, 0, 4.15, 0));
      g.add(houseMesh(0xc4503a, 2.2, 1.3, 1.8).translateX(2.2).translateZ(0.8));
      return g;
    }
  };
})();
