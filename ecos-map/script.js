import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import BingMaps from 'ol/source/BingMaps';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GPX from 'ol/format/GPX';
import KML from 'ol/format/KML';
import { Style, Stroke, Circle, Fill } from 'ol/style';
import { LineString, Polygon } from 'ol/geom';

// Create map layers
const osmLayer = new TileLayer({
    source: new OSM(),
    visible: true
});

const bingLayer = new TileLayer({
    source: new BingMaps({
        key: 'Your Bing Maps API Key Here',
        imagerySet: 'Aerial'
    }),
    visible: false
});

// Create the map
const map = new Map({
    target: 'map',
    layers: [osmLayer, bingLayer],
    view: new View({
        center: [0, 0],
        zoom: 2
    })
});

// Layer toggle functionality
document.getElementById('osmLayer').addEventListener('change', function () {
    osmLayer.setVisible(this.checked);
});

document.getElementById('bingLayer').addEventListener('change', function () {
    bingLayer.setVisible(this.checked);
});

// Store GPX layers
const gpxLayers = [];

// Handle GPX file input
document.getElementById('gpxFile').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        const fname = file.name;
        reader.onload = function (e) {
            const fileData = e.target.result;
            var fileFormat = null;
            if (fname.endsWith('.gpx')) {
                fileFormat = new GPX();
            }
            else {
                fileFormat = new KML();
            }
            const features = fileFormat.readFeatures(fileData, {
                featureProjection: 'EPSG:3857'
            });

            const vectorSource = new VectorSource({
                features: features
            });

            const vectorLayer = new VectorLayer({
                source: vectorSource,
                style: new Style({
                    stroke: new Stroke({
                        color: '#0000ff',
                        width: 2
                    })
                })
            });

            map.addLayer(vectorLayer);
            gpxLayers.push(vectorLayer);

            // Add the GPX layer to the menu
            const gpxLayersDiv = document.getElementById('gpxLayers');
            const layerId = `gpxLayer${gpxLayers.length}`;
            const layerLabel = document.createElement('label');
            const layerCheckbox = document.createElement('input');
            layerCheckbox.type = 'checkbox';
            layerCheckbox.id = layerId;
            layerCheckbox.checked = true;
            layerCheckbox.addEventListener('change', function () {
                vectorLayer.setVisible(this.checked);
            });
            layerLabel.appendChild(layerCheckbox);
            layerLabel.appendChild(document.createTextNode(` GPX Layer ${e.target.fileName}`));
            gpxLayersDiv.appendChild(layerLabel);
            gpxLayersDiv.appendChild(document.createElement('br'));

            // Add layer to style editor select
            const layerSelect = document.getElementById('layerSelect');
            const layerOption = document.createElement('option');
            layerOption.value = gpxLayers.length - 1;
            layerOption.text = `GPX Layer ${gpxLayers.length}`;
            layerSelect.appendChild(layerOption);

            map.getView().fit(vectorSource.getExtent(), { padding: [50, 50, 50, 50] });
        };
        reader.readAsText(file);
    }
});

// Apply custom style to selected layer
document.getElementById('applyStyle').addEventListener('click', function () {
    const selectedLayerIndex = document.getElementById('layerSelect').value;
    const strokeColor = document.getElementById('strokeColor').value;
    const strokeWidth = parseInt(document.getElementById('strokeWidth').value, 10);
    const newStyle = new Style({
        // stroke: new Stroke({
        //     color: strokeColor,
        //     width: strokeWidth
        // }),
        lineString: new LineString({
            color: strokeColor,
            width: strokeWidth
        }),
        // polygon: new Polygon({
        //     color: strokeColor,
        //     width: strokeWidth
        // }),
        // circle: new Circle({
        //     color: strokeColor,
        //     width: strokeWidth
        // })
    });
    gpxLayers[selectedLayerIndex].setStyle(newStyle);
});
