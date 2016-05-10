function sendPhoto() { // Отправляем новое фото
    var data = new FormData();
    data.append('photo', files[0]);
    data.append('token', localStorage.getItem('token'));
    new Promise(function (resolve) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://' + host + '/upload');
        xhr.onload = function () {
            if (xhr.status == 200) {
                resolve(xhr.response)
            } else {
                throw e;
            }
        };
        xhr.send(data);
    }).catch(function (e) {
        console.log(e.message);
    }).then(function () {
        dropzoneWrap.innerHTML = '';
    });
}
function sendMessage(message) { //Отправляем сообщения на сервер
    var data = {
        op: "message",
        token: localStorage.getItem('token'),
        data: {
            body: message
        }
    };
    connection.send(JSON.stringify(data));
    messageInput.value = "";
}
function showMessages(mess) { // Выводим сообщения с сервера
    var obj = {};
    if (messages.childNodes.length > 50) {
        var el = messages.firstElementChild;
        messages.removeChild(el);
    }
    mess.forEach(function (y) {

        obj.name = y.user.name;
        obj.login = y.user.login;
        obj.text = y.body;
        obj.date = new Date(y.time).toTimeString();
        obj.host = host;
        var elem = document.createElement('div');
        elem.innerHTML = messageTemplate(obj);
        messages.appendChild(elem);
        messages.scrollTop = 9999;
    });
}