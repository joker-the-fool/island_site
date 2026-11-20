(function () {
  'use strict';
  // 建築：伺服器機櫃（水泥台上兩排機櫃，每層有閃爍的 LED 燈號；人物不在這裡，見 characters\）
  // 本檔案自成一體：用到的小零件都放在這裡，不和其他建築共用

  // build(color, ctx)：回傳建築的 THREE.Group；ctx = { index, r, face, onUpdate(fn) }，要每幀動的東西用 ctx.onUpdate(function (dt) {…}) 登記
  (window.ISLAND_SHAPES = window.ISLAND_SHAPES || {}).server = {
    label: "伺服器機櫃", desc: "水泥台＋兩排伺服器機櫃＋LED 燈號", themed: true,
    build(color, ctx) {
      const col = new THREE.Color(color), g = new THREE.Group();
      g.add(boxM(4.2, 0.1, 3.75, 0x9a9a92, -0.3, 0.05, -0.675)); // 水泥台（前緣不變，往後加深以容納第二排）
      for (const rz of [0, -1.35]) { // 兩排：原本那排在前（z=0），第二排加在後方
        for (let k = 0; k < 3; k++) {
          const x = -1.5 + k * 1.0;
          g.add(boxM(0.85, 2.1, 0.9, 0x2b2f36, x, 1.15, rz));
          g.add(boxM(0.7, 0.06, 0.7, 0x14161a, x, 2.23, rz));
          for (let r = 0; r < 7; r++) {
            const y = 0.35 + r * 0.26;
            g.add(boxM(0.7, 0.12, 0.04, 0x4a505a, x, y, rz + 0.47));
            const led = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.05), new THREE.MeshBasicMaterial({ color: [0x39e05a, 0x3aa0ff, 0xff4a4a, 0xffb040][(k + r + (rz < 0 ? 2 : 0)) % 4] }));
            led.position.set(x - 0.27, y, rz + 0.5); g.add(led);
          }
        }
      }
      return g;
    }
  };
})();
