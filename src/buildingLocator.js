import WKT from 'ol/format/wkt';
import Feature from 'ol/feature';
import Polygon from 'ol/geom/polygon';

import $ from 'jquery';

export function drawWKT(editLayer)
{
  var source = editLayer.getSource();
  var nrOfFeatures = source.getFeatures().length;

  if (nrOfFeatures > 0) {
    alert('Only one feature can be drawn! Please remove existing feature before proceding');
    return;
  }

  var wktString = $('#input').val();
  var format = new WKT();

  var feature = format.readFeature(wktString, {
    dataProjection: window.map.getView().getProjection(),
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

export function savePosition(editLayer)
{
  var source = editLayer.getSource();
  
  if (source.getFeatures().length < 1) {
    alert('There is no feature in map!');
    return;
  }
  
  var feature = source.getFeatures()[0];
  var olGeom = feature.getGeometry();
  var format = new WKT();
  var wktRep = format.writeGeometry(olGeom);

  document.getElementById('output').textContent = wktRep;
}