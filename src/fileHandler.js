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
      window.loFile=JSON.parse(event.target.result);
      handleLoGeoRefFile();
      /*try {
        window.loFile = JSON.parse(event.target.result);
        handleLoGeoRefFile();
      } catch(error) {
        alert('Please provide a (valid) JSON-File' + error);
      }*/
    };
    

    reader.readAsText(file);
  }
}

function handleLoGeoRefFile() {
  let wktRep = window.loFile.WKTRep;
  wktRep = insertOrigin(wktRep);

  $('#wktRepIn').val(wktRep);

  readLevel10();
  readLevel20();
  readLevel30();
  readLevel40();
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
    $('#level50EPSG').attr('value', 'not specified');
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

function readLevel10() {
  const level10 = window.loFile.LoGeoRef10;

  for (const item of level10) {
    var ifcType = item.Reference_Object[1];
    var status = item.GeoRef10;
    var address = item.AddressLines;
    var zip = item.Postalcode;
    var town = item.Town;
    var region = item.Region;
    var country = item.Country;

    $('#lvl10').append("<p>IFC-Type: " + ifcType + " </p>");
    $('#lvl10').append("<p>Level10 Status: " + status + " </p>");
    $('#lvl10').append("<p>Country: " + country + " </p>");
    $('#lvl10').append("<p>Region: " + region + " </p>");
    $('#lvl10').append("<p>Town: " + town + " </p>");
    $('#lvl10').append("<p>ZIP-Code: " + zip + " </p>");
    $('#lvl10').append("<p>Address: " + address + " </p>");
  }

}

function readLevel30() {
  if(window.loFile.LoGeoRef30[0].GeoRef30) {

    var ifcType = window.loFile.LoGeoRef30[0].Reference_Object[1];
    var status = window.loFile.LoGeoRef30[0].GeoRef30;
    var instanceObject = window.loFile.LoGeoRef30[0].Instance_Object[1];
    var objectLocation = window.loFile.LoGeoRef30[0].ObjectLocationXYZ;
    var objectRotationX = window.loFile.LoGeoRef30[0].ObjectRotationX;
    var ObjectRotationZ = window.loFile.LoGeoRef30[0].ObjectRotationZ;
    
    $('#level30Status').attr('value', 'true');
    $('#refObj30').attr('value', ifcType);
    $('#insObj30').attr('value', instanceObject);
    $('#objLocation30').attr('value', objectLocation);
    $('#objRotX30').attr('value', objectRotationX);
    $('#objRotZ30').attr('value', ObjectRotationZ);
  }

  else {
    $('#level30Status').attr('value', 'false');
    $('#refObj30').attr('value', 'not specified');
    $('#insObj30').attr('value', 'not specified');
    $('#objLocation30').attr('value', 'not specified');
    $('#objRotX30').attr('value', 'not specified');
    $('#objRotZ30').attr('value', 'not specified');
  }

}

function readLevel40() {
  if(window.loFile.LoGeoRef40[0].GeoRef40) {

    var ifcType = window.loFile.LoGeoRef40[0].Reference_Object[1];
    var instanceObject = window.loFile.LoGeoRef40[0].Instance_Object[1];
    var projLocation = window.loFile.LoGeoRef40[0].ProjectLocation;
    var projRotationX = window.loFile.LoGeoRef40[0].ProjectRotationX;
    var projRotationZ = window.loFile.LoGeoRef40[0].ProjectRotationZ;
    var trueNorth = window.loFile.LoGeoRef40[0].TrueNorthXY;
    
    $('#level40Status').attr('value', 'true');
    $('#refObj40').attr('value', ifcType);
    $('#insObj40').attr('value', instanceObject);
    $('#projLocation40').attr('value', projLocation);
    $('#projRotX40').attr('value', projRotationX);
    $('#projRotZ40').attr('value', projRotationZ);
    $('#trueNorth40').attr('value', trueNorth);
  }
  else {
    $('#level40Status').attr('value', 'false');
    $('#refObj40').attr('value', 'not specified');
    $('#insObj40').attr('value', 'not specified');
    $('#projLocation40').attr('value', 'not specified');
    $('#projRotX40').attr('value', 'not specified');
    $('#projRotZ40').attr('value', 'not specified');
    $('#trueNorth40').attr('value', 'not specified');
  }
}