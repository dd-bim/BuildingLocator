import '@babel/polyfill';

import Map from 'ol/Map';
import VectorLayer from 'ol/layer/vector';
import VectorSource from 'ol/source/vector';
import ImageLayer from 'ol/layer/Image';
import ImageSource from 'ol/source/imagewms';
import WMTSSource from 'ol/source/wmts';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
import { register } from 'ol/proj/proj4';
import MousePosition from 'ol/control/MousePosition';
import { createStringXY } from 'ol/coordinate';
import { Select, Translate, defaults as defaultInteractions } from 'ol/interaction';
import {defaults as defaultControls, ZoomToExtent} from 'ol/control';
import { fromLonLat, transform } from 'ol/proj';
import Projection from 'ol/proj/Projection';
import WMSCapabilities from 'ol/format/WMSCapabilities';
import { getCenter } from 'ol/extent';


import proj4 from 'proj4';
import $ from 'jquery';
import RotateFeatureInteraction from './indexRot';

import * as BuildingLocator from './buildingLocator';
import * as CustomStyle from './customStyles';
import * as fileHandler from './fileHandler';

import './css/buildingLocator.css';
import './css/ol.css';


window.loFile = '';
window.customWMS = '';
window.customView = '';
window.supportedCRS = '';
//var customWMSLayer;

