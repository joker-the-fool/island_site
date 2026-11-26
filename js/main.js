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
// ---------- 只有維護工具的「3D 編輯模式」（EDIT3D）才能用鍵盤移動鏡頭；一般瀏覽的網頁不會有這功能 ----------
// WASD 平移鏡頭：W 往前、S 往後、A 往左、D 往右（沿著地面方向移動）；空白鍵往上、Ctrl 往下；按住不放持續移動，視角角度不變 ----------
const panKeys = { w: false, a: false, s: false, d: false, ' ': false, control: false };
const isTyping = t => t !== null && t !== undefined && (t.isContentEditable === true || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || ''));
addEventListener('keydown', e => {
  const k = (e.key || '').toLowerCase(); if (EDIT3D !== true || (k in panKeys) === false || isTyping(e.target)) { return; }
  if (k !== 'control' && k !== ' ' && (e.ctrlKey || e.metaKey || e.altKey)) { return; } // 不跟 Ctrl+字母 等快捷鍵打架
  if (k === ' ') { e.preventDefault(); } // 空白鍵不要捲動頁面、也不要觸發按鈕
  panKeys[k] = true; fly = null; idleHome = false; controls.autoRotate = false;
});
addEventListener('keyup', e => { const k = (e.key || '').toLowerCase(); if (k in panKeys) { panKeys[k] = false; } });
addEventListener('blur', () => { for (const k in panKeys) { panKeys[k] = false; } });
const panFwd = new THREE.Vector3(), panRight = new THREE.Vector3();
function panByKeys(dt) {
  const f = (panKeys.w ? 1 : 0) - (panKeys.s ? 1 : 0), r = (panKeys.d ? 1 : 0) - (panKeys.a ? 1 : 0);
  const u = (panKeys[' '] ? 1 : 0) - (panKeys.control ? 1 : 0);
  if (f === 0 && r === 0 && u === 0) { return; }
  panFwd.subVectors(controls.target, camera.position); panFwd.y = 0;
  if (panFwd.lengthSq() < 1e-6) { camera.getWorldDirection(panFwd); panFwd.y = 0; } // 幾乎正上方看時，改用鏡頭朝向
  panFwd.normalize(); panRight.set(-panFwd.z, 0, panFwd.x);
  const sp = Math.max(2, camera.position.distanceTo(controls.target)) * 0.9 * dt; // 離得越遠移得越快，手感跟縮放一致
  const dx = (panFwd.x * f + panRight.x * r) * sp, dz = (panFwd.z * f + panRight.z * r) * sp;
  let dy = u * sp; if (camera.position.y + dy < 0.5) { dy = Math.max(0, 0.5 - camera.position.y); } // 往下最低到水面上方一點，不鑽進海裡
  camera.position.x += dx; camera.position.z += dz; controls.target.x += dx; controls.target.z += dz;
  camera.position.y += dy; controls.target.y += dy;
  userActive();
}
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
  if (EDIT3D) { return; } // 3D 編輯模式：單擊不飛過去、不跳轉（選取與拖動在檔案最後面處理）
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
  controls.maxDistance = EDIT3D ? 3000 : overview.pos.length() * 1.15; // 不能拉得比總覽再遠太多（3D 編輯模式不限制，給很大的上限讓縮放條的刻度還能算）
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
  islands.forEach(o => { o.grp.position.y = o.pos.y + Math.sin(t * 0.8 + o.phase) * 0.04; }); // 加上島自己的高度 pos.y
  wild.forEach(o => { o.grp.position.y = Math.sin(t * 0.8 + o.phase) * 0.04; });
  UPDATERS.forEach(fn => fn(dt, t));              // 建築自己的動作（迎賓女服務員、推眼鏡的人）
  CREATURES.forEach(c => c.update(dt, t));        // 走路小人、魚、海鷗、雲與風
  if (EDIT3D === false && !fly && !idleHome && clock.elapsedTime - lastActive > IDLE_SEC) { // 閒置太久：先飛回總覽
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
  panByKeys(dt);
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

// ---------- 3D 編輯模式（維護工具的「3D 編輯模式」用 ?live=1&edit3d=1 開本頁）----------
// 左鍵點島＝選取（通知外層），按住拖動＝在 3D 地面上移動（中央主島固定）；建築會轉向中央、橋跟著重蓋；放開後才重算海水深淺
// 點島上的人物＝選取人物，出現三軸移動框（照 3D 軟體的做法）：拖箭頭＝沿單一軸移動、拖色塊＝在平面上移動（面移動）；軸向跟著建築（建築座標）
// 跟外層的溝通（postMessage）：這邊送出 e3-ready／e3-select／e3-move／e3-char／e3-cam；外層送來 e3-init／e3-select／e3-snap／e3-pos
if (EDIT3D) {
  document.body.classList.add('edit3d');
  controls.minDistance = 0.3; camera.far = 6000; camera.updateProjectionMatrix(); scene.fog.near = 6000; scene.fog.far = 8000; // 縮放距離不設限：能貼近到看清楚細節、也能拉得很遠；遠處不再被霧蓋掉
  resize(); // 上面改了距離上限，套用一次
  const send = m => { try { parent.postMessage(m, '*'); } catch (e) { /* 不是被嵌在外層頁面就略過 */ } };
  const V3 = THREE.Vector3;
  let e3Sel = -1, e3Snap = 1, e3Drag = null, e3Pick = null, e3Gd = null, e3Down = null; // e3Pick：選取的人物 { i, k, ch, main }；e3Gd：正在拖的移動框把手
  const e3Plane = new THREE.Plane(new V3(0, 1, 0), -0.5); // 島頂的高度
  const e3Ring = new THREE.Mesh(new THREE.RingGeometry(1, 1.1, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff7a00, transparent: true, opacity: 0.95, depthTest: false, fog: false }));
  e3Ring.renderOrder = 20; e3Ring.visible = false; scene.add(e3Ring);
  // 選取人物時，橘色框改成圍在人物身上（立體外框），島上的橘圈就不顯示
  const e3Box = new THREE.BoxHelper(new THREE.Object3D(), 0xff7a00); e3Box.material.depthTest = false; e3Box.material.fog = false; e3Box.renderOrder = 25; e3Box.visible = false; e3Box.frustumCulled = false; scene.add(e3Box);
  const e3Mark = () => { const o = islands[e3Sel]; e3Ring.visible = o !== undefined && (e3Pick === null || e3Pick.island === true); if (o !== undefined) { e3Ring.position.set(o.pos.x, o.pos.y + 0.6, o.pos.z); e3Ring.scale.setScalar(o.r * 1.08); } };
  const e3CamSend = () => send({ type: 'e3-cam', p: camera.position.toArray(), t: controls.target.toArray() });
  function e3Move(i, x, y, z) {
    const o = islands[i]; if (o === undefined || i === 0) { return; }
    o.pos.set(x, y, z); o.grp.position.set(x, y, z);
    if (o.isle !== true) { o.face = Math.atan2(-x, -z); o.main.rotation.y = o.face; } // 建築正面朝向中央
    e3Mark(); window.__rebuildBridges();
  }
  const e3SnapY = v => { const s = e3Snap > 0 ? Math.round(v / e3Snap) * e3Snap : Math.round(v * 10) / 10; return Math.max(-12, Math.min(12, Math.abs(s) < 0.3 ? 0 : s)); }; // 高度：靠近 0（跟主島齊平）就吸過去
  const e3Snapv = v => Math.max(-48, Math.min(48, e3Snap > 0 ? Math.round(v / e3Snap) * e3Snap : Math.round(v * 10) / 10));
  const e3Ray = ev => { mouse.set(ev.clientX / innerWidth * 2 - 1, -(ev.clientY / innerHeight) * 2 + 1); ray.setFromCamera(mouse, camera); };
  const e3Pt = ev => { e3Ray(ev); return ray.ray.intersectPlane(e3Plane, new V3()); };

  // ----- 人物的三軸移動框：紅 X、綠 Y、藍 Z 的箭頭＝單軸；XZ（綠）、XY（藍）、YZ（紅）的色塊＝面移動 -----
  const e3Gz = new THREE.Group(); e3Gz.visible = false; scene.add(e3Gz);
  const gzMat = (c, op) => new THREE.MeshBasicMaterial({ color: c, depthTest: false, transparent: true, opacity: op, fog: false, side: THREE.DoubleSide });
  const gzAdd = (parent, kind, geo, col, op) => { const m = new THREE.Mesh(geo, gzMat(col, op)); m.userData.gz = kind; m.renderOrder = 30; parent.add(m); return m; };
  [['x', 0xff3b30], ['y', 0x34c759], ['z', 0x3b82f6]].forEach(a => {
    const g = new THREE.Group(); if (a[0] === 'x') { g.rotation.z = -Math.PI / 2; } else if (a[0] === 'z') { g.rotation.x = Math.PI / 2; }
    gzAdd(g, a[0], new THREE.CylinderGeometry(0.035, 0.035, 0.8, 8).translate(0, 0.4, 0), a[1], 0.95);
    gzAdd(g, a[0], new THREE.ConeGeometry(0.12, 0.3, 14).translate(0, 0.95, 0), a[1], 0.95);
    e3Gz.add(g);
  });
  { const s = 0.3, o = 0.42;
    gzAdd(e3Gz, 'xz', new THREE.PlaneGeometry(s, s).rotateX(-Math.PI / 2).translate(o, 0, o), 0x34c759, 0.55);
    gzAdd(e3Gz, 'xy', new THREE.PlaneGeometry(s, s).translate(o, o, 0), 0x3b82f6, 0.55);
    gzAdd(e3Gz, 'yz', new THREE.PlaneGeometry(s, s).rotateY(Math.PI / 2).translate(0, o, o), 0xff3b30, 0.55); }
  UPDATERS.push(() => { // 每幀把移動框放在選取的人物身上，大小固定（不隨距離變）；建築轉向時軸向跟著轉
    if (e3Pick !== null && e3Pick.island !== true) { e3Box.visible = true; e3Box.setFromObject(e3Pick.ch); } else { e3Box.visible = false; } // 人物的橘色外框跟著人物
    if (e3Pick === null) { e3Gz.visible = false; return; }
    e3Gz.visible = true;
    if (e3Pick.island === true) { const o = islands[e3Pick.i]; e3Gz.position.set(o.pos.x, o.pos.y + 0.5, o.pos.z); e3Gz.quaternion.identity(); } // 島嶼：移動框在島頂中央，軸向是世界座標
    else { e3Pick.ch.getWorldPosition(e3Gz.position); e3Pick.main.getWorldQuaternion(e3Gz.quaternion); }
    e3Gz.scale.setScalar(Math.max(0.25, camera.position.distanceTo(e3Gz.position) * 0.1));
  });
  function lineT(O, dir, r) { // 軸線（O + t*dir）跟視線最接近的位置 t
    const w0 = O.clone().sub(r.origin), b = dir.dot(r.direction), d = dir.dot(w0), e = r.direction.dot(w0), den = 1 - b * b;
    return Math.abs(den) < 1e-6 ? 0 : (b * e - d) / den;
  }
  function gzStart(kind, ev) {
    const isl = e3Pick.island === true, main = e3Pick.main; if (isl === false) { main.updateWorldMatrix(true, false); }
    const O = isl ? e3Gz.position.clone() : e3Pick.ch.getWorldPosition(new V3()), q = isl ? new THREE.Quaternion() : main.getWorldQuaternion(new THREE.Quaternion()), B = { x: new V3(1, 0, 0).applyQuaternion(q), y: new V3(0, 1, 0).applyQuaternion(q), z: new V3(0, 0, 1).applyQuaternion(q) };
    e3Ray(ev);
    if (kind.length === 1) { e3Gd = { kind, O, B, t0: lineT(O, B[kind], ray.ray) }; }
    else { const nm = 'xyz'.replace(kind[0], '').replace(kind[1], ''), pl = new THREE.Plane().setFromNormalAndCoplanarPoint(B[nm], O); e3Gd = { kind, O, B, pl, hit0: ray.ray.intersectPlane(pl, new V3()) || O.clone() }; }
    controls.enabled = false;
  }
  function gzDrag(ev) {
    e3Ray(ev); const g = e3Gd; let w;
    if (g.kind.length === 1) { w = g.O.clone().addScaledVector(g.B[g.kind], lineT(g.O, g.B[g.kind], ray.ray) - g.t0); }
    else { const h = ray.ray.intersectPlane(g.pl, new V3()); if (h === null) { return; } w = g.O.clone().add(h.sub(g.hit0)); }
    if (e3Pick.island === true) { // 島嶼：世界座標移動；X、Z 照「吸附」格數，高度 Y 靠近 0 會吸到跟主島齊平
      const o = islands[e3Pick.i], x = g.kind.indexOf('x') >= 0 ? e3Snapv(w.x) : o.pos.x, y = g.kind.indexOf('y') >= 0 ? e3SnapY(w.y - 0.5) : o.pos.y, z = g.kind.indexOf('z') >= 0 ? e3Snapv(w.z) : o.pos.z;
      if (x !== o.pos.x || y !== o.pos.y || z !== o.pos.z) { e3Move(e3Pick.i, x, y, z); send({ type: 'e3-move', i: e3Pick.i, x, y, z, done: false }); }
      return;
    }
    e3Pick.main.updateWorldMatrix(true, false); const lp = e3Pick.main.worldToLocal(w), p = e3Pick.ch.position, r1 = v => Math.round(v * 10) / 10;
    let ch = false;
    ['x', 'y', 'z'].forEach(a => { if (g.kind.indexOf(a) >= 0 && r1(lp[a]) !== p[a]) { p[a] = r1(lp[a]); ch = true; } });
    if (ch) { send({ type: 'e3-char', i: e3Pick.i, k: e3Pick.k, x: p.x, y: p.y, z: p.z }); }
  }

  canvas.addEventListener('pointerdown', ev => {
    if (ev.button !== 0) { return; }
    if (e3Pick !== null) { // 先看有沒有按到移動框
      e3Ray(ev); const gh = ray.intersectObject(e3Gz, true)[0];
      if (gh !== undefined && gh.object.userData.gz !== undefined) { ev.stopImmediatePropagation(); gzStart(gh.object.userData.gz, ev); try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* 沒有可捕捉的指標時略過 */ } return; }
    }
    e3Ray(ev);
    const h = ray.intersectObjects(clickable, false)[0];
    if (h === undefined) { e3Down = [ev.clientX, ev.clientY]; return; } // 點空白處：照常轉視角；放開時如果幾乎沒動，就取消人物選取
    const i = h.object.userData.idx; e3Sel = i; e3Mark(); send({ type: 'e3-select', i });
    ev.stopImmediatePropagation(); // 點到島：不要同時轉動鏡頭
    let cn = h.object; while (cn !== null && cn.userData.charIdx === undefined) { cn = cn.parent; } // 點到的是不是島上人物（island.js 蓋人物時有標 charIdx）
    if (cn !== null) { e3Pick = { i, k: cn.userData.charIdx, ch: cn, main: islands[i].main }; e3Mark(); return; } // 選取人物：出現移動框，不能直接拖人物本體
    e3Pick = i === 0 ? null : { i, island: true }; e3Mark(); // 選取島嶼：只是選取、出現三軸移動框（中央主島固定，沒有）；要移動得拖移動框，點到島身不會直接開始拖
  }, true);
  canvas.addEventListener('pointermove', ev => {
    if (e3Gd !== null) { gzDrag(ev); return; }
    if (e3Drag === null) { return; }
    const pt = e3Pt(ev); if (pt === null) { return; }
    const x = e3Snapv(pt.x + e3Drag.ox), z = e3Snapv(pt.z + e3Drag.oz); if (x === e3Drag.x && z === e3Drag.z) { return; }
    e3Drag.x = x; e3Drag.z = z; e3Move(e3Drag.i, x, e3Drag.y, z); send({ type: 'e3-move', i: e3Drag.i, x, y: e3Drag.y, z, done: false });
  });
  const e3End = ev => {
    if (e3Down !== null) { if (Math.hypot(ev.clientX - e3Down[0], ev.clientY - e3Down[1]) < 5) { e3Pick = null; e3Mark(); } e3Down = null; }
    if (e3Gd !== null) { // 放開移動框：島嶼要重算海水深淺、通知外層這次拖完了
      e3Gd = null; controls.enabled = true;
      if (e3Pick !== null && e3Pick.island === true) { const o = islands[e3Pick.i]; initSea(); send({ type: 'e3-move', i: e3Pick.i, x: o.pos.x, y: o.pos.y, z: o.pos.z, done: true }); }
      return;
    }
    if (e3Drag === null) { return; } const d = e3Drag; e3Drag = null; controls.enabled = true; initSea(); send({ type: 'e3-move', i: d.i, x: d.x, y: d.y, z: d.z, done: true });
  };
  canvas.addEventListener('pointerup', e3End); canvas.addEventListener('pointercancel', e3End);
  controls.addEventListener('end', e3CamSend);
  addEventListener('message', ev => {
    const m = ev.data; if (m === null || typeof m !== 'object') { return; }
    if (m.type === 'e3-init') { e3Sel = m.sel; e3Snap = +m.snap; e3Mark(); }
    else if (m.type === 'e3-select') { e3Sel = m.i; if (e3Pick === null || e3Pick.i !== m.i) { e3Pick = m.i > 0 ? { i: m.i, island: true } : null; } e3Mark(); } // 外層選了別座島：換成那座島的移動框
    else if (m.type === 'e3-snap') { e3Snap = +m.v; }
    else if (m.type === 'e3-pos') { e3Move(m.i, m.x, m.y, m.z); initSea(); }
  });
  const cam0 = window.__EDIT3D_CAM; // 外層重新載入本頁時帶過來的鏡頭位置（改大小、外形等需要整個重畫的時候，視角不會跳掉）
  if (cam0 && Array.isArray(cam0.p) && Array.isArray(cam0.t)) { camera.position.fromArray(cam0.p); controls.target.fromArray(cam0.t); controls.update(); }
  window.__e3 = { gz: e3Gz, pick: () => e3Pick }; // 除錯／自動檢查用
  send({ type: 'e3-ready' });
}
