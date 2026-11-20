(function () {
  'use strict';
  // 島上人物：迎賓女服務員
  // 由模型編輯器產生；本檔案自成一體（用到 core 提供的 mk）

  (window.ISLAND_CHARACTERS = window.ISLAND_CHARACTERS || {}).hostess = {
    label: "迎賓女服務員",
    desc: "有橋上小人走近就鞠躬",
    build(ctx) {
      const g = new THREE.Group();
      const p1 = new THREE.Group(); // 迎賓女服務員
      const p2 = new THREE.Group(); // 
      p2.scale.set(1.5, 1.5, 1.5);
      const p3 = mk(new THREE.CylinderGeometry(0.12, 0.09, 0.3, 8), 0x1f2a44, 0, 0.19, 0); // 
      p2.add(p3);
      const p4 = mk(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 6), 0xf2c9a0, -0.045, 0.06, 0); // 
      p2.add(p4);
      const p5 = mk(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 6), 0xf2c9a0, 0.045, 0.06, 0); // 
      p2.add(p5);
      const p6 = mk(new THREE.BoxGeometry(0.07, 0.03, 0.11), 0x1b1b1b, -0.045, 0.015, 0.02); // 
      p2.add(p6);
      const p7 = mk(new THREE.BoxGeometry(0.07, 0.03, 0.11), 0x1b1b1b, 0.045, 0.015, 0.02); // 
      p2.add(p7);
      const p8 = new THREE.Group(); // 
      p8.position.set(0, 0.34, 0);
      const p9 = mk(new THREE.CylinderGeometry(0.13, 0.11, 0.34, 8), 0x23304d, 0, 0.17, 0); // 
      p8.add(p9);
      const p10 = mk(new THREE.CylinderGeometry(0.032, 0.028, 0.2508, 6), 0x23304d, -0.09, 0.215, 0.07); // 
      p10.rotation.set(1.5121, -0.9774, -1.0268);
      p8.add(p10);
      const p11 = mk(new THREE.SphereGeometry(0.036, 10, 8), 0xf2c9a0, -0.02, 0.13, 0.15); // 
      p8.add(p11);
      const p12 = mk(new THREE.CylinderGeometry(0.032, 0.028, 0.2508, 6), 0x23304d, 0.09, 0.215, 0.07); // 
      p12.rotation.set(1.5121, 0.9774, 1.0268);
      p8.add(p12);
      const p13 = mk(new THREE.SphereGeometry(0.036, 10, 8), 0xf2c9a0, 0.02, 0.13, 0.15); // 
      p8.add(p13);
      const p14 = mk(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6), 0xf2c9a0, 0, 0.37, 0); // 
      p8.add(p14);
      const p15 = mk(new THREE.SphereGeometry(0.12, 10, 8), 0xf2c9a0, 0, 0.5, 0); // 
      p8.add(p15);
      const p16 = mk(new THREE.SphereGeometry(0.13, 10, 8, 0, 6.2832, 0, 1.7279), 0x1b1b1b, 0, 0.51, -0.0018); // 
      p8.add(p16);
      const p17 = mk(new THREE.SphereGeometry(0.065, 10, 8), 0x1b1b1b, 0, 0.65, -0.06); // 
      p8.add(p17);
      const p18 = mk(new THREE.TorusGeometry(0.09, 0.03, 6, 12), 0xc8202a, 0, 0.34, 0); // 
      p18.rotation.set(1.5708, 0, 0);
      p8.add(p18);
      const p19 = mk(new THREE.ConeGeometry(0.04, 0.14, 4), 0xc8202a, 0, 0.26, 0.1); // 
      p19.rotation.set(3.1416, 0, 0);
      p8.add(p19);
      p2.add(p8);
      p1.add(p2);
      g.add(p1);
      // 有橋上小人走近就鞠躬：p8 是上半身，前傾（rotation.x）
      const st = { bow: 0 }, wp = new THREE.Vector3();
      ctx.onUpdate(function (dt) {
        p2.getWorldPosition(wp);
        let near = false;
        for (const w of WALKERS) { if (Math.hypot(w.p.position.x - wp.x, w.p.position.z - wp.z) < 2.6) { near = true; break; } }
        st.bow += ((near ? 0.8 : 0) - st.bow) * Math.min(1, dt * 4);
        p8.rotation.x = st.bow;
      });
      return g;
    }
  };
})();
