(function () {
  'use strict';
  // 建築（小島型）：自然小島（只有樹、棕櫚、灌木、岩石，系統依島的大小自動散布；沒有任何擺設）
  // 小島型建築的欄位說明見 shapes\isle_lighthouse.js；沒有 arrange，植物位置由系統決定
  (window.ISLAND_SHAPES = window.ISLAND_SHAPES || {}).isle_nature = {
    label: '自然小島',
    desc: '小島型：只有樹、棕櫚、灌木、岩石，依島的大小自動散布',
    themed: false, isle: true, baseR: 2.5, sparse: false,
    build(color, ctx) { return new THREE.Group(); } // 沒有擺設
  };
})();
