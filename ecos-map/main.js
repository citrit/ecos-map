import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';


const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});


window.onload = function () {
  var defaultStyle = {
    'Point': new ol.style.Style({
      image: new ol.style.Circle({
        fill: new ol.style.Fill({
          color: 'rgba(255,255,0,0.5)'
        }),
        radius: 5,
        stroke: new ol.style.Stroke({
          color: '#ff0',
          width: 1
        })
      })
    }),
    'LineString': new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#f00',
        width: 3
      })
    }),
    'Polygon': new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(0,255,255,0.5)'
      }),
      stroke: new ol.style.Stroke({
        color: '#0ff',
        width: 1
      })
    }),
    'MultiPoint': new ol.style.Style({
      image: new ol.style.Circle({
        fill: new ol.style.Fill({
          color: 'rgba(255,0,255,0.5)'
        }),
        radius: 5,
        stroke: new ol.style.Stroke({
          color: '#f0f',
          width: 1
        })
      })
    }),
    'MultiLineString': new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#00f',
        width: 3
      })
    }),
    'MultiPolygon': new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(25,120,255,0.5)'
      }),
      stroke: new ol.style.Stroke({
        color: '#00f',
        width: 1
      })
    })
  };

  var styleFunction = function (feature, resolution) {
    var featureStyleFunction = feature.getStyleFunction();
    if (featureStyleFunction) {
      return featureStyleFunction.call(feature, resolution);
    } else {
      return defaultStyle[feature.getGeometry().getType()];
    }
  };
  var vector1 = new ol.layer.Vector({
    source: new ol.source.Vector({
      url: 'trails/ECOS_mapping_preride.gpx',
      format: new ol.format.GPX()
    }),
    style: defaultStyle
  });

  map.addLayer(new ol.layer.Vector({
    renderMode: 'image',
    source: vector1,
    style: styleFunction
  }));
}