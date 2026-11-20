(function () {
  'use strict';
  // 建築（小島型）：泳池陽傘組島（小泳池＋條紋陽傘＋躺椅＋小桌與 mojito）
  // 小島型建築的欄位說明見 shapes\isle_lighthouse.js
  // 本檔案自成一體：條紋貼圖與泳池零件只放在這裡，不和其他建築共用

  // 零件：直條紋貼圖材質（用 canvas 畫）
  function stripeMat(c1, c2, n) {
    const c = document.createElement('canvas'); c.width = 128; c.height = 32; const x = c.getContext('2d');
    for (let k = 0; k < n * 2; k++) { x.fillStyle = k % 2 ? c2 : c1; x.fillRect(k * 128 / (n * 2), 0, 128 / (n * 2) + 1, 32); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.8, flatShading: true });
  }

  // 零件：泳池陽傘組：小泳池 + 陽傘 + 躺椅 + 小桌（桌上一杯 mojito）
  function poolSetMesh() {
    const g = new THREE.Group(), glassMat = (c, o) => new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: o, roughness: 0.2 });
    g.add(cylM(0.95, 0.95, 0.12, 0xf4efe6, -0.7, 0.06, 0.2, 24));
    g.add(cylM(0.8, 0.8, 0.13, 0x39c5e8, -0.7, 0.07, 0.2, 24));
    // 陽傘
    g.add(cylM(0.04, 0.04, 1.5, 0x8a5a35, 0.95, 0.75, -0.75, 6));
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.38, 8), stripeMat('#e84a4a', '#ffffff', 4)); canopy.position.set(0.95, 1.62, -0.75); canopy.castShadow = true; g.add(canopy);
    // 躺椅（頭在 -z 側）
    g.add(boxM(0.45, 0.08, 0.7, 0x3a7bc8, 0.75, 0.24, 0.55));
    // 椅背：在座墊頭側(-z)末端鉸接，向後(-z)斜著抬高約 57°
    const back = boxM(0.45, 0.06, 0.5, 0x5a95d8, 0.75, 0.49, 0.065); back.rotation.x = 1.0;
    g.add(back);
    for (const [dx, dz] of [[-0.18, 0.8], [0.18, 0.8], [-0.18, 0.28], [0.18, 0.28]]) { g.add(cylM(0.02, 0.02, 0.2, 0xf5f5f5, 0.75 + dx, 0.1, dz, 5)); }
    // 小桌 + mojito
    g.add(cylM(0.2, 0.2, 0.04, 0xf5f5f5, 1.5, 0.46, 0.55, 14)); g.add(cylM(0.03, 0.03, 0.44, 0xf5f5f5, 1.5, 0.22, 0.55, 6)); g.add(cylM(0.12, 0.12, 0.03, 0xf5f5f5, 1.5, 0.02, 0.55, 12));
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.2, 12), glassMat(0xffffff, 0.35)); glass.position.set(1.5, 0.58, 0.55); g.add(glass);
    const liq = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.055, 0.15, 12), glassMat(0xc9f0a0, 0.85)); liq.position.set(1.5, 0.56, 0.55); g.add(liq);
    for (const [dx, dz] of [[-0.03, 0.01], [0.03, -0.02], [0.0, 0.035]]) { const m = sphM(0.035, 0x2e8b3a, 1.5 + dx, 0.69, 0.55 + dz); m.scale.y = 0.5; g.add(m); } // 薄荷葉
    g.add(cylM(0.06, 0.06, 0.012, 0xb6e04a, 1.5, 0.67, 0.6, 12)); // 萊姆片
    const straw = cylM(0.01, 0.01, 0.22, 0xff7aa8, 1.53, 0.7, 0.55, 5); straw.rotation.z = -0.25; g.add(straw);
    return g;
  }

  (window.ISLAND_SHAPES = window.ISLAND_SHAPES || {}).isle_pool = {
    label: '泳池陽傘組島',
    desc: '小島型：小泳池＋條紋陽傘＋躺椅＋小桌，植物往左移讓出橋的位置',
    themed: false, isle: true, baseR: 2.5, sparse: true,
    build(color, ctx) { return poolSetMesh(); },
    arrange(plants) { // 棕櫚、樹、灌木往左移，讓開北側通往相連島的橋
      plants.forEach((ch, n) => { ch.position.set(-1.85 + n * 0.35, 0.5, 0.7 - n * 1.6); });
    }
  };
})();
