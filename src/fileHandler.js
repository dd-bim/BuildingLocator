import $ from 'jquery';

export function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy';

}

export function drop(e) {
  e.stopPropagation();
  e.preventDefault();

  var dt = e.dataTransfer;
  var files = dt.files;

  let output = [];
  output.push('<li><strong>', escape(files[0].name), '</strong> (', files[0].type || 'n/a',
    ') - ', files[0].size, ' bytes, last modified: ',
    files[0].lastModifiedDate.toLocaleDateString(), '</li>');

  window.document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';

  handleFile(files);

}

export function handleFile(files) {
  for (var i=0; i<files.length; i++) {
    var file = files[i];
    var reader = new FileReader();

    reader.onload = (function (theFile) {
      return function(e) {

        var loGeoRefFile = JSON.parse(e.target.result);

        window.loFile = loGeoRefFile;

        handleLoGeoRefFile(loGeoRefFile);
      }
    })(file);
    reader.readAsText(file);
  }
}

function handleLoGeoRefFile(JSONFile) {

  var wktRep = JSONFile.WKTRep;
  wktRep = insertOrigin(wktRep);
  
  $('#input').val(wktRep);

  readLevel50();
}

function insertOrigin(wkt) {
  var output = [wkt.slice(0, 9), '0 0,', wkt.slice(9, wkt.indexOf(')')), ', 0 0))'].join('');
  return output;
}

function readLevel50() {
  if (window.loFile.LoGeoRef50[0].GeoRef50) {
    var transEast = window.loFile.LoGeoRef50[0].Translation_Eastings;
    var transNorth = window.loFile.LoGeoRef50[0].Translation_Northings;
    var rotationXY = window.loFile.LoGeoRef50[0].RotationXY;

    window.document.getElementById('level50Status').innerHTML = "true";
    window.document.getElementById('eastings').innerHTML = transEast;
    window.document.getElementById('northings').innerHTML = transNorth;
    window.document.getElementById('rotation50').innerHTML = rotationXY[0] + " " + rotationXY[1];

  }
}