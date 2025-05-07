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
    center: [121.5, 25.03],  // 台灣中部
    zoom: 8
  });

  const graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);

  // ✅ 使用 d3.csv() 直接載入 CSV
  d3.csv("data/social_housing.csv").then(function(data) {
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
