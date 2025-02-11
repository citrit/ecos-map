import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import BingMaps from 'ol/source/BingMaps';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GPX from 'ol/format/GPX';
import KML from 'ol/format/KML';
import { Style, Stroke, Circle, Fill } from 'ol/style';
import Overlay from 'ol/Overlay.js';
import { toLonLat } from 'ol/proj.js';
import { toStringHDMS } from 'ol/coordinate.js';
import Select from 'ol/interaction/Select.js';
import { altKeyOnly, click, pointerMove } from 'ol/events/condition.js';

/**
 * Elements that make up the popup.
 */
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

/**
 * Create an overlay to anchor the popup to the map.
 */
const overlay = new Overlay({
    element: container,
    autoPan: {
        animation: {
            duration: 250,
        },
    },
});

/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

// Create map layers
const osmLayer = new TileLayer({
    source: new OSM(),
    visible: true
});

const images = new TileLayer({ 
    source: new XYZ({ crossOrigin: null, urls: ['https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}'] }), 
    visible: false 
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
    layers: [osmLayer, images],
    overlays: [overlay],
    view: new View({
        center: [0, 0],
        zoom: 2
    })
});

// Layer toggle functionality
document.getElementById('osmLayer').addEventListener('change', function () {
    osmLayer.setVisible(this.checked);
});

document.getElementById('images').addEventListener('change', function () {
    images.setVisible(this.checked);
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
            layerLabel.appendChild(document.createTextNode(fname));
            gpxLayersDiv.appendChild(layerLabel);
            gpxLayersDiv.appendChild(document.createElement('br'));

            // Add layer to style editor select
            const layerSelect = document.getElementById('layerSelect');
            const layerOption = document.createElement('option');
            layerOption.value = gpxLayers.length - 1;
            layerOption.text = fname;
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
        stroke: new Stroke({
            color: strokeColor,
            width: strokeWidth
        })
    });
    gpxLayers[selectedLayerIndex].setStyle(newStyle);
});

/**
 * Add a click handler to the map to render the popup.
 */
// map.on('singleclick', function (evt) {
//     const coordinate = evt.coordinate;
//     const hdms = toStringHDMS(toLonLat(coordinate));

//     content.innerHTML = '<p>You clicked here:</p><code>' + hdms + '</code>';
//     overlay.setPosition(coordinate);
// });

// Select stuff
//
let select = null; // ref to currently selected interaction

const selected = new Style({
    fill: new Fill({
        color: '#eeeeee',
    }),
    stroke: new Stroke({
        color: 'rgba(13, 12, 12, 0.7)',
        width: 5,
        lineDash: [4, 8],
        lineDashOffset: 6
    }),
});

function selectStyle(feature) {
    const color = feature.get('COLOR') || '#eeeeee';
    selected.getFill().setColor(color);
    return selected;
}

// select interaction working on "click"
const selectClick = new Select({
    condition: click,
    style: selectStyle,
});

map.addInteraction(selectClick);
selectClick.on('select', function (e) {
    if (e.selected.length > 0) {
        var coord = e.mapBrowserEvent.coordinate;
        const msg =
            '&nbsp;' +
            e.target.getFeatures().getLength() +
            ' selected features (last operation selected ' +
            e.selected.length +
            ' and deselected ' +
            e.deselected.length +
            ' features)';
        document.getElementById('status').innerHTML = msg;
        //content.innerHTML = `<p>Selected features: </p><code> ${msg} </code>`;

        var selectedFeature = e.selected[0]; // Get the first selected feature (if any)

        content.innerHTML = '';
        if (selectedFeature) {
            var props = selectedFeature.getProperties();
            for (var propertyName in props) {
                switch (propertyName) {
                    case "geometry":
                        break;
                    case "name":
                        content.innerHTML += `<br><b>Name: ${props[propertyName]}</b><br>`;
                        break;
                    default:
                        content.innerHTML += `<br>${propertyName}: ${props[propertyName]}`;
                        break;

                }
            }; // Access feature properties
        }

        overlay.setPosition(coord);
    }
    else {
        closer.onclick();
    }
});