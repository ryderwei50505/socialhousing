require([
  "esri/Map",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/layers/GraphicsLayer"
], function (Map, MapView, Graphic, GraphicsLayer) {

  // 使用 ESRI 提供的暗色底圖
  const map = new Map({
    basemap: "dark-gray-vector"
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [121.5637, 25.0375], // 台北
    zoom: 14
  });

  const graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);

  // 載入 youbike.csv（需 local server 支援）
  fetch("data/youbike.csv")
    .then(response => response.text())
    .then(text => {
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",");
      const data = lines.slice(1).map(line => {
        const parts = line.split(",");
        const obj = {};
        headers.forEach((h, i) => obj[h] = parts[i]);
        return obj;
      });

      // 動畫播放
      let i = 0;
      const delay = 800;

      const interval = setInterval(() => {
        if (i >= data.length) {
          clearInterval(interval);
          return;
        }

        const d = data[i];
        const start = {
          type: "point",
          longitude: +d.start_lng,
          latitude: +d.start_lat
        };
        const end = {
          type: "point",
          longitude: +d.end_lng,
          latitude: +d.end_lat
        };

        const startSymbol = {
          type: "simple-marker",
          color: "cyan",
          size: "8px"
        };

        const endSymbol = {
          type: "simple-marker",
          color: "yellow",
          size: "8px"
        };

        const lineSymbol = {
          type: "simple-line",
          color: [200, 200, 255],
          width: 2
        };
        graphicsLayer.add(new Graphic({ geometry: start, symbol: startSymbol }));
        graphicsLayer.add(new Graphic({ geometry: end, symbol: endSymbol }));

        graphicsLayer.add(new Graphic({
          geometry: {
            type: "polyline",
            paths: [[start.longitude, start.latitude], [end.longitude, end.latitude]]
          },
          symbol: lineSymbol
        }));

        i++;
      }, delay);
    });
});
