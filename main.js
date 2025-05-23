const baseYear = 2016;
let currentIndex = 118; // 2025/10
let playing = false;
let timer = null;
let allData = [];
let graphicsLayer;
let activeFilters = new Set(["規劃中", "施工中", "已完工"]);

function parseTaiwanDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10) + 1911;
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

function indexToDate(idx) {
  return new Date(baseYear, idx);
}

function formatDate(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function updateGraphics(simDate) {
  graphicsLayer.removeAll();
  let count = { "規劃中": 0, "施工中": 0, "已完工": 0 };

  allData.forEach(d => {
    const lat = parseFloat(d["Latitude"]);
    const lng = parseFloat(d["Longitude"]);
    const startDate = parseTaiwanDate(d["動工日期"]);
    const endDate = parseTaiwanDate(d["(預計)完工日期"]);

    let status = "規劃中";
    if (startDate && simDate >= startDate) {
      if (endDate && simDate >= endDate) {
        status = "已完工";
      } else {
        status = "施工中";
      }
    }

    count[status]++;

    if (!activeFilters.has(status)) return;
    if (isNaN(lat) || isNaN(lng)) return;

    const point = {
      type: "point",
      latitude: lat,
      longitude: lng
    };

    const colorMap = {
      "規劃中": "white",
      "施工中": "orange",
      "已完工": "green"
    };

    const symbol = {
      type: "simple-marker",
      style: "circle",
      color: colorMap[status],
      size: 12,
      outline: { color: "black", width: 1 }
    };

    const popupTemplate = {
      title: d["案名"],
      content: `
        <b>地址：</b>${d["地址"]}<br>
        <b>樓數：</b>${d["棟數"] || "－"} 樓<br>
        <b>戶數：</b>${d["戶數"] || "－"} 戶<br>
        <b>動工日期：</b>${d["動工日期"] || "－"}<br>
        <b>(預計)完工日期：</b>${d["(預計)完工日期"] || "－"}<br>
        <b>施工狀態：</b>${status}<br>
      `
    };

    const graphic = new __esri.Graphic({
      geometry: point,
      symbol,
      popupTemplate
    });

    graphicsLayer.add(graphic);
  });

  // 更新統計數字
  document.getElementById("countPlanning").textContent = count["規劃中"];
  document.getElementById("countBuilding").textContent = count["施工中"];
  document.getElementById("countFinished").textContent = count["已完工"];
}

function stepTime() {
  if (currentIndex < 118) {
    currentIndex++;
  } else {
    currentIndex = 0; // ⏮ 自動從頭開始
  }
  document.getElementById("timeSlider").value = currentIndex;
  const simDate = indexToDate(currentIndex);
  document.getElementById("currentDate").textContent = formatDate(simDate);
  updateGraphics(simDate);
}

require([
  "esri/Map",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/layers/GraphicsLayer"
], function (Map, MapView, Graphic, GraphicsLayerConstructor) {
  window.__esri = { Graphic };

  const map = new Map({ basemap: "dark-gray-vector" });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [121.5, 25.03],
    zoom: 8
  });

  graphicsLayer = new GraphicsLayerConstructor();
  map.add(graphicsLayer);

  d3.csv("data/social_housing.csv").then(function (data) {
    allData = data;
    const simDate = indexToDate(currentIndex);
    document.getElementById("currentDate").textContent = formatDate(simDate);
    updateGraphics(simDate);
  });

  // 時間軸拖曳
  document.getElementById("timeSlider").addEventListener("input", e => {
    currentIndex = parseInt(e.target.value);
    const simDate = indexToDate(currentIndex);
    document.getElementById("currentDate").textContent = formatDate(simDate);
    updateGraphics(simDate);
  });

  // 播放／暫停
  document.getElementById("playBtn").addEventListener("click", () => {
    if (!playing) {
      playing = true;
      timer = setInterval(stepTime, 800);
      document.getElementById("playBtn").textContent = "⏸ 暫停";
    } else {
      clearInterval(timer);
      playing = false;
      document.getElementById("playBtn").textContent = "▶ 播放";
    }
  });

  // 狀態篩選按鈕
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const status = btn.getAttribute("data-status");
      if (activeFilters.has(status)) {
        activeFilters.delete(status);
        btn.classList.remove("active");
      } else {
        activeFilters.add(status);
        btn.classList.add("active");
      }
      updateGraphics(indexToDate(currentIndex));
    });
  });
});
