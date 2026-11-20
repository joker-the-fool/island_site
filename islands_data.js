// 島嶼資料：直接改這個檔案即可（不需要任何轉換步驟，也可以用 maintain_tool.html 編輯）
// id      ：英文代號，網址帶 #id 可直接飛到該島（例如 index.html#cinema）
// title   ：島上標籤顯示的名稱
// desc    ：說明文字（目前畫面沒用到，先保留）
// link    ：跳轉頁面（目前畫面沒用到，先保留）
// color   ：島的主題色
// shape   ：島上的建築，必須是 index.html 的 mainBuilding() 有的類型：
//           mall 商場 / reception 服務台 / toy 玩具店 / server 伺服器機櫃 / pavilion 涼亭 /
//           cinema 電影院 / crystal 小屋加水晶 / fashion 服飾店 / tower 燈塔 / house 小鎮
// x, z    ：島中心在平面圖上的位置（場景單位；中央主島固定在 0, 0，x 往右、z 往下，一座島的半徑約 5）；沒填就用內建的預設位置
// bridges ：用木橋相連的島（填對方的 id；兩邊都列，互相對稱，只會蓋一座橋）
// characters：這座島上的人物，每個 { "type": 人物名稱, "x", "y", "z": 相對於建築的位置（+z 是建築正面）, "ry": 面向角度（度） }；人物種類見 characters*.js
// scale   ：這座島整體的放大縮小倍率（選填，預設 1；島、建築、樹、人物一起縮放）
// seed    ：選填；島形與植物散布的亂數種子。沒填就依這座島在清單裡的順序自動算（調整順序外形會變）；填了就固定，不受順序影響
// title 留空：不顯示這座島的標籤（編號與名稱都不顯示；副島預設這樣）
// 檔案最後的 window.ISLAND_THEME：網頁外觀（維護工具的「網頁外觀」設定）。title／subtitle 左上角標題與副標題文字（留空就隱藏）、font 字型（空白＝預設；顯示網頁的機器要有安裝這個字型才會生效）、titleColor／subtitleColor 文字顏色、primary 主配色（「全部小島」按鈕、縮放條、頂端橫條）、secondary 副配色（縮放條的＋－按鈕、島嶼標籤的編號徽章）
// 順序即編號：第 1 個是中央主島，其餘依序放在四周
window.ISLANDS = [
  { "id": "mall", "title": "福華大飯店", "desc": "", "link": "pages/data.html", "color": "#c4503a", "shape": "mall", "x": 0, "z": 0, "bridges": ["service", "leisure", "professional", "excellence", "entertainment", "prestige", "trend"], "characters": [] },
  { "id": "service", "title": "服務", "desc": "", "link": "", "color": "#6f9bc4", "shape": "reception", "x": -11.9, "z": -15.9, "bridges": ["mall"], "characters": [] },
  { "id": "leisure", "title": "休閒", "desc": "", "link": "", "color": "#e0a040", "shape": "toy", "x": 17.8, "z": -8.8, "bridges": ["mall", "professional", "trend"], "characters": [] },
  { "id": "professional", "title": "專業", "desc": "", "link": "", "color": "#7a9f5a", "shape": "server", "x": 14.9, "z": 9.1, "bridges": ["mall", "leisure", "excellence", "isle_nature1", "isle_nature2"], "characters": [{"type":"serverman", "x":-0.9, "y":0.1, "z":1.9, "ry":0}] },
  { "id": "excellence", "title": "卓越", "desc": "", "link": "", "color": "#b86f9c", "shape": "pavilion", "x": 0.7, "z": 18.4, "bridges": ["mall", "professional"], "characters": [] },
  { "id": "entertainment", "title": "娛樂", "desc": "", "link": "", "color": "#d9744a", "shape": "cinema", "x": -13.9, "z": 10.9, "bridges": ["mall", "prestige", "isle_lighthouse", "isle_pool"], "characters": [] },
  { "id": "prestige", "title": "尊榮", "desc": "", "link": "", "color": "#5aa0a8", "shape": "crystal", "x": -18, "z": -5, "bridges": ["mall", "entertainment"], "characters": [{"type":"hostess", "x":0, "y":0, "z":1.7, "ry":0}] },
  { "id": "trend", "title": "潮流", "desc": "", "link": "", "color": "#8a6fc4", "shape": "fashion", "x": 5.9, "z": -20.6, "bridges": ["mall", "leisure"], "characters": [] },
  { "id": "isle_lighthouse", "title": "", "desc": "", "link": "", "color": "#6fbf73", "shape": "isle_lighthouse", "x": -23.3, "z": 13.8, "scale": 0.88, "seed": 90, "bridges": ["entertainment"], "characters": [] },
  { "id": "isle_pool", "title": "", "desc": "", "link": "", "color": "#6fbf73", "shape": "isle_pool", "x": -15.3, "z": 20.7, "scale": 1.08, "seed": 91, "bridges": ["entertainment"], "characters": [] },
  { "id": "isle_nature1", "title": "", "desc": "", "link": "", "color": "#6fbf73", "shape": "isle_nature", "x": 20.3, "z": 18.5, "scale": 0.88, "seed": 92, "bridges": ["professional"], "characters": [] },
  { "id": "isle_nature2", "title": "", "desc": "", "link": "", "color": "#6fbf73", "shape": "isle_nature", "x": 27.4, "z": 12.2, "scale": 1.08, "seed": 93, "bridges": ["professional"], "characters": [] }
];

window.ISLAND_THEME = {
  "title": "福華名品",
  "subtitle": "真誠福華心，服務最用心",
  "font": "",
  "titleColor": "#222222",
  "subtitleColor": "#777777",
  "primary": "#af272f",
  "secondary": "#af272f"
};
