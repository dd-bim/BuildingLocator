import $ from 'jquery';

export function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  let files = evt.dataTransfer.files;
  let output = [];

  for (var i = 0, f; f = files[i]; i++) {
    output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a',
    ') - ', f.size, ' bytes, last modified: ',
    f.lastModifiedDate.toLocaleDateString(), '</li>');
  }

  window.document.getElementById('list').innerHTML = 
    '<ul>' + output.join('') + '</ul>';

  var reader = new FileReader();

  reader.onload = (function(theFile) {
    return function(e) {
      var p = JSON.parse(e.target.result);
    };
  })(f);

  console.log(reader.readAsText(f));
}

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

  handleFile(files);

}

export function handleFile(files) {
  for (var i=0; i<files.length; i++) {
    var file = files[i];
    var reader = new FileReader();

    reader.onload = (function (theFile) {
      return function(e) {
        console.log('e read as text = ', e);

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
  
  $('#input').val(wktRep);
}