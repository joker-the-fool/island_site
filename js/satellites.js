'use strict';
// 遠處的無名群島（島旁的副島已經是一般的島：islands_data.js 裡的小島型建築，見 shapes\isle_*.js）
const wild = [];
(function () {
  // 本檔案自成一體：樹、棕櫚、灌木、岩石都放在這裡，不和其他檔案共用

  function treeMesh(rand) {
    const t = new THREE.Group(), s = 0.75 + rand() * 0.6;
    t.add(mk(new THREE.CylinderGeometry(0.12 * s, 0.17 * s, 0.9 * s, 6), 0x8a5a35, 0, 0.45 * s, 0));
    if (rand() < 0.35) { // 松樹
      t.add(mk(new THREE.ConeGeometry(0.75 * s, 1.5 * s, 7), 0x5fa05a, 0, 1.5 * s, 0));
      t.add(mk(new THREE.ConeGeometry(0.55 * s, 1.1 * s, 7), 0x6fb064, 0, 2.2 * s, 0));
    } else { // 圓圓的闊葉樹
      const cols = [0x7fbf6a, 0x8cc774, 0x6fb064];
      t.add(mk(new THREE.IcosahedronGeometry(0.8 * s, 0), cols[Math.floor(rand() * 3)], 0, 1.4 * s, 0));
      t.add(mk(new THREE.IcosahedronGeometry(0.5 * s, 0), cols[Math.floor(rand() * 3)], 0.4 * s, 1.0 * s, 0.2 * s));
    }
    return t;
  }

  // ---------- 無名群島：只有樹、棕櫚、灌木、岩石，沒有標題、沒有橋、沒有人 ----------
  const wildRand = rng(808);
  function palmMesh(rand) {
    const t = new THREE.Group(), s = 0.8 + rand() * 0.5, lean = (rand() - 0.5) * 0.4;
    const trunk = mk(new THREE.CylinderGeometry(0.1 * s, 0.16 * s, 2.2 * s, 6), 0x9a7650, 0, 1.1 * s, 0); trunk.rotation.z = lean; t.add(trunk);
    const top = new THREE.Group(); top.position.set(-Math.sin(lean) * 2.2 * s, 2.2 * s, 0);
    for (let l = 0; l < 6; l++) {
      const leaf = mk(new THREE.ConeGeometry(0.28 * s, 1.5 * s, 4), l % 2 ? 0x5fa05a : 0x6fb064, 0, 0, 0);
      leaf.scale.z = 0.35; leaf.position.set(Math.cos(l / 6 * Math.PI * 2) * 0.6 * s, -0.1 * s, Math.sin(l / 6 * Math.PI * 2) * 0.6 * s);
      leaf.rotation.set(Math.sin(l / 6 * Math.PI * 2) * 1.2, 0, -Math.cos(l / 6 * Math.PI * 2) * 1.2);
      top.add(leaf);
    }
    t.add(top); return t;
  }
  function rockMesh(rand) {
    const s = 0.5 + rand() * 0.8, m = mk(new THREE.DodecahedronGeometry(s, 0), rand() < 0.5 ? 0x6a6862 : 0x7d776a);
    m.scale.set(1 + rand() * 0.4, 0.6 + rand() * 0.3, 1 + rand() * 0.4); m.position.y = s * 0.35; m.rotation.y = rand() * 3;
    const g = new THREE.Group(); g.add(m); return g;
  }
  function bushMesh(rand) {
    const s = 0.5 + rand() * 0.4, g = new THREE.Group();
    g.add(mk(new THREE.IcosahedronGeometry(0.6 * s, 0), [0x5f9a58, 0x4f8a4a, 0x6a9f54][Math.floor(rand() * 3)], 0, 0.35 * s, 0));
    return g;
  }
  function wildIsland(x, z, r, seed, natural, sparse) {
    const grp = new THREE.Group(), rand = rng(seed);
    const foam = new THREE.Mesh(blobGeo(r * 1.28, seed, 0.02), new THREE.MeshBasicMaterial({ color: 0xc9eeee, transparent: true, opacity: 0.55 }));
    foam.position.y = -1.88;
    // 遠處群島(natural)用深色的泥土與草地，不用淺色沙；掛旁小島維持與主島相同的淺色
    const cB = natural ? 0x5e4d35 : 0xd2ae7c, cS = natural ? 0x86714a : 0xf1dcae, cG = natural ? 0x5f8f4a : 0xa9d18a;
    grp.add(foam, mk(blobGeo(r * 0.9, seed, 0.9), cB, 0, -2.2, 0), mk(blobGeo(r, seed, 1.3), cS, 0, -1.3, 0), mk(blobGeo(r * 0.86, seed, 0.3), cG, 0, 0, 0));
    const cnt = sparse ? 2 : Math.max(2, Math.round(r * 1.3)); // sparse：有主題擺設的小島，只在外圈放少量植物
    for (let k = 0; k < cnt; k++) {
      const a = rand() * Math.PI * 2, rr = r * (sparse ? 0.62 + rand() * 0.15 : 0.1 + rand() * 0.6), q = rand();
      const o = q < 0.3 ? treeMesh(rand) : q < 0.55 ? palmMesh(rand) : q < 0.8 ? bushMesh(rand) : rockMesh(rand);
      o.userData.kind = q < 0.3 ? 'tree' : q < 0.55 ? 'palm' : q < 0.8 ? 'bush' : 'rock';
      o.position.set(Math.cos(a) * rr, 0.5, Math.sin(a) * rr); o.rotation.y = rand() * 6;
      if (sparse && q >= 0.8) { o.scale.setScalar(0.45); } // 有主題擺設的小島（燈塔、泳池）：石頭縮小
      grp.add(o);
    }
    grp.position.set(x, 0, z); scene.add(grp);
    const o = { grp, pos: grp.position, r, phase: seed * 1.7, natural: !!natural };
    wild.push(o); return o;
  }
  // 遠處的無名群島：10 個群組隨機散佈在外圍；每組 2~4 座小島，互相靠近但不重疊，也避開主島
  const GROUPS = 10;
  for (let gI = 0; gI < GROUPS; gI++) {
    const ga = (gI + 0.5 + (wildRand() - 0.5) * 0.8) / GROUPS * Math.PI * 2 + 0.9, gd = 50 + wildRand() * 45;
    const cx = Math.cos(ga) * gd, cz = Math.sin(ga) * gd, num = 2 + Math.floor(wildRand() * 3);
    for (let k = 0; k < num; k++) {
      for (let tryN = 0; tryN < 30; tryN++) {
        const r = 2 + wildRand() * 2, a = wildRand() * Math.PI * 2, d = k === 0 ? 0 : 5 + wildRand() * 6 + tryN * 0.2;
        const x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
        const okMain = islands.every(q => Math.hypot(q.pos.x - x, q.pos.z - z) > q.r * 1.3 + r * 1.3 + 3);
        const okWild = wild.every(q => Math.hypot(q.pos.x - x, q.pos.z - z) > q.r * 1.3 + r * 1.3 + 0.8);
        if (okMain && okWild) { wildIsland(x, z, r, 40 + gI * 7 + k, true); break; }
      }
    }
  }
})();
