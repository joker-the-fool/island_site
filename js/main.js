'use strict';
// 主程式：等所有檔案載入完才執行——算海面深淺、建立生物、鏡頭、點擊、主迴圈
initSea(); // 島都放好後，依離島遠近算出海水深淺
CREATURES.forEach(c => c.setup());

// ---------- 鏡頭飛行 ----------
const overview = { pos: new THREE.Vector3(0, 28 * OV_K, 51 * OV_K), target: new THREE.Vector3(0, 0, -4) }; // 低角度（約 27° 俯角）
controls.target.copy(overview.target);
camera.position.copy(overview.pos);
let fly = null;
function flyTo(pos, target) {
  fly = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos, t1: target, t: 0 };
}
let focused = -1;
// 閒置一陣子：自動回到總覽鏡頭，之後以一分鐘一圈的速度環繞（任何操作都會中止並重新計時）
const IDLE_SEC = 30;
let lastActive = 0, idleHome = false;
controls.autoRotateSpeed = 60 / 120; // 搭配 controls.update(dt)：1.0 = 60 秒轉一圈，所以 60/秒數 = 120 秒轉一圈
function userActive() {
  lastActive = clock.elapsedTime;
  if (idleHome) { idleHome = false; fly = null; }
  controls.autoRotate = false;
}
controls.addEventListener('start', userActive);
addEventListener('keydown', userActive);
function focusIsland(i) {
  focused = i;
  const c = islands[i].pos;
  // 鏡頭停在島嶼外側、建築正面那一側（正面朝向中央商場），低角度正對著看
  const f = new THREE.Vector3(Math.sin(islands[i].face), 0, Math.cos(islands[i].face));
  flyTo(c.clone().addScaledVector(f, 16).add(new THREE.Vector3(0, 13, 0)), c.clone().add(new THREE.Vector3(0, 1.8, 0)));
  history.replaceState(null, '', '#' + data[i].id);
}
document.getElementById('reset').onclick = () => {
  userActive();
  focused = -1;
  flyTo(overview.pos.clone(), overview.target.clone());
  history.replaceState(null, '', location.pathname);
  idleHome = true; // 回到總覽後立刻開始環繞（動畫迴圈會在飛行結束時啟動）
};

