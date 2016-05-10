body.addEventListener('click', function (e) {
    e.preventDefault();
    if (e.target.id == 'signin') {
        var name = inputName.value,
            login = inputLogin.value;
        register(name, login);
    } else if (e.target.id == 'sendMessage') {
        sendMessage(messageInput.value.trim());
    } else if (e.target.id == 'myPhoto') {
        dropzoneWrap.innerHTML = dropzoneTemplate();
    } else if (e.target.id == 'sendPhoto') {
        sendPhoto();
    } else if (e.target.id == 'closewindow') {
        dropzoneWrap.innerHTML = "";
    } else if (e.target.id == 'logout') {
        localStorage.clear();
        window.location.reload();
    }
});