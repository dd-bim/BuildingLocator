import Map from 'ol/Map';
import VectorLayer from 'ol/layer/vector';
import VectorSource from 'ol/source/vector';
import ImageLayer from 'ol/layer/Image';
import ImageSource from 'ol/source/imagewms';
import WMTSSource from 'ol/source/wmts';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
import WKT from 'ol/format/wkt';
import Extent from 'ol/extent';
import Feature from 'ol/feature';
import Polygon from 'ol/geom/polygon';
import {register} from 'ol/proj/proj4';
import MousePosition from 'ol/control/MousePosition';
import {createStringXY} from 'ol/coordinate';

import $ from 'jquery';

import proj4 from 'proj4';

proj4.defs('EPSG:25833', '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
proj4.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
register(proj4);



const viewWGS84 = new View({
  center: [13.73, 51.05],
  projection: 'EPSG:4326',
  zoom: 15
})

const viewWebMercator = new View({
  center: [1528903, 6627333],
  projection: 'EPSG:3857',
  zoom:12
})

const viewUTM32 = new View({
  center: [831875, 5664306],
  projection: 'EPSG:25832',
  zoom: 15

})

const viewUTM33 = new View({
  center: [411243, 5654395],
  projection: 'EPSG:25833',
  zoom: 15
})

const topPlusSingleImageWMS = new ImageLayer({
  source: new ImageSource({
    url: 'http://sgx.geodatenzentrum.de/wms_topplus_web_open?',
    params: {'Layers': 'web'}
  })
});

/*const topPlusWMSTiles = new TileLayer({
  source: new WMTSSource({
    url: 'http://sgx.geodatenzentrum.de/wmts_topplus_web_open',
    params: {'Layers': 'TopPlusOpen'}
  })
});*/

const editLayer = new VectorLayer({
  source: new VectorSource()
});

window.map = new Map({
  layers: [
    //topPlusWMSTiles,
    topPlusSingleImageWMS,
    editLayer
  ],
  target: 'map',
  view: new View({
    center: [1530000, 6626800],
    zoom: 17
  })
});

function drawWKT()
{
  var source = editLayer.getSource();
  var nrOfFeatures = source.getFeatures().length;

  if (nrOfFeatures > 0) {
    alert('Only one feature can be drawn! Please remove existing feature before proceding');
    return;
  }

  var wktString = document.getElementById('input').textContent;
  var format = new WKT();

  var feature = format.readFeature(wktString, {
    dataProjection: 'EPSG:3857',
    featureProjection: window.map.getView().getProjection()
  });

  var viewCenter = window.map.getView().getCenter();
  var polyCoordinates = feature.getGeometry().getCoordinates()[0];

  var bbox = feature.getGeometry().getExtent();
  var xCent = ((bbox[2]-bbox[0])/2);
  var yCent = ((bbox[3]-bbox[1])/2);
  var centroid = [xCent, yCent];

  var newCoords = [];

  for (var i=0; i<polyCoordinates.length; i++) {
    var xDiff = centroid[0] - polyCoordinates[i][0];
    var yDiff = centroid[1] - polyCoordinates[i][1];

    var newX = viewCenter[0] - xDiff;
    var newY = viewCenter[1] - yDiff;

    newCoords.push([newX, newY]);
  }

  var feautre2 = new Feature({
    geometry: new Polygon([newCoords])
  });

  source.addFeature(feautre2);
}

$('#drawWKT').on('click', () => {
  drawWKT();
});

function savePosition()
{
  var source = editLayer.getSource();
  var feature = source.getFeatures()[0];

  var olGeom = feature.getGeometry();
  var format = new WKT();
  var wktRep = format.writeGeometry(olGeom);

  document.getElementById('output').textContent = wktRep;
}

$('#savePosition').on('click', () => {
  savePosition();
});

$('#btn-4326').on('click', () => {
  window.map.setView(viewWGS84);
})

$('#btn-25833').on('click', () => {
  window.map.setView(viewUtm);
})

$("input[name='Projection']").change( function() {
  switch(this.value) {
    case '4326':
      window.map.setView(viewWGS84);
      break;
    case '3857':
      window.map.setView(viewWebMercator);
      break;
    case '25833':
      window.map.setView(viewUTM33);
      break;
    case '25832':
      window.map.setView(viewUTM32);
      break;
  }
})

var mousePosition = new MousePosition({
  coordinateFormat: createStringXY(2),
  projecton: window.map.getView().getProjection(),
  target: document.getElementById('myPosition'),
  undefinedHTML: '&nbsp;'
});

map.addControl(mousePosition);