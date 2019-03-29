import $ from 'jquery';

export function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy';
}

export function handleFileSelect(evt) {
  const files = evt.target.files;

  const output = [];
  output.push('<li><strong>', escape(files[0].name), '</strong> (', files[0].type || 'n/a',
    ') - ', files[0].size, ' bytes, last modified: ');

  window.document.getElementById('list').innerHTML = `<ul>${output.join('')}</ul>`;

  handleFile(files);
}



export function handleFile(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();

    reader.onload = function(event) {
      window.loFile = JSON.parse(event.target.result);
      handleLoGeoRefFile();
    };

    reader.readAsText(file);
  }
}

function handleLoGeoRefFile() {
  let wktRep = window.loFile.WKTRep;
  wktRep = insertOrigin(wktRep);

  $('#wktRepIn').val(wktRep);

  readLevel20();
  readLevel50();
}

function insertOrigin(wkt) {
  const output = [wkt.slice(0, 9), '0 0,', wkt.slice(9, wkt.indexOf(')')), ', 0 0))'].join('');
  return output;
}

function readLevel50() {
  if (window.loFile.LoGeoRef50[0].GeoRef50) {
    const transEast = window.loFile.LoGeoRef50[0].Translation_Eastings;
    const transNorth = window.loFile.LoGeoRef50[0].Translation_Northings;
    const rotationXY = window.loFile.LoGeoRef50[0].RotationXY;
    const EPSGCode = window.loFile.LoGeoRef50[0].CRS_Name;

    $('#level50Status').attr('value', 'true');
    $('#level50EPSG').attr('value', EPSGCode);
    $('#eastings').attr('value', transEast);
    $('#northings').attr('value', transNorth);
    $('#rotation50').attr('value', `${rotationXY[0]} ${rotationXY[1]}`);
    
  }

  else {
    $('#level50Status').attr('value', 'false');
    $('#eastings').attr('value', 'not specified');
    $('#northings').attr('value', 'not specified');
    $('#rotation50').attr('value', 'not specified');
  }
}

function readLevel20() {
  if (window.loFile.LoGeoRef20[0].GeoRef20) {
    var lat20 = window.loFile.LoGeoRef20[0].Latitude;
    var lon20 = window.loFile.LoGeoRef20[0].Longitude;
    var elevation = window.loFile.LoGeoRef20[0].Elevation;
    
    $('#level20Status').attr('value', 'true');
    $('#lat20').attr('value', lat20);
    $('#lon20').attr('value', lon20);
    $('#elev20').attr('value', elevation);
  }
}
