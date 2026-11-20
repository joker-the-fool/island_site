'use strict';
// 場景：算圖器、鏡頭、燈光、海面
// ---------- 場景 ----------
const canvas = document.getElementById('scene');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); }
catch (e) { showFatal('此環境無法使用 WebGL，無法顯示 3D 島嶼（' + e.message + '）'); throw e; }
// 沒有 GPU（軟體算圖，例如虛擬機）時自動降畫質：縮小算圖解析度、關閉陰影，避免卡頓
const gl = renderer.getContext(), dbgInfo = gl.getExtension('WEBGL_debug_renderer_info');
const gpuName = dbgInfo ? String(gl.getParameter(dbgInfo.UNMASKED_RENDERER_WEBGL)) : '';
const LITE = /swiftshader|llvmpipe|software/i.test(gpuName);
renderer.setPixelRatio(LITE ? 0.6 : Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = LITE === false;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8ccdf0);
scene.fog = new THREE.Fog(0x8ccdf0, 110, 260);
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 400);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.47;
controls.minDistance = 5; controls.maxDistance = 150;

scene.add(new THREE.HemisphereLight(0xfff6e0, 0xa8d8d8, 1.25));
const sun = new THREE.DirectionalLight(0xfff0d0, 1.7);
sun.position.set(-18, 34, 14); sun.castShadow = LITE === false;
sun.shadow.camera.left = -45; sun.shadow.camera.right = 45; sun.shadow.camera.top = 45; sun.shadow.camera.bottom = -45;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0008;
scene.add(sun);

// 淺青綠色的海面（偏霧面、不反光）
// 海面用細分的平面＋平面著色，每幀擠壓頂點做出低多邊形海浪
// 加勒比海風格：靠島的淺水是透亮青綠，離島越遠越藍；浪頂泛白、浪谷略暗，讓起伏看得出來
const seaGeo = new THREE.PlaneGeometry(440, 440, 130, 130).rotateX(-Math.PI/2);
const seaPos = seaGeo.attributes.position, seaN = seaPos.count;
const seaCol = new Float32Array(seaN * 3), seaShallow = new Float32Array(seaN);
seaGeo.setAttribute('color', new THREE.BufferAttribute(seaCol, 3));
const sea = new THREE.Mesh(seaGeo,
  new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, flatShading: true }));
sea.position.y = -2.05; sea.receiveShadow = true; scene.add(sea);
const cDeep = new THREE.Color(0x1b8fd0), cMid = new THREE.Color(0x2bbfd4), cShal = new THREE.Color(0x6fe6d2), cWhite = new THREE.Color(0xffffff), tmpC = new THREE.Color();
function initSea() {
  const all = islands.concat(wild);
  for (let v = 0; v < seaN; v++) {
    const x = seaPos.getX(v), z = seaPos.getZ(v);
    let d = 1e9;
    for (const q of all) { d = Math.min(d, Math.hypot(q.pos.x - x, q.pos.z - z) - q.r * 1.25); }
    const s = Math.max(0, Math.min(1, 1 - d / 16)); // 海面靜止，只依離島遠近上色
    tmpC.copy(cDeep).lerp(cMid, Math.min(1, s * 1.6)).lerp(cShal, Math.max(0, s * 1.4 - 0.4));
    seaCol[v * 3] = tmpC.r; seaCol[v * 3 + 1] = tmpC.g; seaCol[v * 3 + 2] = tmpC.b;
  }
  seaGeo.attributes.color.needsUpdate = true;
}

