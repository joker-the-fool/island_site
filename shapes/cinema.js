(function () {
  'use strict';
  // 建築：電影院（霓虹招牌＋海報＋屋頂膠捲吉祥物）
  // 本檔案自成一體：用到的小零件都放在這裡，不和其他建築共用

  // 直條紋貼圖（爆米花桶用）
  function stripeMat(c1, c2, n) {
    const c = document.createElement('canvas'); c.width = 128; c.height = 32; const x = c.getContext('2d');
    for (let k = 0; k < n * 2; k++) { x.fillStyle = k % 2 ? c2 : c1; x.fillRect(k * 128 / (n * 2), 0, 128 / (n * 2) + 1, 32); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.8, flatShading: true });
  }

  // build(color, ctx)：回傳建築的 THREE.Group；ctx = { index, r, face, onUpdate(fn) }，要每幀動的東西用 ctx.onUpdate(function (dt) {…}) 登記
  (window.ISLAND_SHAPES = window.ISLAND_SHAPES || {}).cinema = {
    label: "電影院", desc: "霓虹招牌＋海報＋屋頂膠捲吉祥物", themed: true,
    build(color, ctx) {
      const col = new THREE.Color(color), g = new THREE.Group();
      g.add(boxM(3.4, 1.9, 2.4, 0x5b3a4a, 0, 0.95, 0));
      g.add(boxM(3.6, 0.18, 2.6, 0x2a2a2a, 0, 1.99, 0));
      g.add(boxM(3.0, 0.62, 0.25, 0x1f1f1f, 0, 2.5, 1.0));
      for (let k = 0; k < 12; k++) { g.add(boxM(0.09, 0.09, 0.05, 0xffe27a, -1.4 + k * 0.255, 2.84, 1.14)); g.add(boxM(0.09, 0.09, 0.05, 0xffe27a, -1.4 + k * 0.255, 2.17, 1.14)); }
      g.add(boxM(0.9, 1.0, 0.06, 0x2a2a2a, 0, 0.5, 1.22));
      [[-1.1, 0xc94c4c], [1.1, 0x4c7cc9]].forEach(([x, c]) => { g.add(boxM(0.7, 1.0, 0.05, c, x, 1.0, 1.22)); g.add(boxM(0.5, 0.35, 0.06, 0xffe9a8, x, 1.2, 1.23)); });
      // 屋頂上的膠捲吉祥物（招牌）：圓盤夾底片捲、圓盤有六個減重孔，一段底片飄在外面，底下兩隻小腳站在屋頂 //joker -->>
      const mascot = new THREE.Group(); mascot.position.set(0, 3.4, 0.0); mascot.scale.setScalar(2.3); // 放大 2.3 倍，半徑約 0.87
      const reel = new THREE.Group(); reel.rotation.x = Math.PI / 2; // 圓盤軸心轉成朝向正面（+z）
      for (const y of [-0.1, 0.1]) { reel.add(cylM(0.38, 0.38, 0.04, 0x9a9a9a, 0, y, 0, 32)); } // 前後兩片圓盤
      reel.add(cylM(0.31, 0.31, 0.16, 0x2b2118, 0, 0, 0, 32)); // 底片捲
      reel.add(cylM(0.1, 0.1, 0.26, 0xdddddd, 0, 0, 0, 24));  // 中心軸
      for (let idx = 0; idx < 6; idx++) { // 減重孔（前後圓盤各六個）
        const a = idx * Math.PI / 3;
        for (const y of [-0.1, 0.1]) { reel.add(cylM(0.06, 0.06, 0.05, 0x1a1a1a, Math.cos(a) * 0.22, y, Math.sin(a) * 0.22, 12)); }
      }
      mascot.add(reel);
      // 從底片捲左下方抽出一段底片，呈波浪狀往左飄在外面（有齒孔的底片貼圖，越往外越扭轉，正反面都看得到）
      const fc = document.createElement('canvas'); fc.width = 128; fc.height = 32;
      const fx = fc.getContext('2d');
      fx.fillStyle = '#2b2118'; fx.fillRect(0, 0, 128, 32);
      fx.fillStyle = '#4a3a2c'; fx.fillRect(0, 10, 128, 12); // 中間畫格
      fx.fillStyle = '#e8dcc0';
      for (let px = 4; px < 128; px += 16) { fx.fillRect(px, 3, 8, 5); fx.fillRect(px, 24, 8, 5); } // 兩側齒孔
      const ftex = new THREE.CanvasTexture(fc); ftex.colorSpace = THREE.SRGBColorSpace; ftex.wrapS = THREE.RepeatWrapping; ftex.repeat.set(3, 1);
      const fcurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.27, -0.14, 0), new THREE.Vector3(-0.5, -0.3, 0.02), new THREE.Vector3(-0.78, -0.28, 0),
        new THREE.Vector3(-1.0, -0.12, -0.02), new THREE.Vector3(-1.25, -0.02, 0), new THREE.Vector3(-1.5, -0.2, 0.02), new THREE.Vector3(-1.72, -0.5, 0)
      ]);
      const FN = 48, FW = 0.16, fpos = [], fuv = [], fidx = [];
      for (let k = 0; k <= FN; k++) {
        const t = k / FN, c = fcurve.getPoint(t), tw = t * Math.PI * 1.6;
        const wy = Math.sin(tw) * FW / 2, wz = Math.cos(tw) * FW / 2;
        fpos.push(c.x, c.y + wy, c.z + wz, c.x, c.y - wy, c.z - wz);
        fuv.push(t, 0, t, 1);
        if (k < FN) { const a = k * 2; fidx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      }
      const fgeo = new THREE.BufferGeometry();
      fgeo.setAttribute('position', new THREE.Float32BufferAttribute(fpos, 3));
      fgeo.setAttribute('uv', new THREE.Float32BufferAttribute(fuv, 2));
      fgeo.setIndex(fidx); fgeo.computeVertexNormals();
      const film = new THREE.Mesh(fgeo, new THREE.MeshStandardMaterial({ map: ftex, roughness: 0.7, side: THREE.DoubleSide }));
      film.castShadow = true; mascot.add(film);
      g.add(mascot);
      for (const x of [-0.45, 0.45]) { // 兩隻小腳：腳桿＋鞋
        g.add(cylM(0.07, 0.07, 0.46, 0xf3ead2, x, 2.31, 0, 8));
        const shoe = sphM(0.14, 0xd8303a, x, 2.12, 0.05); shoe.scale.set(1, 0.55, 1.4); g.add(shoe);
      } //joker <<--
      // 爆米花桶
      const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.22, 0.5, 12), stripeMat('#d8303a', '#ffffff', 5));
      bucket.position.set(2.3, 0.25, 1.3); bucket.castShadow = true; g.add(bucket);
      [[0, 0.58, 0], [0.16, 0.54, 0.08], [-0.15, 0.55, 0.1], [0.06, 0.66, -0.1], [-0.08, 0.68, 0.0], [0.12, 0.64, -0.06]].forEach(([x, y, z], k) => {
        g.add(mk(new THREE.IcosahedronGeometry(0.12, 0), k % 2 ? 0xfff3c4 : 0xffe08a, 2.3 + x, y, 1.3 + z));
      });
      // 可樂杯
      g.add(cylM(0.2, 0.15, 0.5, 0xd8303a, 2.85, 0.25, 0.8, 12));
      g.add(cylM(0.185, 0.17, 0.14, 0xffffff, 2.85, 0.26, 0.8, 12));
      g.add(cylM(0.22, 0.22, 0.05, 0xffffff, 2.85, 0.53, 0.8, 12));
      const straw = cylM(0.025, 0.025, 0.4, 0x3a7bc8, 2.88, 0.72, 0.8, 6); straw.rotation.z = -0.2; g.add(straw);
      return g;
    }
  };
})();
