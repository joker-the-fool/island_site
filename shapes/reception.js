(function () {
  'use strict';
  // 建築：服務台（藍色雨棚＋櫃台＋服務鈴）
  // 本檔案自成一體：用到的小零件都放在這裡，不和其他建築共用

  // build(color, ctx)：回傳建築的 THREE.Group；ctx = { index, r, face, onUpdate(fn) }，要每幀動的東西用 ctx.onUpdate(function (dt) {…}) 登記
  (window.ISLAND_SHAPES = window.ISLAND_SHAPES || {}).reception = {
    label: "服務台", desc: "藍色雨棚＋櫃台＋服務鈴", themed: true,
    build(color, ctx) {
      const col = new THREE.Color(color), g = new THREE.Group();
      g.add(boxM(3.4, 0.12, 2.6, 0xe9e0cf, 0, 0.06, 0));
      for (const [x, z] of [[-1.5, -1.0], [1.5, -1.0], [-1.5, 1.0], [1.5, 1.0]]) { g.add(cylM(0.06, 0.06, 2.0, 0xf5f5f5, x, 1.06, z, 6)); }
      g.add(boxM(3.4, 0.14, 2.6, 0x3a7bc8, 0, 2.1, 0));
      g.add(boxM(3.4, 0.45, 0.08, 0x2c5f9e, 0, 1.85, 1.3));
      g.add(boxM(2.6, 1.3, 0.08, 0xe9e0cf, 0, 0.77, -0.85));
      g.add(boxM(2.4, 0.9, 0.7, 0x8a5a35, 0, 0.57, 0.1));
      g.add(boxM(2.6, 0.08, 0.85, 0xf5f5f5, 0, 1.06, 0.1));
      const bell = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xe8b040)); bell.position.set(0.6, 1.1, 0.2); bell.castShadow = true; g.add(bell);
      g.add(cylM(0.17, 0.17, 0.03, 0xe8b040, 0.6, 1.1, 0.2, 12));
      g.add(boxM(0.5, 0.35, 0.04, 0x222222, -0.6, 1.4, 0.0)); g.add(boxM(0.06, 0.2, 0.06, 0x444444, -0.6, 1.2, 0.0));
      for (const [x, c] of [[-1.0, 0xe84a4a], [-0.88, 0x3aa856], [-0.76, 0xe0a040]]) { g.add(boxM(0.1, 0.18, 0.04, c, x, 1.19, 0.4)); }
      return g;
    }
  };
})();
