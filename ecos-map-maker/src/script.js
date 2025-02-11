
/**
 * Elements that make up the popup.
 */
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

/**
 * Create an overlay to anchor the popup to the map.
 */
const overlay = new ol.Overlay({
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
const osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible: true
});

const terr = new ol.layer.Tile({ 
  source: new ol.source.XYZ({ crossOrigin: null, urls: ['https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}'] }), 
  visible: false 
});

const roads = new ol.layer.Tile({
  source:new ol.source.TileWMS({crossOrigin:null,url:'https://gisservices.its.ny.gov/arcgis/services/NYS_Streets/MapServer/WmsServer',hidpi:false,params:{'FORMAT':'image/png32','TRANSPARENT':'TRUE','VERSION':'1.3.0','LAYERS':'13,14,15,12,2,5,8,1,11,4,7,10,3,6,9'},attributions: 'NYS GIS Clearinghouse'}),
  visible: false
});

// Create the map
const map = new ol.Map({
  target: 'map',
  layers: [osmLayer, terr, roads],
  overlays: [overlay],
  view: new ol.View({
      center: [0, 0],
      zoom: 2
  })
});

// Print control
var printControl = new ol.control.Print();
map.addControl(printControl);

document.getElementById('export-png').addEventListener('click', function () {
  printControl.print({ imageType: 'image/png'});
});


// Layer toggle functionality
document.getElementById('osmLayer').addEventListener('change', function () {
  osmLayer.setVisible(this.checked);
});

document.getElementById('terr').addEventListener('change', function () {
  terr.setVisible(this.checked);
});

document.getElementById('roads').addEventListener('change', function () {
  roads.setVisible(this.checked);
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
              fileFormat = new ol.format.GPX();
          }
          else {
              fileFormat = new ol.format.KML();
          }
          const features = fileFormat.readFeatures(fileData, {
              featureProjection: 'EPSG:3857'
          });

          const vectorSource = new ol.source.Vector({
              features: features
          });

          const vectorLayer = new ol.layer.Vector({
              source: vectorSource,
              style: new ol.style.Style({
                  stroke: new ol.style.Stroke({
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
  const newStyle = new ol.style.Style({
      stroke: new ol.style.Stroke({
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

const selected = new ol.style.Style({
  fill: new ol.style.Fill({
      color: '#eeeeee',
  }),
  stroke: new ol.style.Stroke({
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
const selectClick = new ol.interaction.Select({
  condition: ol.events.condition.click,
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

/* On print > save image file */
printControl.on('print', function(e) {
  // Print success
  if (e.canvas) {
    if (e.pdf) {
      // Export pdf using the print info
      var pdf = new jsPDF({
        orientation: e.print.orientation,
        unit: e.print.unit,
        format: e.print.format
      });
      pdf.addImage(e.image, 'JPEG', e.print.position[0], e.print.position[0], e.print.imageWidth, e.print.imageHeight);
      pdf.save();
    } else  {
      /*
      $('img.result').remove();
      $('<img>').addClass('result').attr('src', e.image).appendTo('body');
      return;
      */
      e.canvas.toBlob(function(blob) {
        saveAs(blob, 'map.'+e.imageType.replace('image/',''));
      }, e.imageType);
    }
  } else {
    console.warn('No canvas to export');
  }
});