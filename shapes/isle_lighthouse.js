(function () {
  'use strict';
  // 建築（小島型）：燈塔島（小島中央一座燈塔，少量植物全部放在燈塔左邊）
  // 小島型建築（isle: true）= 本身就是一座小島：島的半徑預設 2.5、不會轉向中央、植物用自然散布（不是一般島的種樹規則），標籤可以不顯示（title 留空）
  // 本檔案自成一體：燈塔零件只放在這裡，不和其他建築共用

  // 零件：燈塔（原點在塔底中心，縮放後約 3 高）
  function lighthouseMesh() {
    const g = new THREE.Group();
    g.add(cylM(0.75, 1.05, 3.2, 0xfff1d6, 0, 1.6, 0));
    g.add(cylM(0.82, 0.92, 0.55, 0xc4503a, 0, 1.0, 0)); g.add(cylM(0.72, 0.8, 0.55, 0xc4503a, 0, 2.3, 0));
    g.add(cylM(0.9, 0.9, 0.08, 0x3a3a3a, 0, 3.22, 0, 14));
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 10), new THREE.MeshBasicMaterial({ color: 0xffe27a })); lamp.position.y = 3.5; g.add(lamp);
    g.add(mk(new THREE.ConeGeometry(0.85, 0.9, 10), 0xc4503a, 0, 4.2, 0));
    g.scale.setScalar(0.6); return g;
  }

  // 小島型建築的額外欄位：
  //   isle: true      ：宣告這是小島型建築
  //   baseR           ：小島半徑（縮放 1 倍時），預設 2.5；之後用資料的 scale 放大縮小
  //   sparse          ：true = 有擺設的小島，島上只放 2 株植物（石頭縮小）；false = 依半徑自動散布較多植物
  //   build(color, ctx)：回傳放在島中央的擺設 THREE.Group（原點在島中心的草地面；小島不轉向，+z 朝向觀看者）
  //   arrange(plants) ：選填；拿到島上的樹／棕櫚／灌木（不含石頭）的清單，可以重新擺位置（高度請設 0.5）
  (window.ISLAND_SHAPES = window.ISLAND_SHAPES || {}).isle_lighthouse = {
    label: '燈塔島',
    desc: '小島型：小島中央一座燈塔，少量植物放在燈塔左邊',
    themed: false, isle: true, baseR: 2.5, sparse: true,
    build(color, ctx) { return lighthouseMesh(); },
    arrange(plants) { // 植物全部放到燈塔左邊（從正面看的左側）
      plants.forEach((ch, n) => { ch.position.set(-1.3 - (n % 2) * 0.1, 0.5, 0.35 - n * 1.0); });
    }
  };
})();
