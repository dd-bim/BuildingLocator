import WKT from 'ol/format/wkt';
import Feature from 'ol/feature';
import Polygon from 'ol/geom/polygon';
import Point from 'ol/geom/Point';

import $ from 'jquery';

import {register} from 'ol/proj/proj4';
import proj4 from 'proj4';

proj4.defs('EPSG:25833', '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
proj4.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
register(proj4);

var wktString = "";

export function drawWKT(editLayer)
{
  var source = editLayer.getSource();
  var nrOfFeatures = source.getFeatures().length;

  if (nrOfFeatures > 0) {
    alert('Only one feature can be drawn! Please remove existing feature before proceding');
    return;
  }

  wktString = $('#input').val();

  var format = new WKT();

  wktString = format.readFeature(wktString, {
    dataProjection: window.map.getView().getProjection(),
    featureProjection: window.map.getView().getProjection()
  });

  var viewCenter = window.map.getView().getCenter();
  var polyCoordinates = wktString.getGeometry().getCoordinates()[0];

  var bbox = wktString.getGeometry().getExtent();
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

  var projectBasePointWGS84 = getProjectBasePointWGS84(feature);

  var newHTML = 'ProjektBasisPunkt in WGS 84 ' + projectBasePointWGS84[0] + ' ' + projectBasePointWGS84[1];
  $('#basePointWGS84').html(newHTML);

  document.getElementById('output').textContent = wktRep;
  setLevel10();
  setLevel20(projectBasePointWGS84);
  setLevel30();
  setLevel40();
  setLevel50(feature);

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

function getProjectBasePointWGS84(feature) {
  const view = window.map.getView();
  var curProj = view.getProjection();

  var clone = feature.clone();
  var newFeatureGeom = clone.getGeometry().transform(curProj, 'EPSG:4326');
  var projBasePoint = newFeatureGeom.getCoordinates()[0][0];

  return projBasePoint;
}

function setLevel10() {
  var level10 = window.loFile.LoGeoRef10;

  for (let item of level10) {

    if (item.Reference_Object.includes("IfcBuilding")) {

    item.GeoRef10 = true;
    item.Postalcode = window.document.getElementById('postCode').innerHTML;
    item.Town = window.document.getElementById('city').innerHTML;
    item.Region = window.document.getElementById('region').innerHTML;
    item.Country = window.document.getElementById('country').innerHTML;
    item.AddressLines = [window.document.getElementById('road').innerHTML, ' ', window.document.getElementById('houseNumber').innerHTML].join('');
    
    }
  }

}

function setLevel20(coordinates) {

  window.loFile.LoGeoRef20[0].GeoRef20 = true;
  window.loFile.LoGeoRef20[0].Latitude = coordinates[1];
  window.loFile.LoGeoRef20[0].Longitude = coordinates[0];

}

function setLevel30() {
  
  window.loFile.LoGeoRef30[0].GeoRef30 = false;
  window.loFile.LoGeoRef30[0].ObjectLocationXYZ = [0.0, 0.0, window.loFile.LoGeoRef30[0].ObjectLocationXYZ[2]];
  window.loFile.LoGeoRef30[0].ObjectRotationX = [1.0, 0.0, 0.0];
  window.loFile.LoGeoRef30[0].ObjectRotationZ = [0.0, 0.0, 1.0];
}

function setLevel40() {
  window.loFile.LoGeoRef40[0].GeoRef30 = false;
  window.loFile.LoGeoRef40[0].ProjectLocation = [0.0, 0.0, 0.0];
  window.loFile.LoGeoRef40[0].ProjectRotationX = [1.0, 0.0, 0.0];
  window.loFile.LoGeoRef40[0].ProjectRotationZ = [0.0, 0.0, 1.0];
  window.loFile.LoGeoRef40[0].TrueNorthXY = [0.0, 1.0];
}

function setLevel50(feature) {
  window.loFile.LoGeoRef50[0].GeoRef50 = true;
  window.loFile.LoGeoRef50[0].CRS_Name = window.map.getView().getProjection().code_;

  var wktFeatureStart = wktString.getGeometry().getCoordinates()[0][0];
  var wktFeatureEnd = wktString.getGeometry().getCoordinates()[0][1];
  var coordinatesWKT = [wktFeatureStart, wktFeatureEnd];


  var geom = feature.getGeometry();
  var origin = geom.getCoordinates()[0][0];
  var firstPoint = geom.getCoordinates()[0][1];
  var coordinatesWorld = [origin, firstPoint];
  
  var rotation = getRotation(coordinatesWorld, coordinatesWKT);
  window.loFile.LoGeoRef50[0].RotationXY = rotation;
  window.loFile.LoGeoRef50[0].Translation_Eastings = origin[0];
  window.loFile.LoGeoRef50[0].Translation_Northings = origin[1];

  console.log(rotation);

}

function getRotation(worldCoords, wktCoords) {
  var vecWorld = [worldCoords[1][0] - worldCoords[0][0], worldCoords[1][1] - worldCoords[0][1]];
  var vecWKT = [wktCoords[1][0] - wktCoords[0][0], wktCoords[1][1] - wktCoords[0][1]];

  var vecWorldNorm = normalize(vecWorld);
  var vecWKTNorm = normalize(vecWKT);

  var rotX = vecWorldNorm[1]*vecWKTNorm[0] - vecWorldNorm[0]*vecWKTNorm[1];
  var rotY = vecWorldNorm[0]*vecWKTNorm[1] - vecWKTNorm[0]*vecWorldNorm[1];

  return [rotX, rotY];
}

function normalize(vector) {
  var length = Math.sqrt(vector[0]*vector[0] + vector[1]*vector[1]);
  var normalizedVector = [vector[0]/length, vector[1]/length];

  return normalizedVector;
}

function queryGISgraphy(coordinates) {

}

function queryOpenCageData(coordinates) {

}

export function queryNominatim(editLayer) {
  
  var source = editLayer.getSource();
  
  if (source.getFeatures().length < 1) {
    alert('There is no feature in map!');
    return;
  }
  
  var feature = source.getFeatures()[0];
  const view = window.map.getView();
  var curProj = view.getProjection();

  var clone = feature.clone();
  var newFeatureGeom = clone.getGeometry().transform(curProj, 'EPSG:4326');
  var coordinates = newFeatureGeom.getCoordinates()[0][1];
  
  var lat = coordinates[1];
  var lon = coordinates[0];
  var format = 'json';
  var zoom = 18;
  var addressdetails = 1;

  var url = ['https://nominatim.openstreetmap.org/reverse?', 'format=', format, '&lat=', lat, '&lon=', lon, '&zoom=', zoom, '&addressdetails=', addressdetails].join('');

  $.getJSON(url).done(
    function (data) {
      console.log(data);
      var json = data;
      var country = data.address.country;
      var region = data.address.state;
      var city = data.address.city;
      var road = data.address.road;
      var postcode = data.address.postcode;
      var houseNumber = data.address.house_number;

      window.document.getElementById('country').innerHTML = country;
      window.document.getElementById('region').innerHTML = region;
      window.document.getElementById('city').innerHTML = city;
      window.document.getElementById('road').innerHTML = road;
      window.document.getElementById('postCode').innerHTML = postcode;
      window.document.getElementById('houseNumber').innerHTML = houseNumber;

    }
  );
}