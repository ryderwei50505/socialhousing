// ✅ 定義台灣民國年轉換函式
function parseTaiwanDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10) + 1911;
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

require([
  "esri/Map",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/layers/GraphicsLayer"
], function (Map, MapView, Graphic, GraphicsLayer) {

  const map = new Map({
    basemap: "dark-gray-vector"
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [121.5, 25.03], // 台灣中心點
    zoom: 8
  });

  const graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);

  d3.csv("data/social_housing.csv").then(function(data) {
    const today = new Date();

    data.forEach(d => {
      const lat = parseFloat(d["Latitude"]);
      const lng = parseFloat(d["Longitude"]);
      const startDate = parseTaiwanDate(d["動工日期"]);
      const endDate = parseTaiwanDate(d["(預計)完工日期"]);

      // ✅ 判斷施工狀態
      let status = "規劃中";
      if (startDate && today >= startDate) {
        if (endDate && today >= endDate) {
          status = "已完工";
        } else {
          status = "施工中";
        }
      }

      // ✅ 對應顏色
      let color = "white";
      if (status === "施工中") color = "orange";
      if (status === "已完工") color = "green";

      if (!isNaN(lat) && !isNaN(lng)) {
        const point = {
          type: "point",
          latitude: lat,
          longitude: lng
        };

        const symbol = {
          type: "simple-marker",
          style: "circle",
          color: color,
          size: 12,
          outline: {
            color: "black",
            width: 1
          }
        };

        const popupTemplate = {
          title: d["案名"],
          content: `
            <b>地址：</b>${d["地址"]}<br>
            <b>樓數：</b>${d["棟數"] || "－"} 樓<br>
            <b>戶數：</b>${d["戶數"] || "－"} 戶<br>
            <b>動工日期：</b>${d["動工日期"] || "－"}<br>
            <b>(預計)完工日期：</b>${d["(預計)完工日期"] || "－"}<br>
            <b>施工狀態：</b>${status || "－"}<br>
          `
        };

        const graphic = new Graphic({
          geometry: point,
          symbol: symbol,
          popupTemplate: popupTemplate
        });

        graphicsLayer.add(graphic);
      }
    });
  });
});
