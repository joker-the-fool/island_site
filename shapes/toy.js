(function () {
  'use strict';
  // 建築：玩具店（積木屋頂＋小熊玩偶）
  // 本檔案自成一體：用到的小零件都放在這裡，不和其他建築共用

  function bearMesh() { // 坐姿小熊玩偶
    const g = new THREE.Group(), brown = 0xa8703c, light = 0xd9a86a;
    const body = sphM(0.26, brown, 0, 0.3, 0); body.scale.y = 1.1; g.add(body);
    g.add(sphM(0.17, light, 0, 0.3, 0.14));
    g.add(sphM(0.2, brown, 0, 0.72, 0));
    for (const sd of [-1, 1]) {
      g.add(sphM(0.08, brown, sd * 0.15, 0.89, 0)); g.add(sphM(0.04, light, sd * 0.15, 0.89, 0.04));
      g.add(sphM(0.09, brown, sd * 0.28, 0.36, 0.05)); g.add(sphM(0.12, brown, sd * 0.15, 0.1, 0.14));
      g.add(sphM(0.025, 0x111111, sd * 0.07, 0.76, 0.18));
    }
    g.add(sphM(0.09, light, 0, 0.68, 0.17)); g.add(sphM(0.035, 0x111111, 0, 0.7, 0.25));
    g.add(sphM(0.04, 0xd8303a, 0, 0.52, 0.17)); for (const sd of [-1, 1]) { g.add(sphM(0.05, 0xd8303a, sd * 0.07, 0.52, 0.17)); } // 紅領結
    return g;
  }

  // build(color, ctx)：回傳建築的 THREE.Group；ctx = { index, r, face, onUpdate(fn) }，要每幀動的東西用 ctx.onUpdate(function (dt) {…}) 登記
  (window.ISLAND_SHAPES = window.ISLAND_SHAPES || {}).toy = {
    label: "玩具店", desc: "積木屋頂＋小熊玩偶", themed: true,
    build(color, ctx) {
      const col = new THREE.Color(color), g = new THREE.Group();
      g.add(boxM(3.0, 1.6, 2.3, 0xffd35c, 0, 0.8, 0));
      g.add(boxM(3.2, 0.15, 2.5, 0x3a7bc8, 0, 1.68, 0));
      [0xe84a4a, 0x3a7bc8, 0x3aa856, 0x9b59b6, 0xe0a040].forEach((c, k) => { const b = boxM(0.5, 0.5, 0.5, c, -1.2 + k * 0.6, 2.0, 0); b.rotation.y = k * 0.4; g.add(b); });
      g.add(boxM(2.0, 0.4, 0.04, 0xe84a4a, -0.3, 1.38, 1.17)); // 紅色招牌板（不寫字）
      for (const x of [-1.0, -0.3]) { const w = cylM(0.26, 0.26, 0.05, 0xaee0f2, x, 0.75, 1.17, 16); w.rotation.x = Math.PI / 2; g.add(w); }
      g.add(boxM(0.7, 1.0, 0.06, 0xe84a4a, 0.85, 0.5, 1.17));
      const bear = bearMesh(); bear.position.set(1.25, 0, 1.65); bear.scale.setScalar(0.8); bear.rotation.y = -0.3; g.add(bear);
      return g;
    }
  };
})();
