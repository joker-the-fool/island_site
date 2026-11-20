'use strict';
// 島：位置、島本體（沙、草、浪花）、周圍的樹、標籤、橋
const islands = [];
const N = data.length;
const bridges = [];
let clickable = [], OV_K = 1;
// 草圖版型：座標為草圖像素（中央主島在 220,198），LK 為換算成場景單位的比例
const LK = 0.145;
const SLOTS = [[138, 88], [271, 113], [323, 261], [225, 325], [124, 273], [97, 165], [212, 25]]; // 第 2~8 座：前 6 座由左上順時針，第 8 座在正上方外圍
(function () {
  // 本檔案自成一體：標籤與樹的程式都放在這裡，不和其他檔案共用

  // 奶油色圓角標籤：左邊紅色編號徽章 + 島名；螢幕上固定大小，不隨距離放大
  function label(no, text) {
    const c = document.createElement('canvas'); c.width = 640; c.height = 128;
    const g = c.getContext('2d');
    g.font = 'bold 50px "Microsoft JhengHei",sans-serif';
    const tw = g.measureText(text).width;
    const badgeW = 96, pad = 22, w = pad + badgeW + 16 + tw + pad, x0 = (640 - w) / 2;
    g.shadowColor = '#0003'; g.shadowBlur = 10; g.shadowOffsetY = 4;
    g.fillStyle = '#ffffff'; g.fillRect(x0, 20, w, 88);
    g.shadowColor = 'transparent';
    // 編號徽章的顏色＝副配色（islands_data.js 的 ISLAND_THEME.secondary，沒設定就用預設紅）；徽章上的數字依底色深淺自動用白字或深字
    const T = window.ISLAND_THEME || {}, badge = /^#[0-9a-f]{6}$/i.test(T.secondary || '') ? T.secondary : '#af272f';
    const bn = parseInt(badge.slice(1), 16), lum = 0.299 * (bn >> 16 & 255) + 0.587 * (bn >> 8 & 255) + 0.114 * (bn & 255);
    g.fillStyle = badge; g.fillRect(x0, 20, badgeW, 88);
    g.fillStyle = lum > 160 ? '#222' : '#fff'; g.font = '40px Georgia,serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(no, x0 + badgeW / 2, 66);
    g.fillStyle = '#222'; g.font = '500 50px "Noto Sans CJK TC","Microsoft JhengHei",sans-serif'; g.textAlign = 'left';
    g.fillText(text, x0 + badgeW + 22, 68);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, sizeAttenuation: false, fog: false, toneMapped: false }));
    s.scale.set(0.24, 0.048, 1); s.renderOrder = 10; return s;
  }

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

  // 自然植物（小島型建築用：樹、棕櫚、灌木、岩石混合散布；一般島只種樹）
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

  const R_ISL = 5;
  const placeRand = rng(2024);
  // 依使用者箭頭微調位置：島編號 → [x 位移, z 位移]（場景單位）。2=休閒、7=潮流，往右下方（外側）移開
  const SHIFT = { 2: [10.4, 3.5], 7: [7.1, 4.5] };
  data.forEach((d, i) => {
    const grp = new THREE.Group();
    const S = ISLAND_SHAPES[d.shape] || ISLAND_SHAPES.house; // 建築由 shapes\*.js 登記；沒有這種 shape 就用小鎮
    const isle = S.isle === true; // 小島型建築：本身就是一座小島（半徑 S.baseR、不轉向、植物自然散布）
    const sc = d.scale > 0 ? d.scale : 1; // 這座島整體的放大縮小倍率（資料的 scale 欄位，預設 1）
    const hasSeed = typeof d.seed === 'number'; // 資料有 seed：島形與植物散布固定下來，不再看島在清單裡的順序
    const seed = hasSeed ? d.seed : 100 + i; // 小島型的亂數種子（沒填就依編號）；一般島沒填 seed 時，島形用編號 i、樹用 i + 3
    const color = d.color || '#6fbf73', rand = rng(isle ? seed : (hasSeed ? d.seed + 3 : i + 3)), bs = isle ? seed : (hasSeed ? d.seed : i), r = isle ? (S.baseR || 2.5) : (i === 0 ? R_ISL + 0.8 : R_ISL); // 小島型建築的半徑優先（預覽小島型時它是唯一的第 0 座）
    // 由下而上：深沙 → 沙 → 草地，加一圈淡色浪花
    const foam = new THREE.Mesh(blobGeo(r * 1.28, bs, 0.02), new THREE.MeshBasicMaterial({ color: 0xc9eeee, transparent: true, opacity: 0.55 }));
    foam.position.y = -1.88;
    const dark = mk(blobGeo(r * 0.9, bs, 0.9), 0xd2ae7c, 0, -2.2, 0);
    const sand = mk(blobGeo(r, bs, 1.3), 0xf1dcae, 0, -1.3, 0);
    const grass = mk(blobGeo(r * 0.86, bs, 0.3), 0xa9d18a, 0, 0, 0);
    grp.add(foam, dark, sand, grass);
    const top = 0.5;
    // 位置依草圖：中間一座主島，其餘 6 座在四周（草圖像素座標換算成場景單位）
    let pos = new THREE.Vector3(0, 0, 0);
    if (i > 0) {
      const sl = SLOTS[i - 1];
      if (typeof d.x === 'number' && typeof d.z === 'number') { pos = new THREE.Vector3(d.x, 0, d.z); } // 資料裡指定了位置（x、z 為場景單位，中央主島固定在 0,0）
      else if (sl) { const sh = SHIFT[i] || [0, 0]; pos = new THREE.Vector3((sl[0] - 220) * LK + sh[0], 0, (sl[1] - 198) * LK + sh[1]); }
      else { const a = placeRand() * Math.PI * 2; pos = new THREE.Vector3(Math.cos(a) * 34, 0, Math.sin(a) * 34); } // 超過 7 座時往外放
    }
    grp.position.copy(pos);
    // 建築正面朝向中央商場（中央商場本身正面朝 +z，也就是總覽鏡頭的方向）
    const face = i === 0 ? 0 : Math.atan2(-pos.x, -pos.z);
    const themed = i === 0 || S.themed === true; // 商場與主題建築：周圍不種樹
    let main;
    try { main = S.build(color, { index: i, r, face, onUpdate: fn => UPDATERS.push(fn) }); }
    catch (e) { // 某種建築建造失敗（例如新加入的建築檔案有錯）：只顯示錯誤、這座島先空著，不讓整頁空白
      console.error(e); showFatal('建築「' + d.shape + '」建造失敗：' + e.message); main = new THREE.Group();
    }
    main.position.y = top;
    main.rotation.y = isle ? 0 : face; // 小島型建築不轉向
    grp.add(main);
    // 島上人物：islands_data.js 的 characters 欄位，每個 { type, x, y, z, ry }；位置相對於建築（+z 是建築正面，ry 是面向角度，單位度）
    const addChars = list => { // 回傳 { objs, fns }：建出來的人物與它們登記的每幀動作（預覽模式要整批換掉時用）
      const got = { objs: [], fns: [] };
      (list || []).forEach(c => {
        const C = window.ISLAND_CHARACTERS[c.type];
        if (C === undefined) { console.warn('找不到島上人物：' + c.type); return; }
        try {
          const ch = C.build({ index: i, r, face, onUpdate: fn => { UPDATERS.push(fn); got.fns.push(fn); } });
          ch.position.set(c.x || 0, c.y || 0, c.z || 0); ch.rotation.y = (c.ry || 0) * Math.PI / 180; main.add(ch); got.objs.push(ch);
        } catch (e) { console.error(e); showFatal('島上人物「' + c.type + '」建造失敗：' + e.message); }
      });
      return got;
    };
    let charSet = addChars(d.characters);
    if (PREVIEW) { // 維護工具的即時預覽：收到新的人物清單就整批換掉（舊的拿掉、釋放記憶體、取消它們的每幀動作）
      window.__previewSetCharacters = list => {
        charSet.objs.forEach(o => { main.remove(o); o.traverse(n => { if (n.geometry) { n.geometry.dispose(); } }); });
        charSet.fns.forEach(f => { const k = UPDATERS.indexOf(f); if (k >= 0) { UPDATERS.splice(k, 1); } });
        charSet = addChars(list);
      };
    }
    // 周圍散布樹木（避開中央建築；建築可能已旋轉，所以換算到建築自己的座標再判斷）
    const cnt = isle ? 0 : 6 + Math.floor(rand() * 3); // 小島型建築不種一般島的樹（下面用自然散布）
    let moved = 0;
    for (let k = 0; k < cnt; k++) {
      const a = rand() * Math.PI * 2, rr = r * (0.5 + rand() * 0.28);
      let px = Math.cos(a) * rr, pz = Math.sin(a) * rr;
      const lx = px * Math.cos(face) - pz * Math.sin(face), lz = px * Math.sin(face) + pz * Math.cos(face);
      // 正面視野要一目了然：建築正前方（鏡頭看過來的那一側）不放樹，原本會落在那裡的樹改放到建築左右兩側
      if (lz > 1.2 && Math.abs(lx) < (i === 0 ? 3.8 : 3.4)) {
        if (moved >= 4) { continue; }
        const fash = S.treeLeft === true; // 服飾店、尊榮（右側有藍色晶體）：一律放左邊
        const sgn = fash ? -1 : (moved % 2 === 0 ? -1 : 1);
        const nx = fash ? -2.9 : (sgn < 0 ? -3.6 : 3.9), nz = fash ? 0.4 - moved * 1.3 : -1.0 + Math.floor(moved / 2) * 0.8; moved++;
        px = nx * Math.cos(face) + nz * Math.sin(face); pz = -nx * Math.sin(face) + nz * Math.cos(face);
      } else if (S.treeBehind === true && lx > 1.0 && lx < 4.2 && Math.abs(lz) < 2.0) { // 尊榮：晶體周圍的樹往後挪（放到建築後方）
        const nx = Math.min(lx, 2.4), nz = -2.8;
        px = nx * Math.cos(face) + nz * Math.sin(face); pz = -nx * Math.sin(face) + nz * Math.cos(face);
      } else if (themed && Math.abs(lx) < (i === 0 ? 3.6 : 3.3) && Math.abs(lz) < (i === 0 ? 3.2 : 2.8)) { continue; } // 建築範圍內不種樹
      const t = treeMesh(rand); t.position.set(px, top, pz); grp.add(t);
    }
    if (isle) { // 小島型：樹、棕櫚、灌木、岩石混合散布（sparse = 有擺設的小島，只放少量植物、石頭縮小），再讓建築檔案決定植物擺哪裡
      const sparse = S.sparse === true, pc = sparse ? 2 : Math.max(2, Math.round(r * 1.3));
      for (let k = 0; k < pc; k++) {
        const a = rand() * Math.PI * 2, rr = r * (sparse ? 0.62 + rand() * 0.15 : 0.1 + rand() * 0.6), q = rand();
        const o = q < 0.3 ? treeMesh(rand) : q < 0.55 ? palmMesh(rand) : q < 0.8 ? bushMesh(rand) : rockMesh(rand);
        o.userData.kind = q < 0.3 ? 'tree' : q < 0.55 ? 'palm' : q < 0.8 ? 'bush' : 'rock';
        o.position.set(Math.cos(a) * rr, 0.5, Math.sin(a) * rr); o.rotation.y = rand() * 6;
        if (sparse && q >= 0.8) { o.scale.setScalar(0.45); }
        grp.add(o);
      }
      if (typeof S.arrange === 'function') { try { S.arrange(grp.children.filter(ch => ch.userData.kind && ch.userData.kind !== 'rock')); } catch (e) { console.error(e); showFatal('小島「' + d.shape + '」排列植物失敗：' + e.message); } }
    }
    // 標籤：title 留空就不顯示（編號、名稱都沒有；小島型的副島預設這樣）
    const lb = (d.title && d.title.trim() !== '') ? label(String(i + 1).padStart(2, '0'), d.title) : null;
    if (lb !== null) {
      lb.position.y = i === 0 ? 10.5 : 7; // 中央商場比較高，標籤抬高
      lb.visible = !PREVIEW; // 預覽模式不顯示標籤
      grp.add(lb);
    }
    grp.scale.setScalar(sc); // 整座島（島、建築、樹、人物）一起放大縮小
    scene.add(grp);
    const hit = [];
    grp.traverse(o => { if (o.isMesh && o !== foam) { hit.push(o); } });
    if (lb !== null) { hit.push(lb); }
    hit.forEach(m => { m.userData.idx = i; });
    islands.push({ d, grp, pos, r: r * sc, phase: i * 1.3, hit, face, isle }); // r 記的是縮放後的實際半徑（橋、重疊、鏡頭都用它）
  });
  clickable = islands.flatMap(o => o.hit);
  // 總覽鏡頭依最遠的島調整距離（原本 8 座的配置最遠約 26，低於 32，所以鏡頭不變；島被拉得更遠時才會往後退）
  OV_K = Math.max(32, ...islands.filter(o => o.isle !== true).map(o => Math.hypot(o.pos.x, o.pos.z) + o.r)) / 32; // 小島型不算（它們在主島群外圍的小島，不影響總覽距離）
})();

