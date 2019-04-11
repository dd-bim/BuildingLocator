import WKT from 'ol/format/wkt';
import Feature from 'ol/feature';
import Polygon from 'ol/geom/polygon';
import Point from 'ol/geom/Point';

import $ from 'jquery';

import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';

proj4.defs('EPSG:25833', '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
proj4.defs('EPSG:3857','+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs');
register(proj4);

let wktString = '';

function getWorldPosition(wktString) {
  const newCoords = [];
  let polyCoordinates = wktString.getGeometry().getCoordinates()[0];

  if (JSON.parse($('#level50Status').attr('value'))) {
    const eastings = parseFloat($('#eastings').attr('value'));
    //const eastings = window.document.getElementById('eastings').innerHTML;


    //const northings = window.document.getElementById('northings').innerHTML;
    const northings = parseFloat($('#northings').attr('value'));


    //let rotation = window.document.getElementById('rotation50').innerHTML;
    let rotation = $('#rotation50').attr('value');

    rotation = rotation.split(' ');

    for (let i = 0; i < polyCoordinates.length; i++) {
      const newX = parseFloat(eastings) + parseFloat(polyCoordinates[i][0]);
      const newY = parseFloat(northings) + parseFloat(polyCoordinates[i][1]);

      newCoords.push([newX, newY]);
    }

    const featureToRot = new Feature({
      geometry: new Polygon([newCoords]),
    });

    const featureToRotGeom = featureToRot.getGeometry();
    const anchor = newCoords[0];
    const angle = Math.atan2(parseFloat(rotation[0]), parseFloat(rotation[1]));

    featureToRotGeom.rotate(angle, anchor);

    window.map.getView().setCenter(featureToRotGeom.getCoordinates()[0][1]);

    return featureToRotGeom.getCoordinates()[0];
  }

  if (JSON.parse($('#level50Status').attr('value')) == false && window.loFile.LoGeoRef20[0].GeoRef20 == true) {
    const lat = parseFloat(window.loFile.LoGeoRef20[0].Latitude);
    const lon = parseFloat(window.loFile.LoGeoRef20[0].Longitude);

    const curProj = window.map.getView().getProjection();
    const pointFeature = new Feature({
      geometry: new Point([lon, lat]),
    });

    pointFeature.getGeometry().transform('EPSG:4326', curProj);
    const startingPoint = pointFeature.getGeometry().getCoordinates();

    for (let i = 0; i < polyCoordinates.length; i++) {
      const newX = startingPoint[0] + parseFloat(polyCoordinates[i][0]);
      const newY = startingPoint[1] + parseFloat(polyCoordinates[i][1]);

      newCoords.push([newX, newY]);
    }

    window.map.getView().setCenter(newCoords[1]);

    return newCoords;
  }


  const viewCenter = window.map.getView().getCenter();

  const bbox = wktString.getGeometry().getExtent();
  const xCent = ((bbox[2] - bbox[0]) / 2);
  const yCent = ((bbox[3] - bbox[1]) / 2);
  const centroid = [xCent, yCent];

  for (let i = 0; i < polyCoordinates.length; i++) {
    const xDiff = centroid[0] - polyCoordinates[i][0];
    const yDiff = centroid[1] - polyCoordinates[i][1];

    const newX = viewCenter[0] - xDiff;
    const newY = viewCenter[1] - yDiff;

    newCoords.push([newX, newY]);
  }
  return newCoords;
}

export function drawWKT(editLayer) {
  const source = editLayer.getSource();
  const nrOfFeatures = source.getFeatures().length;

  if (nrOfFeatures > 0) {
    alert('Only one feature can be drawn! Please remove existing feature before proceding');
    return;
  }

  wktString = $('#wktRepIn').val();

  const format = new WKT();

  wktString = format.readFeature(wktString, {
    dataProjection: window.map.getView().getProjection(),
    featureProjection: window.map.getView().getProjection(),
  });

  const newCoords = getWorldPosition(wktString);
  const feautre2 = new Feature({
    geometry: new Polygon([newCoords]),
  });

  source.addFeature(feautre2);
}

export function savePosition(editLayer) {
  const source = editLayer.getSource();

  if (source.getFeatures().length < 1) {
    alert('There is no feature in map!');
    return;
  }

  const feature = source.getFeatures()[0];
  const olGeom = feature.getGeometry();
  const format = new WKT();
  const wktRep = format.writeGeometry(olGeom);

  const projectBasePointWGS84 = getProjectBasePointWGS84(feature);

  const newHTML = `ProjektBasisPunkt in WGS 84 ${projectBasePointWGS84[0]} ${projectBasePointWGS84[1]}`;
  $('#basePointWGS84').html(newHTML);

  //document.getElementById('output').textContent = wktRep;
  setLevel10();
  setLevel20(projectBasePointWGS84);
  setLevel30();
  setLevel40();
  setLevel50(feature);
}

export function downloadJSONFile(text, fileName) {
  const a = document.createElement('a');
  // var mimeType = 'application/octet-stream';
  const mimeType = 'application/json';

  if (navigator.msSaveBlob) { // IE10
    navigator.msSaveBlob(new Blob([text], {
      type: mimeType,
    }), fileName);
  } else if (URL && 'download' in a) { // html5 A[download]
    a.href = URL.createObjectURL(new Blob([text], {
      type: mimeType,
    }));
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    location.href = `data:application/octet-stream,${encodeURIComponent(content)}`; // only this mime type is supported
  }
}

export function getProjectBasePointFromFeature(feature) {
  const format = new WKT();
  const featureWKT = format.readFeature($('#wktRepIn').val(), {
    dataProjection: window.map.getView().getProjection(),
    featureProjection: window.map.getView().getProjection(),
  });

  const cordBPX = feature.getGeometry().getCoordinates()[0][0][0] - featureWKT.getGeometry().getCoordinates()[0][0][0];
  const cordBPY = feature.getGeometry().getCoordinates()[0][0][1] - featureWKT.getGeometry().getCoordinates()[0][0][1];

  return new Point([cordBPX, cordBPY]);
}

function getProjectBasePointWGS84(feature) {
  const view = window.map.getView();
  const curProj = view.getProjection();

  const clone = feature.clone();
  const newFeatureGeom = clone.getGeometry().transform(curProj, 'EPSG:4326');
  const projBasePoint = newFeatureGeom.getCoordinates()[0][0];

  return projBasePoint;
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

  const wktFeatureStart = wktString.getGeometry().getCoordinates()[0][0];
  const wktFeatureEnd = wktString.getGeometry().getCoordinates()[0][1];
  const coordinatesWKT = [wktFeatureStart, wktFeatureEnd];


  const geom = feature.getGeometry();
  const origin = geom.getCoordinates()[0][0];
  const firstPoint = geom.getCoordinates()[0][1];
  const coordinatesWorld = [origin, firstPoint];

  const rotation = getRotation(coordinatesWorld, coordinatesWKT);
  window.loFile.LoGeoRef50[0].RotationXY = rotation;
  window.loFile.LoGeoRef50[0].Translation_Eastings = origin[0];
  window.loFile.LoGeoRef50[0].Translation_Northings = origin[1];

  console.log(rotation);
}

function normalize(vector) {
  const length = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
  const normalizedVector = [vector[0] / length, vector[1] / length];

  return normalizedVector;
}

function getRotation(worldCoords, wktCoords) {
  const vecWorld = [worldCoords[1][0] - worldCoords[0][0], worldCoords[1][1] - worldCoords[0][1]];
  const vecWKT = [wktCoords[1][0] - wktCoords[0][0], wktCoords[1][1] - wktCoords[0][1]];

  const vecWorldNorm = normalize(vecWorld);
  const vecWKTNorm = normalize(vecWKT);

  const rotX = vecWorldNorm[0] * vecWKTNorm[0] + vecWorldNorm[1] * vecWKTNorm[1];
  const rotY = vecWorldNorm[0] * vecWKTNorm[1] - vecWKTNorm[0] * vecWorldNorm[1];

  // var rad = Math.atan2(rotY, rotX);
  // var deg = rad * (180/Math.PI);

  return [-rotY, rotX];
}

export function queryNominatim(editLayer) {
  const source = editLayer.getSource();

  if (source.getFeatures().length < 1) {
    alert('There is no feature in the map!');
    return;
  }

  const feature = source.getFeatures()[0];
  const view = window.map.getView();
  const curProj = view.getProjection();

  const clone = feature.clone();
  const newFeatureGeom = clone.getGeometry().transform(curProj, 'EPSG:4326');
  const coordinates = newFeatureGeom.getCoordinates()[0][1];

  const lat = coordinates[1];
  const lon = coordinates[0];
  const format = 'json';
  const zoom = 18;
  const addressdetails = 1;

  const url = ['https://nominatim.openstreetmap.org/reverse?', 'format=', format, '&lat=', lat, '&lon=', lon, '&zoom=', zoom, '&addressdetails=', addressdetails].join('');

  $.getJSON(url).done(
    (data) => {
      const country = data.address.country;
      const region = data.address.state;
      const city = data.address.city;
      let road = data.address.road;
      const postcode = data.address.postcode;
      let houseNumber = 'Number Not Defined';
      
      if (data.address.hasOwnProperty('house_number'))
      {
        houseNumber = data.address.house_number;
      }


      $('#country').attr('value', country);
      $('#region').attr('value', region);
      $('#city').attr('value', city);
      $('#zip').attr('value', postcode);
      $('#street').attr('value', road);
      $('#number').attr('value', houseNumber);
    },
  );
}
