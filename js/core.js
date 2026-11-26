'use strict';
// 共用基礎：資料載入、基本積木、登記表。其他檔案都建立在這支之上，最先載入
function showFatal(msg) {
  const el = document.getElementById('err');
  el.textContent = msg; el.style.display = 'block';
}
if (typeof THREE === 'undefined') {
  showFatal('找不到 three.js：請確認 vendor/three_local.js 有跟 index.html 放在一起（資料夾結構要保持 vendor/three_local.js）');
  throw new Error('three.js not loaded');
}
const { OrbitControls } = THREE; // THREE 為 vendor/three_local.js 提供的全域物件

// ---------- 讀島嶼資料：islands_data.js 提供 window.ISLANDS（JSON 陣列） ----------
if (Array.isArray(window.ISLANDS) === false || window.ISLANDS.length === 0) {
  showFatal('讀不到島嶼資料：請確認 islands_data.js 有跟 index.html 放在一起');
  throw new Error('islands data missing');
}
// 預覽模式：網址帶 ?preview=建築類型&color=%23rrggbb 時只畫一座島（維護工具用來即時預覽 shape）
const PV = new URLSearchParams(location.search), PREVIEW = PV.get('preview');
const EDIT3D = PV.get('edit3d') === '1'; // 維護工具的「3D 編輯模式」：在 3D 畫面直接拖動島嶼位置（見 main.js 最後面）
// 預覽模式也可以用 &scale=（倍率）帶入這座島的放大縮小
let previewChars = []; // 預覽模式可以用 &characters=（JSON 陣列）帶入這座島上的人物，維護工具預覽時會用到
try { previewChars = JSON.parse(PV.get('characters') || '[]'); } catch (e) { previewChars = []; }
const data = PREVIEW ? [{ id: 'preview', title: '', desc: '', link: '', color: PV.get('color') || '#c4503a', shape: PREVIEW, characters: previewChars, scale: +PV.get('scale') || 1, seed: PV.get('seed') === null ? undefined : +PV.get('seed') }] : window.ISLANDS;


// ---------- 基本積木與工具（所有模型共用）----------
const mat = (c, r = 0.8) => new THREE.MeshStandardMaterial({ color: c, roughness: r, flatShading: true });
function shadowed(m) { m.castShadow = true; m.receiveShadow = true; return m; }

// 可重現的亂數（同一座島每次長一樣）
function rng(seed) { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

// 不規則的圓潤島形
function blobGeo(r, seed, depth) {
  const sh = new THREE.Shape(), n = 40;
  for (let k = 0; k < n; k++) {
    const a = k / n * Math.PI * 2;
    const rr = r * (1 + 0.1 * Math.sin(3 * a + seed) + 0.07 * Math.sin(5 * a + seed * 2.3) + 0.04 * Math.sin(8 * a + seed));
    k === 0 ? sh.moveTo(Math.cos(a) * rr, Math.sin(a) * rr) : sh.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelSize: 0.18, bevelThickness: 0.18, bevelSegments: 2, curveSegments: 6 });
  g.rotateX(-Math.PI / 2); return g;
}
const mk = (geo, color, x = 0, y = 0, z = 0) => { const m = shadowed(new THREE.Mesh(geo, mat(color))); m.position.set(x, y, z); return m; };

const boxM = (w, h, d, c, x, y, z) => mk(new THREE.BoxGeometry(w, h, d), c, x, y, z);
const cylM = (rt, rb, h, c, x, y, z, seg = 10) => mk(new THREE.CylinderGeometry(rt, rb, h, seg), c, x, y, z);
const sphM = (r, c, x, y, z) => mk(new THREE.SphereGeometry(r, 10, 8), c, x, y, z);

// ---------- 登記表：各檔案載入時把自己登記進來，主程式再統一呼叫 ----------
window.ISLAND_SHAPES = window.ISLAND_SHAPES || {}; // 建築（shapes\*.js 登記）
window.ISLAND_CHARACTERS = window.ISLAND_CHARACTERS || {}; // 島上人物（characters\*.js 登記；放在哪座島、什麼位置由 islands_data.js 的 characters 欄位決定）
const CREATURES = [];   // 生物與天空（creatures\*.js、js\sky.js 登記）：{ name, setup(), update(dt, t) }
const UPDATERS = [];    // 建築自己要每幀更新的動作（建築 build 時用 ctx.onUpdate 登記）
const WALKERS = [];     // 橋上小人的位置資料（走路小人登記；迎賓女服務員、推眼鏡的人只讀位置，不共用繪圖程式）