// ---------- 點擊小島 ----------
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
// 雙擊後拖動＝平移（POS 的觸控螢幕只有單點，用「輕點兩下，第二下不放開直接拖」代替右鍵平移；單純雙擊不做任何事）。
// 用 pointer 事件自己判斷雙擊（觸控的 dblclick 事件不可靠）；滑鼠、觸控、觸控筆都適用。
// 因為雙擊的第一下也是一次點擊，「單擊小島飛過去」會等 DOUBLE_MS 沒有第二下才執行（單擊的反應會慢約 0.35 秒）。
const DOUBLE_MS = 350, DOUBLE_PX = 40, TAP_PX = 12; // 兩下的最大間隔、兩下的最大距離（觸控面板會抖，放寬一點）、算成「點」的最大移動量（像素）
let down = null, downAt = 0, lastTap = null, panning = false, skipClick = false, focusTimer = null;
function setPanMode(on) { // 單指拖動預設是旋轉；雙擊後的那一次拖動改成平移（觸控與滑鼠都套用），放開就還原
  controls.touches.ONE = on ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE;
  controls.mouseButtons.LEFT = on ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE;
  canvas.style.cursor = on ? 'move' : 'grab';
}
// 以下兩個用 capture 階段，才會比 OrbitControls 先處理（它在按下當下就決定要旋轉還是平移）
canvas.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse' && e.button !== 0) { return; } // 滑鼠右鍵、中鍵本來就是平移，不處理
  down = [e.clientX, e.clientY]; downAt = performance.now();
  if (lastTap !== null && downAt - lastTap.t < DOUBLE_MS && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < DOUBLE_PX) {
    panning = true; skipClick = true; lastTap = null; setPanMode(true); // 這是雙擊的第二下：這次拖動改成平移
    clearTimeout(focusTimer); focusTimer = null;                        // 取消第一下留下的「單擊飛過去」
  }
}, true);
canvas.addEventListener('pointerup', e => {
  if (panning) { panning = false; setPanMode(false); return; } // 平移結束，還原成旋轉
  const quick = down !== null && Math.hypot(e.clientX - down[0], e.clientY - down[1]) <= TAP_PX && performance.now() - downAt < DOUBLE_MS;
  lastTap = quick ? { t: performance.now(), x: e.clientX, y: e.clientY } : null; // 短短一點才算「第一下」
}, true);
canvas.addEventListener('pointercancel', () => { if (panning) { panning = false; setPanMode(false); } lastTap = null; }, true);
canvas.addEventListener('pointerup', e => {
  if (skipClick) { skipClick = false; return; } // 雙擊平移的那一下，不當成點擊
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) { return; }
  mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(mouse, camera);
  const h = ray.intersectObjects(clickable, false)[0];
  if (h) {
    const idx = h.object.userData.idx;
    if (focused === idx && data[idx].link) { clearTimeout(focusTimer); focusTimer = null; location.href = data[idx].link; return; } // 已經飛到這座島，再點一下 → 跳轉到 link 設定的頁面
    clearTimeout(focusTimer);
    focusTimer = setTimeout(() => { focusTimer = null; focusIsland(idx); }, DOUBLE_MS); // 等一下，沒有第二下才飛過去聚焦（第一下只聚焦；再點已聚焦、且有設 link 的島才跳轉）
  }
});
canvas.addEventListener('pointermove', e => {
  mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(mouse, camera);
  canvas.style.cursor = ray.intersectObjects(clickable, false).length ? 'pointer' : 'grab';
});

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  // 視窗偏窄（直式）時，總覽鏡頭拉遠，讓全部小島都入鏡
  const zoomK = Math.max(1, 0.86 / camera.aspect) * OV_K;
  overview.pos.set(0, 28 * zoomK, 55 * zoomK - 4); // 相對於總覽目標點(0,0,-4)往後 55、往上 28，直式視窗再依比例拉遠
  controls.maxDistance = overview.pos.length() * 1.15; // 不能拉得比總覽再遠太多
  if (fly === null && controls.target.distanceToSquared(overview.target) < 0.01) { camera.position.copy(overview.pos); }
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

// ---------- 縮放條：「全部小島」按鈕下面的垂直滑桿，作用跟滑鼠滾輪一樣（上方＝拉近、下方＝拉遠）----------
const zbar = document.getElementById('zoombar'), ztrack = document.getElementById('ztrack'), zthumb = document.getElementById('zthumb');
let zDragging = false;
zbar.style.width = document.getElementById('reset').offsetWidth + 'px'; // 跟「全部小島」按鈕同寬，水平置中在它下面
const zoomDist = () => camera.position.distanceTo(controls.target);
function zoomT() { // 目前距離換成 0~1（1 = 最近、0 = 最遠），用對數刻度，手感跟滾輪一樣
  const a = Math.log(controls.maxDistance), b = Math.log(controls.minDistance);
  return Math.max(0, Math.min(1, (a - Math.log(zoomDist())) / (a - b)));
}
function setZoomDist(d) { // 沿著目前視線方向把鏡頭移到指定距離
  d = Math.max(controls.minDistance, Math.min(controls.maxDistance, d));
  const dir = camera.position.clone().sub(controls.target).normalize();
  camera.position.copy(controls.target).addScaledVector(dir, d);
  fly = null; userActive(); // 中止飛行動畫、重新計算閒置時間
}
function placeZoomThumb(t) { zthumb.style.top = ((1 - t) * (ztrack.clientHeight - zthumb.offsetHeight)) + 'px'; }
function updateZoomBar() { if (zDragging === false) { placeZoomThumb(zoomT()); } } // 每幀依鏡頭距離擺放滑塊（滾輪縮放、飛向某座島時也會跟著動）
function zoomFromPointer(ev) {
  const r = ztrack.getBoundingClientRect(), tt = Math.max(0, Math.min(1, 1 - (ev.clientY - r.top - zthumb.offsetHeight / 2) / (r.height - zthumb.offsetHeight)));
  const a = Math.log(controls.maxDistance), b = Math.log(controls.minDistance);
  setZoomDist(Math.exp(a - tt * (a - b))); placeZoomThumb(tt);
}
ztrack.addEventListener('pointerdown', ev => {
  zDragging = true; ev.preventDefault();
  try { ztrack.setPointerCapture(ev.pointerId); } catch (e) { /* 沒有可捕捉的指標時略過 */ }
  zoomFromPointer(ev);
});
ztrack.addEventListener('pointermove', ev => { if (zDragging) { zoomFromPointer(ev); } });
ztrack.addEventListener('pointerup', () => { zDragging = false; });
zbar.addEventListener('contextmenu', ev => ev.preventDefault()); // 縮放條上按右鍵不要跳出瀏覽器的選單
document.getElementById('zin').onclick = () => setZoomDist(zoomDist() * 0.85);
document.getElementById('zout').onclick = () => setZoomDist(zoomDist() / 0.85);

