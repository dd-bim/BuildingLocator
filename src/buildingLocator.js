import WKT from 'ol/format/wkt';
import Feature from 'ol/feature';
import Polygon from 'ol/geom/polygon';
import Point from 'ol/geom/Point';

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

  /*var newStartX = newCoords[0][0]-polyCoordinates[0][0];
  var newStartY = newCoords[0][1]-polyCoordinates[0][1];

  newCoords.unshift([newStartX, newStartY]);
  newCoords.unshift([newStartX, newStartY]);
  */

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
  window.loFile.LoGeoRef40[0].ProjectLocation = olGeom.getCoordinates()[0][0];
}

export function downloadJSONFile(text, fileName) {

  var a = document.createElement('a');
  //var mimeType = 'application/octet-stream';
  var mimeType = 'application/json';

  if (navigator.msSaveBlob) { // IE10
    navigator.msSaveBlob(new Blob([text], {
      type: mimeType
    }), fileName);
  } else if (URL && 'download' in a) { //html5 A[download]
    a.href = URL.createObjectURL(new Blob([text], {
      type: mimeType
    }));
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
  }
  
}

export function getProjectBasePointFromFeature(feature) {
  var coordinates = feature.getGeometry().getCoordinates()[0][0];
    var format = new WKT();
    var featureWKT = format.readFeature($('#input').val(), {
      dataProjection: window.map.getView().getProjection(),
      featureProjection: window.map.getView().getProjection()
    });

    var cordBPX = feature.getGeometry().getCoordinates()[0][0][0] - featureWKT.getGeometry().getCoordinates()[0][0][0];
    var cordBPY = feature.getGeometry().getCoordinates()[0][0][1] - featureWKT.getGeometry().getCoordinates()[0][0][1];
        
    return new Point([cordBPX, cordBPY]);
}

function insertOrigin(wkt) {
  var output = [wkt.slice(0, 9), '0 0,', wkt.slice(9, wkt.indexOf(')')), ', 0 0))'].join('');
  return output;
}