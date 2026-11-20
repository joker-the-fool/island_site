(function () {
  'use strict';
  // 島上人物：眼鏡西裝男
  // 由模型編輯器產生；本檔案自成一體（用到 core 提供的 mk）

  (window.ISLAND_CHARACTERS = window.ISLAND_CHARACTERS || {}).serverman = {
    label: "眼鏡西裝男",
    desc: "有橋上小人走近就舉手推眼鏡、鏡片反光",
    build(ctx) {
      const g = new THREE.Group();
      const p1 = new THREE.Group(); // 推眼鏡的西裝男
      p1.scale.set(1.5, 1.5, 1.5);
      const p2 = mk(new THREE.CylinderGeometry(0.05, 0.045, 0.34, 6), 0x1a1a1a, -0.055, 0.17, 0); // 
      p1.add(p2);
      const p3 = mk(new THREE.BoxGeometry(0.09, 0.04, 0.14), 0x111111, -0.055, 0.02, 0.02); // 
      p1.add(p3);
      const p4 = mk(new THREE.CylinderGeometry(0.05, 0.045, 0.34, 6), 0x1a1a1a, 0.055, 0.17, 0); // 
      p1.add(p4);
      const p5 = mk(new THREE.BoxGeometry(0.09, 0.04, 0.14), 0x111111, 0.055, 0.02, 0.02); // 
      p1.add(p5);
      const p6 = new THREE.Group(); // 
      p6.position.set(0, 0.34, 0);
      const p7 = mk(new THREE.CylinderGeometry(0.13, 0.11, 0.34, 8), 0x1a1a1a, 0, 0.17, 0); // 
      p6.add(p7);
      const p8 = mk(new THREE.CylinderGeometry(0.035, 0.03, 0.3, 6), 0x1a1a1a, -0.17, 0.17, 0); // 
      p6.add(p8);
      const p9 = mk(new THREE.SphereGeometry(0.035, 10, 8), 0xf2c9a0, -0.17, 0, 0); // 
      p6.add(p9);
      const p10 = mk(new THREE.CylinderGeometry(0.033, 0.03, 1, 6), 0x1a1a1a, 0.17, 0.225, 0); // 
      p10.castShadow = true; p10.receiveShadow = false;
      p10.rotation.set(0, 0, -2.881);
      p10.scale.set(1, 0.1552, 1);
      p6.add(p10);
      const p11 = mk(new THREE.CylinderGeometry(0.03, 0.026, 1, 6), 0x1a1a1a, 0.19, 0.075, 0.01); // 
      p11.castShadow = true; p11.receiveShadow = false;
      p11.rotation.set(3.009, 0, 0);
      p11.scale.set(1, 0.1513, 1);
      p6.add(p11);
      const p12 = mk(new THREE.SphereGeometry(0.036, 10, 8), 0xf2c9a0, 0.19, 0, 0.02); // 
      p6.add(p12);
      const p13 = mk(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6), 0xf2c9a0, 0, 0.37, 0); // 
      p6.add(p13);
      const p14 = mk(new THREE.SphereGeometry(0.12, 10, 8), 0xf2c9a0, 0, 0.5, 0); // 
      p6.add(p14);
      const p15 = mk(new THREE.SphereGeometry(0.13, 10, 8), 0x151515, 0, 0.5619, 0.0074); // 
      p15.scale.set(1, 0.5125, 1);
      p6.add(p15);
      const p16 = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.012, 14), new THREE.MeshBasicMaterial({ color: 0x15202a, toneMapped: false })); p16.position.set(-0.052, 0.515, 0.118); // 
      p16.castShadow = false; p16.receiveShadow = false;
      p16.rotation.set(1.5708, 0, 0);
      p6.add(p16);
      const p17 = mk(new THREE.TorusGeometry(0.048, 0.007, 6, 16), 0x0a0a0a, -0.052, 0.515, 0.121); // 
      p17.castShadow = false; p17.receiveShadow = false;
      p6.add(p17);
      const p18 = mk(new THREE.BoxGeometry(0.008, 0.008, 0.13), 0x0a0a0a, -0.104, 0.52, 0.055); // 
      p6.add(p18);
      const p19 = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.012, 14), new THREE.MeshBasicMaterial({ color: 0x15202a, toneMapped: false })); p19.position.set(0.052, 0.515, 0.118); // 
      p19.castShadow = false; p19.receiveShadow = false;
      p19.rotation.set(1.5708, 0, 0);
      p6.add(p19);
      const p20 = mk(new THREE.TorusGeometry(0.048, 0.007, 6, 16), 0x0a0a0a, 0.052, 0.515, 0.121); // 
      p20.castShadow = false; p20.receiveShadow = false;
      p6.add(p20);
      const p21 = mk(new THREE.BoxGeometry(0.008, 0.008, 0.13), 0x0a0a0a, 0.104, 0.52, 0.055); // 
      p6.add(p21);
      const p22 = mk(new THREE.BoxGeometry(0.03, 0.01, 0.01), 0x0a0a0a, 0, 0.525, 0.121); // 
      p6.add(p22);
      const p23 = new THREE.Group(); // 
      p23.position.set(0.078, 0.545, 0.14);
      p23.visible = false;
      const p24 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.012, 0.004), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })); p24.position.set(0, 0, 0); // 
      p24.material.transparent = true; p24.material.opacity = 0;
      p24.castShadow = false; p24.receiveShadow = false;
      p23.add(p24);
      const p25 = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.12, 0.004), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })); p25.position.set(0, 0, 0); // 
      p25.material.transparent = true; p25.material.opacity = 0;
      p25.castShadow = false; p25.receiveShadow = false;
      p23.add(p25);
      p6.add(p23);
      const p26 = mk(new THREE.BoxGeometry(0.07, 0.14, 0.02), 0xffffff, 0, 0.27, 0.12); // 
      p6.add(p26);
      p1.add(p6);
      g.add(p1);
      // 有橋上小人走近就舉起左手（+x 側）推眼鏡，鏡片反光，然後放下
      // p10 上臂、p11 前臂、p12 手、p16／p19 鏡片、p23 反光星芒（p24、p25 是兩條星芒）
      const Sh = new THREE.Vector3(0.15, 0.3, 0), E0 = new THREE.Vector3(0.19, 0.15, 0.0), H0 = new THREE.Vector3(0.19, 0.0, 0.02);
      const E1 = new THREE.Vector3(0.172, 0.44, 0.064), H1 = new THREE.Vector3(0.07, 0.53, 0.14);
      const Yv = new THREE.Vector3(0, 1, 0), E = new THREE.Vector3(), H = new THREE.Vector3(), dv = new THREE.Vector3();
      const limb = (m, a, b) => { dv.subVectors(b, a); const len = dv.length(); m.position.copy(a).addScaledVector(dv, 0.5); m.scale.set(1, len, 1); m.quaternion.setFromUnitVectors(Yv, dv.normalize()); };
      const poseArm = (u, wig) => { E.lerpVectors(E0, E1, u); H.lerpVectors(H0, H1, u); H.y += wig; limb(p10, Sh, E); limb(p11, E, H); p12.position.copy(H); };
      const lensBase = p16.material.color.clone(), white = new THREE.Color(1, 1, 1);
      const setGlint = k => { // k: 0~1 反光強度（鏡片變亮 + 星芒）
        for (const lm of [p16, p19]) { lm.material.color.copy(lensBase).lerp(white, k); }
        p23.visible = k > 0.02;
        p24.material.opacity = Math.min(1, k * 1.4); p25.material.opacity = Math.min(1, k * 1.4);
        p23.scale.setScalar(0.5 + k); p23.rotation.z = k * 1.2;
      };
      const wp = new THREE.Vector3(), st = { t: -1, cd: 1 }; // t：動作進行時間（-1 = 沒在動作），cd：冷卻
      ctx.onUpdate(function (dt) {
        st.cd -= dt;
        if (st.t < 0) {
          if (st.cd > 0) { return; }
          p1.getWorldPosition(wp);
          for (const w of WALKERS) { if (Math.hypot(w.p.position.x - wp.x, w.p.position.z - wp.z) < 3.2) { st.t = 0; break; } }
          if (st.t < 0) { return; }
        }
        st.t += dt;
        const T = st.t, ease = x => x * x * (3 - 2 * x);
        let u = 0, wig = 0, k = 0;
        if (T < 0.6) { u = ease(T / 0.6); }
        else if (T < 1.9) { u = 1; wig = Math.sin((T - 0.6) * 16) * 0.008; } // 手在鏡框旁輕輕推兩下
        else if (T < 2.5) { u = 1 - ease((T - 1.9) / 0.6); }
        else { st.t = -1; st.cd = 7; poseArm(0, 0); setGlint(0); return; } // 動作約 2.5 秒，之後冷卻 7 秒
        if (T > 0.9 && T < 1.5) { k = Math.sin(Math.PI * (T - 0.9) / 0.6); } // 反光
        poseArm(u, wig); setGlint(k);
      });
      return g;
    }
  };
})();
