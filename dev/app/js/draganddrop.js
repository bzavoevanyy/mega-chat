function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    files = evt.dataTransfer.files; // FileList object.
    var elem = dropzone.getElementsByClassName('dropinner')[0];
    if (files.length > 1) {
        elem.innerHTML = 'Выберете только один файл';
    } else if (files[0].type != 'image/jpeg') {
        elem.innerHTML = 'Файл должен быть jpeg картинкой';
    } else if (files[0].size > 512000) {
        elem.innerHTML = 'Слишком большой размер - 512кб';
    } else {
        var reader = new FileReader();
        reader.onload = (function () {
            return function (e) {
                elem.innerHTML = '<img src="' + e.target.result + '">';
            }
        })(files[0]);
        reader.readAsDataURL(files[0]);
        document.getElementById('sendPhoto').removeAttribute('disabled');
    }
}
function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

// Setup the dnd listeners.
var dropZone = document.getElementById('dropzoneWrap');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);