import 'ol/ol.css';
import {fromLonLat} from 'ol/proj';
import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer } from 'ol/layer';
import OSM from 'ol/source/OSM';
import { GPX } from 'ol/format';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';

const gpxFiles = ["ECOS_mapping_preride.gpx", "ECOS_nature_guide_data_collection.gpx", "Gravel_river_loop.gpx", "fells_loop.gpx"];

// Function to generate random colors
function getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

// Function to generate a random style
function generateRandomStyle() {
    return new Style({
        stroke: new Stroke({
            color: getRandomColor(),
            width: Math.random() * 6 + 2 // Random width between 1 and 6
        }),
        fill: new Fill({
            color: getRandomColor()
        }),
        image: new CircleStyle({
            radius: Math.random() * 10 + 5, // Random radius between 5 and 15
            fill: new Fill({
                color: getRandomColor()
            })
        })
    });
}

// Initialize the map
const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new OSM()
        })
    ],
    view: new View({
        center: fromLonLat([-73.7955900, 42.7920160]),
        zoom: 12
    })
});

// Function to create a vector layer from a GPX file
function createGPXLayer(url, style) {
    return new VectorLayer({
        source: new VectorSource({
            url: url,
            format: new GPX()
        }),
        style: style
    });
}

// Define styles for each GPX file
const styles = [
    new Style({
        stroke: new Stroke({
            color: 'red',
            width: 5
        })
    }),
    new Style({
        stroke: new Stroke({
            color: 'orange',
            width: 5
        })
    })
    ,
    new Style({
        stroke: new Stroke({
            color: 'yellow',
            width: 5
        })
    })
    ,
    new Style({
        stroke: new Stroke({
            color: 'green',
            width: 5
        })
    })
    ,
    new Style({
        stroke: new Stroke({
            color: 'blue',
            width: 5
        })
    })
    ,
    new Style({
        stroke: new Stroke({
            color: 'indigo',
            width: 5
        })
    }),
    new Style({
        stroke: new Stroke({
            color: 'violet',
            width: 5
        })
    })

];

const controlsDiv = document.querySelector('.controls');
gpxFiles.forEach((fname, index) => {
    var gpxLayer1 = createGPXLayer('trails/' + fname, styles[index % styles.length]);
    map.addLayer(gpxLayer1);
    const label = document.createElement('label'); 
    const checkbox = document.createElement('input'); 
    checkbox.type = 'checkbox'; 
    checkbox.name = 'layers'; 
    checkbox.value = fname; 
    checkbox.checked = true; 
    checkbox.addEventListener('click', () => { toggleLayerVisibility(index+1); });
    label.appendChild(checkbox); 
    label.appendChild(document.createTextNode(fname)); 
    
    controlsDiv.appendChild(label);
    controlsDiv.appendChild(document.createElement('br'));
});

function getLayer(idx) {
    return map.getLayerGroup().getLayers().getArray()[idx];
}


// Function to toggle layer visibility
function toggleLayerVisibility(idx) {
    const layer =  getLayer(idx);
    const visible = layer.getVisible();
    layer.setVisible(!visible);
}
