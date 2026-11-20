// 範例建築：檸檬水攤（示範「零件」與「建築」的寫法，可直接用維護工具「載入建築 js 預覽…」看效果）
// 規範見 docs\模型規範.md。重點：整支包在 IIFE 裡、零件寫在檔案內、最後登記到 ISLAND_SHAPES
(function () {
  'use strict';

  // ================= 零件（自成一體：只放在這個檔案，不和別的建築共用）=================
  // 規則：原點在零件底部中心、y 往上、正面朝 +z；回傳一個 THREE.Group；不要在這裡讀全域狀態

  // 零件：檸檬（高約 0.2）
  function lemonMesh() {
    const g = new THREE.Group();
    const body = sphM(0.11, 0xffe14a, 0, 0.1, 0); body.scale.set(1.25, 0.9, 1); g.add(body); // 橢圓身體
    g.add(sphM(0.03, 0xf2c500, 0.15, 0.1, 0));                                            // 尖端
    g.add(boxM(0.04, 0.012, 0.07, 0x3a8a3a, -0.03, 0.2, 0));                              // 葉片
    return g;
  }

  // 零件：直條紋貼圖材質（用 canvas 畫，不讀外部圖片）
  function stripeMat(c1, c2, n) {
    const c = document.createElement('canvas'); c.width = 128; c.height = 32; const x = c.getContext('2d');
    for (let k = 0; k < n * 2; k++) { x.fillStyle = k % 2 ? c2 : c1; x.fillRect(k * 128 / (n * 2), 0, 128 / (n * 2) + 1, 32); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.8, flatShading: true });
  }

  // 零件：杯子（紙杯＋吸管，高約 0.35）
  function cupMesh(cupColor) {
    const g = new THREE.Group();
    g.add(cylM(0.1, 0.07, 0.3, cupColor, 0, 0.15, 0, 12));
    g.add(cylM(0.105, 0.105, 0.03, 0xffffff, 0, 0.31, 0, 12));
    const straw = cylM(0.012, 0.012, 0.25, 0xff7aa8, 0.03, 0.4, 0, 5); straw.rotation.z = -0.2; g.add(straw);
    return g;
  }

  // ================= 建築 =================
  // build(color, ctx)：color 是這座島的主題色（字串，例如 '#e0a040'）；ctx = { index, r, face, onUpdate(fn) }
  // 座標：原點在島中心的地面，+z 是正面（朝向中央商場的那一面），建議佔地 x:-3.5~3.5、z:-2.8~3.0、高度 ≤ 5.5
  (window.ISLAND_SHAPES = window.ISLAND_SHAPES || {}).lemonade_demo = {
    label: '檸檬水攤（範例）',
    desc: '木頭攤車＋條紋遮陽棚＋會轉的檸檬招牌',
    themed: true, // 寬、擺飾多的建築設 true：島上周圍就不會種樹擋到

    build(color, ctx) {
      const col = new THREE.Color(color), g = new THREE.Group();

      // 攤車：木箱＋桌面
      g.add(boxM(2.6, 0.9, 1.2, 0x9b6a3c, 0, 0.45, 0.4));
      g.add(boxM(2.8, 0.08, 1.4, 0xe9d3a5, 0, 0.94, 0.4));
      g.add(boxM(2.2, 0.5, 0.05, col, 0, 0.5, 1.03)); // 正面貼一塊島色的板子（用到 color 的地方）

      // 四根柱子＋條紋遮陽棚（微微前傾）
      for (const [x, z] of [[-1.3, -0.2], [1.3, -0.2], [-1.3, 1.0], [1.3, 1.0]]) { g.add(cylM(0.05, 0.05, 1.9, 0xf5f5f5, x, 1.0, z, 6)); }
      const awning = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.08, 1.8), stripeMat('#ffd84a', '#ffffff', 6));
      awning.position.set(0, 2.0, 0.4); awning.rotation.x = 0.12; awning.castShadow = true; g.add(awning);

      // 桌上的檸檬堆與杯子（把零件擺進去）
      [[-0.7, 0.2], [-0.5, 0.45], [-0.35, 0.2], [-0.6, 0.65], [-0.2, 0.55]].forEach(([x, z], k) => {
        const l = lemonMesh(); l.position.set(x, 0.98, z); l.rotation.y = k * 1.3; g.add(l);
      });
      [[0.4, 0xd8303a], [0.7, 0x3a7bc8], [1.0, 0x3aa856]].forEach(([x, c]) => { const cup = cupMesh(c); cup.position.set(x, 0.98, 0.45); g.add(cup); });

      // 會轉的檸檬招牌（示範動畫：用 ctx.onUpdate 登記每幀要做的事）
      const sign = lemonMesh(); sign.scale.setScalar(3.2); sign.position.set(0, 2.5, 0.4); g.add(sign);
      ctx.onUpdate(function (dt) { sign.rotation.y += dt * 1.2; });

      return g;
    }
  };
})();