const EDGES = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [6, 5], [2, 3], [4, 3], [0, 7], [2, 7]]; // 橋（舊格式資料沒有 bridges 欄位時用）
// ---------- 木橋：中央連每座島，相鄰的島也互連 ----------
function bridge(A, B) {
  const dir = new THREE.Vector3().subVectors(B.pos, A.pos).setY(0), len0 = dir.length(); dir.normalize();
  const p0 = A.pos.clone().addScaledVector(dir, A.r * 0.92), p1 = B.pos.clone().addScaledVector(dir, -B.r * 0.92);
  const len = p0.distanceTo(p1); if (len < 0.5) { return; }
  const g = new THREE.Group(); g.position.copy(p0); g.rotation.y = Math.atan2(-dir.z, dir.x);
  const steps = Math.ceil(len / 0.42);
  for (let s = 0; s <= steps; s++) {
    const u = s / steps, p = mk(new THREE.BoxGeometry(0.34, 0.08, 1.2), s % 2 ? 0xb98a56 : 0xc89a64, u * len, 0.45 - Math.sin(u * Math.PI) * -0.12, 0);
    g.add(p);
  }
  for (const z of [-0.62, 0.62]) {
    const rail = mk(new THREE.BoxGeometry(len, 0.05, 0.05), 0x7a5a3a, len / 2, 0.95, z); g.add(rail);
    for (const u of [0, 0.5, 1]) { g.add(mk(new THREE.BoxGeometry(0.08, 0.6, 0.08), 0x7a5a3a, u * len, 0.7, z)); }
  }
  scene.add(g);
  // 小人走動用的路線：A 島內 → 橋頭 → 橋尾 → B 島內
  bridges.push({ pts: [A.pos.clone().addScaledVector(dir, A.r * 0.35), p0, p1, B.pos.clone().addScaledVector(dir, -B.r * 0.35)] });
}
// 橋的連法：islands_data.js 每座島的 bridges 欄位（填相連島的 id）決定；整份資料都沒有 bridges 欄位時，沿用上面寫死的 EDGES（舊格式）
if (data.some(d => Array.isArray(d.bridges))) {
  const idIdx = new Map(data.map((d, i) => [d.id, i])), seen = new Set();
  data.forEach((d, i) => {
    (d.bridges || []).forEach(bid => {
      const j = idIdx.get(bid);
      if (j === undefined || j === i) { return; } // 指到不存在的島或自己：略過
      const a = Math.min(i, j), b = Math.max(i, j), key = a + '-' + b;
      if (seen.has(key) === false) { seen.add(key); bridge(islands[a], islands[b]); } // 兩邊都列也只蓋一座橋
    });
  });
} else {
  EDGES.forEach(([a, b]) => { if (a < N && b < N) { bridge(islands[a], islands[b]); } });
  for (let i = 8; i < N; i++) { bridge(islands[0], islands[i]); } // 多出來的島直接連中央
}