// ---------- 動畫 ----------
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = clock.getDelta(), t = clock.elapsedTime;
  islands.forEach(o => { o.grp.position.y = Math.sin(t * 0.8 + o.phase) * 0.04; });
  wild.forEach(o => { o.grp.position.y = Math.sin(t * 0.8 + o.phase) * 0.04; });
  UPDATERS.forEach(fn => fn(dt, t));              // 建築自己的動作（迎賓女服務員、推眼鏡的人）
  CREATURES.forEach(c => c.update(dt, t));        // 走路小人、魚、海鷗、雲與風
  if (!fly && !idleHome && clock.elapsedTime - lastActive > IDLE_SEC) { // 閒置太久：先飛回總覽
    idleHome = true; focused = -1;
    flyTo(overview.pos.clone(), overview.target.clone());
    history.replaceState(null, '', location.pathname);
  }
  if (idleHome && !fly) { controls.autoRotate = true; } // 回到總覽後開始環繞
  if (fly) {
    fly.t = Math.min(1, fly.t + dt / 1.2);
    const k = fly.t < 0.5 ? 4 * fly.t ** 3 : 1 - (-2 * fly.t + 2) ** 3 / 2;
    camera.position.lerpVectors(fly.p0, fly.p1, k);
    controls.target.lerpVectors(fly.t0, fly.t1, k);
    if (fly.t >= 1) { fly = null; }
  }
  controls.update(dt);
  // 限制平移範圍，避免拖到離主島群太遠
  const tl = Math.hypot(controls.target.x, controls.target.z);
  if (tl > 35) {
    const kk = 35 / tl, nx = controls.target.x * kk, nz = controls.target.z * kk;
    camera.position.x += nx - controls.target.x; camera.position.z += nz - controls.target.z;
    controls.target.x = nx; controls.target.z = nz;
  }
  updateZoomBar();
  renderer.render(scene, camera);
});

// 帶 #id 進來時直接飛到該島
const start = data.findIndex(d => d.id === location.hash.slice(1));
if (start >= 0) { focusIsland(start); }
if (PREVIEW) { document.body.classList.add('preview'); focusIsland(0); } // 預覽模式：鏡頭直接對著唯一的島
if (PREVIEW) { // 維護工具（外層頁面）用 postMessage 即時更新島上人物，不用重新載入整個預覽
  addEventListener('message', ev => {
    const m = ev.data;
    if (m && m.type === 'island-characters' && window.__previewSetCharacters) { window.__previewSetCharacters(Array.isArray(m.characters) ? m.characters : []); }
  });
}
