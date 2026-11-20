(function () {
  'use strict';
  // 建築：商場（紅磚主塔＋裙樓＋LOGO）
  // 本檔案自成一體：用到的小零件都放在這裡，不和其他建築共用

  // build(color, ctx)：回傳建築的 THREE.Group；ctx = { index, r, face, onUpdate(fn) }，要每幀動的東西用 ctx.onUpdate(function (dt) {…}) 登記
  (window.ISLAND_SHAPES = window.ISLAND_SHAPES || {}).mall = {
    label: "商場", desc: "紅磚主塔＋裙樓＋LOGO", themed: true,
    build(color, ctx) {
      const col = new THREE.Color(color), g = new THREE.Group();
      const B = (w, h, d, c, x, y, z) => mk(new THREE.BoxGeometry(w, h, d), c, x, y, z);
      const brick = 0xb0644a, cream = 0xfff1d6, glass = 0x9ccfe0;
      g.add(B(5.4, 1.1, 3.4, cream, 0, 0.55, 0));       // 裙樓
      g.add(B(5.6, 0.14, 3.6, 0xe8d3a6, 0, 1.17, 0));   // 裙樓屋簷
      const tx = -0.6, tw = 2.8, td = 2.4, th = 5.4, y0 = 1.24;
      g.add(B(tw, th, td, brick, tx, y0 + th / 2, 0));  // 主塔
      for (let f = 0; f < 7; f++) {
        const y = y0 + 0.55 + f * 0.7;
        if (f !== 3 && f !== 4) { g.add(B(tw * 0.78, 0.3, 0.05, glass, tx, y, td / 2 + 0.02)); }
        else { g.add(B(0.94, 0.3, 0.05, glass, 0.02, y, td / 2 + 0.02)); } // 正面中段左側留給 LOGO，右側保留窗戶
        g.add(B(tw * 0.78, 0.3, 0.05, glass, tx, y, -td / 2 - 0.02));
        g.add(B(0.05, 0.3, td * 0.72, glass, tx + tw / 2 + 0.02, y, 0));
        g.add(B(0.05, 0.3, td * 0.72, glass, tx - tw / 2 - 0.02, y, 0));
      }
      g.add(B(tw + 0.24, 0.22, td + 0.24, cream, tx, y0 + th + 0.11, 0)); // 頂簷
      g.add(B(1.5, 0.6, 1.2, col, tx, y0 + th + 0.52, 0));                 // 屋頂機房
      for (const x of [-2.1, -1.2]) { g.add(B(0.55, 0.5, 0.05, glass, x, 0.6, 1.72)); } // 裙樓窗
      g.add(B(0.9, 0.8, 0.06, 0x8a5a35, 1.2, 0.4, 1.72));               // 大門
      g.add(B(2.2, 0.1, 1.3, col, 1.2, 1.0, 2.3));                       // 入口雨棚
      for (const x of [0.2, 2.2]) { g.add(mk(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 6), cream, x, 0.5, 2.85)); }
      g.add(mk(new THREE.CylinderGeometry(0.04, 0.04, 3, 6), 0xdddddd, 3.1, 1.5, 1.6)); // 旗桿
      g.add(B(0.7, 0.4, 0.03, col, 3.45, 2.7, 1.6));
      // 主塔正面 LOGO：圓形底盤＋LOGO 圖（圖的來源見下面）
      const lr = 0.6, sy = 4.24, lx = tx - 0.55; // 圓形徽章貼在主塔正面，偏左；右側保留窗戶（底盤與紅印共用同一圓心 lx,sy）
      const backing = mk(new THREE.CylinderGeometry(lr + 0.05, lr + 0.05, 0.06, 32), 0xf4efe6, lx, sy, td / 2 + 0.02); backing.rotation.x = Math.PI / 2; g.add(backing);
      // LOGO 圖：讀 logo_data.js 的 window.MALL_LOGO（圖的 data URL，由維護工具「商場 LOGO」產生）；沒有就只有底盤
      const srcs = [window.MALL_LOGO].filter(Boolean);
      const face = new THREE.Mesh(new THREE.CircleGeometry(lr, 48), new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false }));
      face.position.set(lx, sy, td / 2 + 0.06); face.visible = false; g.add(face);
      (function tryLoad(k) {
        if (k >= srcs.length) { return; }
        const img = new Image();
        img.onload = () => {
          try {
            const S = 512, cv = document.createElement('canvas'); cv.width = cv.height = S;
            const cx = cv.getContext('2d'), s = Math.min(S / img.width, S / img.height); // 等比例縮放置中，不拉伸
            cx.drawImage(img, (S - img.width * s) / 2, (S - img.height * s) / 2, img.width * s, img.height * s);
            cx.getImageData(0, 0, 1, 1); // 圖片被當成跨來源時這行會丟例外 → 改用下一個來源
            const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
            face.material.map = tex; face.material.needsUpdate = true; face.visible = true; face.userData.logoSource = 'data';
          } catch (e) { tryLoad(k + 1); }
        };
        img.onerror = () => tryLoad(k + 1);
        img.src = srcs[k];
      })(0);
      return g;
    }
  };
})();
