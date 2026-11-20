(function () {
  'use strict';
  // 天空：低多邊形白雲（緩慢飄動，靠近鏡頭時淡出）與偶爾出現的氣流線。自成一體
  const clouds = [], winds = [];

  CREATURES.push({
    name: 'sky',
    setup() {
      const cloudRand = rng(555);
      for (let k = 0; k < 11; k++) {
        const g = new THREE.Group();
        const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true, transparent: true, opacity: 0.95 });
        const puffs = 3 + Math.floor(cloudRand() * 3);
        for (let p = 0; p < puffs; p++) {
          const s = new THREE.Mesh(new THREE.IcosahedronGeometry(2.2 + cloudRand() * 2, 1), m);
          s.position.set((p - puffs / 2) * 3.2 + cloudRand(), cloudRand() * 1.2, (cloudRand() - 0.5) * 2.5);
          s.scale.y = 0.62; g.add(s);
        }
        const a = cloudRand() * Math.PI * 2, d = 50 + cloudRand() * 70;
        g.position.set(Math.cos(a) * d, 24 + cloudRand() * 12, Math.sin(a) * d);
        g.scale.setScalar(1.2 + cloudRand() * 1.2);
        scene.add(g);
        clouds.push({ g, m, v: 0.6 + cloudRand() * 0.8 });
      }
      // 氣流：偶爾在空中畫出一條帶小捲曲的白色流線，隨風飄過後淡去
      for (let k = 0; k < 5; k++) {
        const pts = [], curl = k % 2 === 0, L = 40;
        for (let s = 0; s <= 48; s++) {
          const u = s / 48;
          let x = u * L, y = Math.sin(u * Math.PI * 2) * 1.2, z = Math.sin(u * Math.PI * 1.4) * 2;
          if (curl && u > 0.5 && u < 0.72) { // 一圈小捲曲
            const ph = (u - 0.5) / 0.22 * Math.PI * 2;
            x += 2.4 * Math.sin(ph); y += 2.4 * (1 - Math.cos(ph));
          }
          pts.push(new THREE.Vector3(x - L / 2, y, z));
        }
        const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 96, 0.09, 4, false);
        const m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
        const mesh = new THREE.Mesh(geo, m); mesh.visible = false; scene.add(mesh);
        winds.push({ mesh, geo, m, idxN: geo.index.count, t: -1, wait: 2 + k * 3 + Math.random() * 4, dur: 9, dx: 0, dz: 0 });
      }
    },
    update(dt) {
      clouds.forEach(c => {
        c.g.position.x += c.v * dt;
        if (c.g.position.x > 140) { c.g.position.x = -140; c.g.position.z = (Math.random() - 0.5) * 220; }
        const dist = c.g.position.distanceTo(camera.position);
        c.m.opacity = 0.95 * Math.min(1, Math.max(0, (dist - 18) / 30));
      });
      winds.forEach(w => {
        if (w.t < 0) {
          w.wait -= dt;
          if (w.wait <= 0) {
            const ang = Math.random() * Math.PI * 2, rr = 15 + Math.random() * 40;
            w.mesh.position.set(Math.cos(ang) * rr, 14 + Math.random() * 14, Math.sin(ang) * rr);
            w.mesh.rotation.y = Math.random() * Math.PI * 2;
            w.mesh.scale.setScalar(0.8 + Math.random() * 0.7);
            w.dx = Math.cos(w.mesh.rotation.y) * 2.5; w.dz = -Math.sin(w.mesh.rotation.y) * 2.5;
            w.t = 0; w.mesh.visible = true;
          }
          return;
        }
        w.t += dt / w.dur;
        const u = w.t;
        w.mesh.position.x += w.dx * dt; w.mesh.position.z += w.dz * dt;
        w.geo.setDrawRange(0, Math.floor(w.idxN * Math.min(1, u / 0.55) / 6) * 6); // 由頭到尾逐段畫出
        w.m.opacity = 0.55 * Math.min(1, u / 0.15) * Math.min(1, (1 - u) / 0.35);
        if (u >= 1) { w.t = -1; w.mesh.visible = false; w.wait = 5 + Math.random() * 10; }
      });
    }
  });
})();
