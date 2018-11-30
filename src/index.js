import '@babel/polyfill';

import Map from 'ol/Map';
import VectorLayer from 'ol/layer/vector';
import VectorSource from 'ol/source/vector';
import ImageLayer from 'ol/layer/Image';
import ImageSource from 'ol/source/imagewms';
import WMTSSource from 'ol/source/wmts';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
import {register} from 'ol/proj/proj4';
import MousePosition from 'ol/control/MousePosition';
import {createStringXY} from 'ol/coordinate';
import {Select, Translate, defaults as defaultInteractions} from 'ol/interaction';

import proj4 from 'proj4';
import $ from 'jquery';
import RotateFeatureInteraction from './indexRot';

import * as BuildingLocator from './buildingLocator';
import * as CustomStyle from './customStyles';
import * as fileHandler from './fileHandler';

window.loFile = "";

proj4.defs('EPSG:25833', '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
proj4.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
register(proj4);

const selectedFeature = new Select({
  style: new CustomStyle.getSelectStyle()
});

const translate = new Translate({
  features: selectedFeature.getFeatures()
})

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
  zoom: 17
})

const topPlusSingleImageWMS = new ImageLayer({
  source: new ImageSource({
    url: 'http://sgx.geodatenzentrum.de/wms_topplus_web_open?',
    params: {'Layers': 'web'},
    attributions: ['<a href="http://www.bkg.bund.de">Bundesamt für Kartographie und Geodäsie </a>', ' 2018', '<a href="http://sg.geodatenzentrum.de/web_public/Datenquellen_TopPlus_Open.pdf"> Datenquellen </a>'].join('')
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
  interactions: defaultInteractions().extend([selectedFeature, translate]),
  layers: [
    //topPlusWMSTiles,
    topPlusSingleImageWMS,
    editLayer
  ],
  target: 'map',
  view: viewUTM33
});

$('#drawWKT').on('click', () => {
  BuildingLocator.drawWKT(editLayer);
});

$('#savePosition').on('click', () => {
  BuildingLocator.savePosition(editLayer);
});

$('#getAddress').on('click', () => {
  BuildingLocator.queryNominatim(editLayer);
})

$('#saveFile').on('click', () => {
  BuildingLocator.downloadJSONFile(JSON.stringify(window.loFile), "buildingLocator.json");
});

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

const rotate = new RotateFeatureInteraction({
  features: selectedFeature.getFeatures(),
  anchor: [ 0, 0 ],
  angle: -90 * Math.PI / 180,
  style: CustomStyle.getRotateStyle()
})

$("input[name='EditControl']").change( function() {
  switch(this.value) {
    case 'move':
      window.map.addInteraction(translate);
      window.map.removeInteraction(rotate);

      break;
    case 'rotate':
      var featureToRotate = selectedFeature.getFeatures().item(0)
      var projectBasePoint = BuildingLocator.getProjectBasePointFromFeature(featureToRotate);
      
      console.log(projectBasePoint);

      rotate.setAnchor(projectBasePoint.getCoordinates());
      window.map.removeInteraction(translate);
      window.map.addInteraction(rotate);
      break;
  }
})

$('#delete').on('click', () => {
  if (selectedFeature.getFeatures().getLength() == 0) { 
  }
  else {
    selectedFeature.getFeatures().item(0).setStyle(CustomStyle.getDeleteStyle());
    var source = editLayer.getSource();
    source.clear();
  }
})

let dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', fileHandler.handleDragOver, false);
//dropZone.addEventListener('drop', fileHandler.handleFileSelect, false);

dropZone.addEventListener("drop", fileHandler.drop, false);

