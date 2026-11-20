(function () {
  'use strict';
  // 生物：橋上走動的小人（每座橋兩個，來回走）。自成一體：身體是圓柱＋球，不使用其他檔案的人物零件
  const shirt = [0xc4503a, 0x6f9bc4, 0xe0a040, 0x7a9f5a, 0xb86f9c, 0x5aa0a8];
  const walkers = WALKERS; // 位置資料登記在 core.js 的共用登記表，迎賓女服務員、推眼鏡的人只讀這份位置

  function walkerPos(w, out) {
    let s = w.s, k = 0;
    while (k < 2 && s > w.segLen[k]) { s -= w.segLen[k]; k++; }
    const u = w.segLen[k] > 0 ? s / w.segLen[k] : 0;
    out.lerpVectors(w.b.pts[k], w.b.pts[k + 1], u);
    out.y = 0.5 + (k === 1 ? Math.sin(u * Math.PI) * 0.12 : 0) + Math.abs(Math.sin(w.s * 7)) * 0.05;
  }

  CREATURES.push({
    name: 'walker',
    setup() {
      bridges.forEach((b, bi) => {
        const segLen = [0, 1, 2].map(k => b.pts[k].distanceTo(b.pts[k + 1]));
        const total = segLen[0] + segLen[1] + segLen[2];
        for (let k = 0; k < 2; k++) {
          const p = new THREE.Group();
          p.add(mk(new THREE.CylinderGeometry(0.11, 0.14, 0.36, 6), shirt[(bi * 2 + k) % shirt.length], 0, 0.18, 0));
          p.add(mk(new THREE.SphereGeometry(0.12, 8, 6), 0xf2c9a0, 0, 0.46, 0));
          p.scale.setScalar(1.5);
          scene.add(p);
          walkers.push({ p, b, segLen, total, s: Math.random() * total, dir: k === 0 ? 1 : -1, speed: 0.9 + Math.random() * 0.6 });
        }
      });
    },
    update(dt) {
      walkers.forEach(w => {
        w.s += w.dir * w.speed * dt;
        if (w.s > w.total) { w.s = w.total; w.dir = -1; } else if (w.s < 0) { w.s = 0; w.dir = 1; }
        walkerPos(w, w.p.position);
        w.p.rotation.z = Math.sin(w.s * 7) * 0.08;
      });
    }
  });
})();
