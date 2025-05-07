require([
  "esri/Map",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/layers/GraphicsLayer"
], function (Map, MapView, Graphic, GraphicsLayer) {

  // 建立地圖與底圖（可選 dark-gray-vector）
  const map = new Map({
    basemap: "dark-gray-vector"
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [121.5, 25.03],  // 台灣中部
    zoom: 8
  });

  const graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);

  // 載入 CSV 資料（需配合本機伺服器或 GitHub Pages）
  fetch("data/social_housing.csv")
    .then(response => response.text())
    .then(text => {
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",");
      const data = lines.slice(1).map(line => {
        const parts = line.split(",");
        const obj = {};
        headers.forEach((h, i) => obj[h.trim()] = parts[i]);
        return obj;
      });

      data.forEach(d => {
        const lat = parseFloat(d["Latitude"]);
        const lng = parseFloat(d["Longitude"]);
        const name = d["案名"];
        const address = d["地址"];

        if (!isNaN(lat) && !isNaN(lng)) {
          const point = {
            type: "point",
            latitude: lat,
            longitude: lng
          };

          const symbol = {
            type: "simple-marker",
            color: "orange",
            size: 8
          };

          const popupTemplate = {
            title: name,
            content: address
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
