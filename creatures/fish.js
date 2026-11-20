(function () {
  'use strict';
  // 生物：跳出水面的魚（含落水時的水波）。自成一體
  const SEA_Y = -1.9;
  const fishes = [], ripples = [], tmpV = new THREE.Vector3();
  let ripIdx = 0;

  function ripple(x, z) { const r = ripples[ripIdx++ % ripples.length]; r.m.position.x = x; r.m.position.z = z; r.t = 0; }
  function pickWater() { // 找一個不在島上的水面點
    for (let n = 0; n < 12; n++) {
      const o = islands[Math.floor(Math.random() * N)], a = Math.random() * Math.PI * 2, d = o.r * 1.5 + Math.random() * 3;
      const x = o.pos.x + Math.cos(a) * d, z = o.pos.z + Math.sin(a) * d;
      if (islands.every(q => Math.hypot(q.pos.x - x, q.pos.z - z) > q.r * 1.3) && wild.every(q => Math.hypot(q.pos.x - x, q.pos.z - z) > q.r * 1.4)) { return [x, z]; }
    }
    return [40, 40];
  }

  CREATURES.push({
    name: 'fish',
    setup() {
      for (let k = 0; k < 4; k++) {
        const f = new THREE.Group();
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), mat(0xf09a4a)); body.scale.set(0.5, 0.5, 1.4);
        // 尾鰭：平面三角形，單一頂點接在身體尾端（朝身體內部），寬邊朝外；魚頭在 +z（跳躍行進方向）
        const tg = new THREE.BufferGeometry();
        tg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -0.35, 0, 0.28, -0.8, 0, -0.28, -0.8], 3));
        tg.setIndex([0, 1, 2]); tg.computeVertexNormals();
        const tail = new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ color: 0xf5c07a, roughness: 0.8, flatShading: true, side: THREE.DoubleSide }));
        f.add(body, tail); f.scale.setScalar(1.3); f.visible = false; scene.add(f);
        fishes.push({ f, wait: 1 + Math.random() * 5, t: -1, dur: 1.1, a: new THREE.Vector3(), d: new THREE.Vector3() });
      }
      for (let k = 0; k < 8; k++) {
        const m = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.5, 28).rotateX(-Math.PI / 2),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
        m.position.y = SEA_Y + 0.03; scene.add(m); ripples.push({ m, t: 9 });
      }
    },
    update(dt) {
      fishes.forEach(o => {
        if (o.t < 0) {
          o.wait -= dt;
          if (o.wait <= 0) {
            const [x, z] = pickWater(), a = Math.random() * Math.PI * 2;
            o.a.set(x, SEA_Y - 0.2, z); o.d.set(Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2);
            o.t = 0; o.f.visible = true; ripple(x, z);
          }
          return;
        }
        o.t += dt / o.dur;
        const u = Math.min(o.t, 1), h = 2.3 * 4 * u * (1 - u);
        o.f.position.set(o.a.x + o.d.x * u, o.a.y + h, o.a.z + o.d.z * u);
        tmpV.set(o.d.x, 2.3 * 4 * (1 - 2 * u) * 1.0, o.d.z); o.f.lookAt(o.f.position.clone().add(tmpV));
        if (o.t >= 1) { o.t = -1; o.f.visible = false; o.wait = 3 + Math.random() * 6; ripple(o.a.x + o.d.x, o.a.z + o.d.z); }
      });
      ripples.forEach(r => {
        if (r.t > 1.4) { r.m.material.opacity = 0; return; }
        r.t += dt; const u = r.t / 1.4;
        r.m.scale.setScalar(1 + u * 4); r.m.material.opacity = 0.7 * (1 - u);
      });
    }
  });
})();
