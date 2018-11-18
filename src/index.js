import Map from 'ol/Map';

import VectorLayer from 'ol/layer/vector';
import VectorSource from 'ol/source/vector';

import ImageLayer from 'ol/layer/Image';
import ImageSource from 'ol/source/imagewms';
import WMTSSource from 'ol/source/wmts';

import View from 'ol/view';

import TileLayer from 'ol/layer/tile';
import OSM from 'ol/source/osm';

import WKT from 'ol/format/wkt';

import Extent from 'ol/extent';

import Feature from 'ol/feature';
import Polygon from 'ol/geom/polygon';

import $ from 'jquery';

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

const OSMLayer = new TileLayer({
  source: new OSM()
})

window.map = new Map({
  layers: [
    //OSMLayer,
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

  var feature = format.readFeature(wktString);

  var viewCenter = window.map.getView().getCenter();
  var polyCoordinates = feature.getGeometry().getCoordinates()[0];

  var bbox = feature.getGeometry().getExtent();
  var centroid = Extent.getCenter(bbox);

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
