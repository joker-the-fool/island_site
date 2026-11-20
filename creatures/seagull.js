(function () {
  'use strict';
  // 生物：海鷗（繞著島盤旋）。自成一體
  const gulls = [];

  CREATURES.push({
    name: 'seagull',
    setup() {
      for (let k = 0; k < (PREVIEW ? 0 : 6); k++) { // 預覽模式不放海鷗，避免擋住建築
        const g = new THREE.Group(), white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true });
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), white); body.scale.set(1.6, 0.5, 0.5);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), white); head.position.x = 0.85;
        const beak = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 4), mat(0xf0a030)); beak.rotation.z = -Math.PI / 2; beak.position.x = 1.15;
        g.add(body, head, beak);
        const wings = [-1, 1].map(sd => {
          const pv = new THREE.Group(); pv.position.z = sd * 0.15;
          const w = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 1.6), white); w.position.z = sd * 0.8; pv.add(w); g.add(pv); return { pv, sd };
        });
        g.scale.setScalar(1.8); scene.add(g);
        // 前 2 隻繞主島（中央商場島與另一座主島），其餘 4 隻分別繞遠處群島，低空盤旋
        const outer = wild.filter(q => q.natural);
        const anchor = k === 0 ? islands[0] : k === 1 ? islands[Math.min(3, N - 1)] : (outer[Math.floor((k - 2) * outer.length / 4)] || outer[0] || islands[0]);
        const rad = anchor.r + (k < 2 ? 4 + k * 2 : 3 + Math.random() * 2), spd = 3.2 + Math.random() * 1.5;
        gulls.push({ g, wings, cx: anchor.pos.x, cz: anchor.pos.z, rad, w: spd / rad, dir: k % 2 ? -1 : 1, ang: Math.random() * Math.PI * 2, y: 9 + Math.random() * 5, phase: Math.random() * 6 });
      }
    },
    update(dt, t) {
      gulls.forEach(o => {
        o.ang += o.dir * o.w * dt; // 繞著所屬的島盤旋
        o.g.position.set(o.cx + Math.cos(o.ang) * o.rad, o.y + Math.sin(t * 1.3 + o.phase) * 0.8, o.cz + Math.sin(o.ang) * o.rad);
        o.g.rotation.y = Math.atan2(-o.dir * Math.cos(o.ang), -o.dir * Math.sin(o.ang)); // 機頭朝移動方向
        o.g.rotation.x = -o.dir * 0.2; // 轉彎時微微傾斜
        const fl = Math.sin(t * 8 + o.phase) * 0.55;
        o.wings.forEach(w => { w.pv.rotation.x = w.sd * fl; });
      });
    }
  });
})();
