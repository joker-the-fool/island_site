(function () {
  'use strict';
  // 建築：服飾店（櫥窗模特兒＋條紋遮陽棚）
  // 本檔案自成一體：用到的小零件都放在這裡，不和其他建築共用

  // 站立的服飾店模特兒（無五官的白色假人，穿洋裝或套裝）
  function mannequinMesh(cloth, top) {
    const g = new THREE.Group(), pale = 0xf0e4d8;
    g.add(cylM(0.16, 0.16, 0.03, 0x555555, 0, 0.015, 0, 14));
    g.add(cylM(0.025, 0.025, 0.55, 0x777777, 0, 0.3, 0, 6));
    g.add(cylM(0.1, 0.17, 0.45, cloth, 0, 0.55, 0, 10));
    g.add(cylM(0.12, 0.1, 0.3, top, 0, 0.93, 0, 10));
    g.add(cylM(0.045, 0.045, 0.07, pale, 0, 1.12, 0, 6));
    const head = sphM(0.09, pale, 0, 1.22, 0); head.scale.y = 1.15; g.add(head);
    for (const sd of [-1, 1]) { const a = cylM(0.03, 0.025, 0.4, pale, sd * 0.17, 0.92, 0, 6); a.rotation.z = sd * 0.15; g.add(a); }
    return g;
  }

  // build(color, ctx)：回傳建築的 THREE.Group；ctx = { index, r, face, onUpdate(fn) }，要每幀動的東西用 ctx.onUpdate(function (dt) {…}) 登記
  (window.ISLAND_SHAPES = window.ISLAND_SHAPES || {}).fashion = {
    label: "服飾店", desc: "櫥窗模特兒＋條紋遮陽棚", themed: true, treeLeft: true,
    build(color, ctx) {
      const col = new THREE.Color(color), g = new THREE.Group();
      g.add(boxM(3.2, 1.7, 2.3, 0xf3d9e3, 0, 0.85, 0));
      g.add(boxM(3.4, 0.16, 2.5, 0xb8537a, 0, 1.78, 0));
      g.add(boxM(2.3, 0.5, 0.1, 0x8a2f55, 0, 2.15, 0.88));
      const glass = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 0.04), new THREE.MeshStandardMaterial({ color: 0xcfe8f0, transparent: true, opacity: 0.4, roughness: 0.2 }));
      glass.position.set(-0.4, 0.95, 1.17); g.add(glass);
      [[-0.95, 0xd04a7a], [-0.25, 0x3a7bc8]].forEach(([x, c]) => {
        g.add(cylM(0.1, 0.2, 0.6, c, x, 0.7, 1.0, 8)); g.add(sphM(0.09, 0xf0e4d8, x, 1.12, 1.0)); g.add(cylM(0.15, 0.15, 0.04, 0x555555, x, 0.4, 1.0, 10));
      });
      for (let k = 0; k < 6; k++) { const a = boxM(0.5, 0.08, 0.8, k % 2 ? 0xffffff : 0xb8537a, -1.25 + k * 0.5, 1.5, 1.5); a.rotation.x = 0.3; g.add(a); }
      g.add(boxM(0.6, 1.0, 0.06, 0x8a2f55, 1.2, 0.5, 1.17));
      for (const x of [2.7, 3.5]) { g.add(cylM(0.03, 0.03, 1.0, 0x888888, x, 0.5, 1.6, 6)); }
      g.add(boxM(0.9, 0.03, 0.03, 0x888888, 3.1, 1.0, 1.6));
      [0xd04a7a, 0x3a7bc8, 0xe0a040, 0x7a9f5a].forEach((c, k) => { g.add(boxM(0.14, 0.38, 0.05, c, 2.8 + k * 0.2, 0.78, 1.6)); });
      // 門口兩側各一個模特兒
      const m1 = mannequinMesh(0xd04a7a, 0xf3d9e3); m1.position.set(0.55, 0, 1.65); m1.rotation.y = 0.2; g.add(m1);
      const m2 = mannequinMesh(0x2a2a2a, 0x3a7bc8); m2.position.set(1.85, 0, 1.65); m2.rotation.y = -0.2; g.add(m2);
      return g;
    }
  };
})();