proj4.defs('EPSG:25833', '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
proj4.defs('EPSG:31469', '+proj=tmerc +lat_0=0 +lon_0=15 +k=1 +x_0=5500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs');
register(proj4);

const selectedFeature = new Select({
  style: new CustomStyle.getSelectStyle(),
});

const translate = new Translate({
  features: selectedFeature.getFeatures(),
});

const viewWGS84 = new View({
  center: [13.73, 51.05],
  projection: 'EPSG:4326',
  zoom: 15,
});

const viewWebMercator = new View({
  center: [1528903, 6627333],
  projection: 'EPSG:3857',
  zoom: 12,
});

const viewUTM32 = new View({
  center: [831875, 5664306],
  projection: 'EPSG:25832',
  zoom: 15,

});

const viewUTM33 = new View({
  center: [411243, 5654395],
  projection: 'EPSG:25833',
  zoom: 17,
});

const topPlusSingleImageWMS = new ImageLayer({
  source: new ImageSource({
    url: 'http://sgx.geodatenzentrum.de/wms_topplus_web_open?',
    params: { Layers: 'web' },
    attributions: ['<a href="http://www.bkg.bund.de">Bundesamt für Kartographie und Geodäsie </a>', ' 2018', '<a href="http://sg.geodatenzentrum.de/web_public/Datenquellen_TopPlus_Open.pdf"> Datenquellen </a>'].join(''),
  }),
});



const editLayer = new VectorLayer({
  source: new VectorSource(),
});

window.map = new Map({
  interactions: defaultInteractions().extend([selectedFeature, translate]),
  layers: [
    //testWMS,
    topPlusSingleImageWMS,
    editLayer,
  ],
  target: 'map',
  view: viewUTM33,
});

const mousePosition = new MousePosition({
  coordinateFormat: createStringXY(2),
  projecton: window.map.getView().getProjection(),
  target: document.getElementById('myPosition'),
  undefinedHTML: '&nbsp;',
});

const rotate = new RotateFeatureInteraction({
  features: selectedFeature.getFeatures(),
  anchor: [0, 0],
  angle: -90 * Math.PI / 180,
  style: CustomStyle.getRotateStyle(),
});

window.map.addControl(mousePosition);

document.getElementById('files').addEventListener('change', fileHandler.handleFileSelect, false);

$('#zoomToFeature').on('click', () => {
  let extent = editLayer.getSource().getExtent();
  if (isNaN(extent[0] + extent[1] + extent[2] + extent[3]) == false) {
    window.map.getView().fit(extent);
  } 
});

$('#drawWKT').on('click', () => {
  BuildingLocator.drawWKT(editLayer);
});

$('#savePosition').on('click', () => {
  BuildingLocator.savePosition(editLayer);
});

$('#queryOSM').on('click', () => {
  BuildingLocator.queryNominatim(editLayer);
});

$('#saveFile').on('click', () => {
  BuildingLocator.downloadJSONFile(JSON.stringify(window.loFile), 'update.json');
});

$('#projSelect').change(function () {
  switch (this.value) {
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
    case 'customWMS':
      window.map.removeLayer(topPlusSingleImageWMS);
      window.map.setView(customView);
      break;
    case '31467':
      window.map.setView(viewTest);
      break;
  }
});

$('#CRSSelect').change(function() {
  var fullCode = this.value;
  var number = fullCode.split(':')[1];

  /*$.get('https://www.epsg.io/'+number+'.proj4', function(data) {
    console.log(data);
  })*/
})

$('input[name="EditControl"]').change((e) => {
  switch (e.target.value) {
    case 'move':
      window.map.addInteraction(translate);
      window.map.removeInteraction(rotate);

      break;
    case 'rotate':
      var featureToRotate = selectedFeature.getFeatures().item(0);
      
      if (featureToRotate != undefined) {
        var projectBasePoint = BuildingLocator.getProjectBasePointFromFeature(featureToRotate);

        console.log(projectBasePoint);

        rotate.setAnchor(projectBasePoint.getCoordinates());
      }

      window.map.removeInteraction(translate);
      window.map.addInteraction(rotate);
      break;
  }
  $('input[name="EditControl"]').parent().removeClass("active");
  $(e.target).parent().addClass("active")
});

$('#delete').on('click', () => {

  if (editLayer.getSource().getFeatures().length > 0 && selectedFeature.getFeatures().getLength() === 0) {
    alert('Select the feature for deleting!');
  }
  
  else if (selectedFeature.getFeatures().getLength() === 0) {
    alert('Map already empty!');
  } 
  
  else {
    selectedFeature.getFeatures().item(0).setStyle(CustomStyle.getDeleteStyle());
    const source = editLayer.getSource();
    source.clear();
  }
});

$('#customWMSCheck').change(function() {
  if (this.checked) {
    $('#wmsFS').attr('disabled', false);
    $('#addWMS').attr('disabled', false);
    $('#queryCap').attr('disabled', false);
  }
  else {
    $('#wmsFS').attr('disabled', true);
    $('#addWMS').attr('disabled', true);
    $('#queryCap').attr('disabled', true);
  }
});

$('#addWMS').on('click', () => {
  var WMSUrl = $('#wmsUrl').val();
  var layer = $('#layerSelect').val();
  var EPSGCode = $('#CRSSelect').val();
  var proj4Definition = $('#projDef').val();
  //var projectionName = 'EPSG:'+EPSGCode;

  proj4.defs(EPSGCode, proj4Definition);
  register(proj4);

  window.map.removeLayer(customWMS);

  window.customWMS = new ImageLayer({
    source: new ImageSource({
      url: WMSUrl,
      params: { Layers: layer },
    })
  });

  if ($('#projSelect').prop('options').length == 4) {
    $('#projSelect').append('<option value="customWMS">custom WMS</option>');
  }

  window.map.addLayer(customWMS);
  var centerCustomWMS = '';

  for (var i = 0; i<window.supportedCRS.length; i++) {
    if (window.supportedCRS[i].crs == EPSGCode) {
      centerCustomWMS = getCenter(window.supportedCRS[i].extent);
      console.log(centerCustomWMS);
    }
  }

  window.customView = new View({
    projection: EPSGCode,
    center: centerCustomWMS,
    zoom: 10
  });
});

$('#queryCap').on('click', () => {
  var WMSUrl = $('#wmsUrl').val();
  var parser = new WMSCapabilities();
  var caps;

  $.get(WMSUrl+'service=wms&request=getcapabilities', function(data) {
    caps = parser.read(data);
    console.log(caps);

    var layers = caps.Capability.Layer.Layer;
    var crs = caps.Capability.Layer.CRS;
    supportedCRS = caps.Capability.Layer.BoundingBox

    for (var i=0; i<layers.length; i++) {
      var layerName = layers[i].Name;
      var newEntry = ['<option value="', layerName, '">', layerName, '</option>'];

      $('#layerSelect').append(newEntry.join(""));
    }

    for (var i=0; i<crs.length; i++) {
      var code = crs[i];
      var newEntry = ['<option value="', code, '">', code, '</option>'];

      $('#CRSSelect').append(newEntry.join(""));
    }
  })



});
