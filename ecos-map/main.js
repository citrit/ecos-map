import './style.css';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import GPX from 'ol/format/GPX.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import VectorSource from 'ol/source/Vector.js';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';
import GroupLayer from 'ol/layer/Group';
import Google from 'ol/source/Google';
import { defaults as defaultControls} from 'ol/control.js';
import {extend} from 'ol/extent';
import {createEmpty} from 'ol/extent';

const gpxFiles = ["ECOS_mapping_preride.gpx", "ECOS_nature_guide_data_collection.gpx", "Gravel_river_loop.gpx","fells_loop.gpx"];

const style = {
  'Point': new Style({
    image: new CircleStyle({
      fill: new Fill({
        color: 'rgba(255,255,0,0.4)',
      }),
      radius: 5,
      stroke: new Stroke({
        color: '#ff0',
        width: 1,
      }),
    }),
  }),
  'LineString': new Style({
    stroke: new Stroke({
      color: '#f00',
      width: 5,
    }),
  }),
  'MultiLineString': new Style({
    stroke: new Stroke({
      color: 'red',
      width: 5,
    }),
  }),
};

const gpxLayers = new GroupLayer({
  layers: [],
  name: 'gpxGroup'
})
;
const map = new Map({
  target: 'map',
  //controls: defaultControls().extend([new SwitchLayerControl({}, gpxFiles)]),
  layers: [
    gpxLayers,
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: [0,0],
    zoom: 12,
  }),
});

var ext = createEmpty();

gpxFiles.forEach((gpxName) => {
  var lay = new VectorLayer({
    source: new VectorSource({
      url: "./trails/"+gpxName,
      format: new GPX(),
    }),
    style: function (feature) {
      return style[feature.getGeometry().getType()];
    },
  });
  lay.getSource().getFormat().readFeatures();
  gpxLayers.getLayers().push(lay);
  extend(ext, lay.getSource().getExtent());
});
//map.getView().fit(ext, map.getSize());
