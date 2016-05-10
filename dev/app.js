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
var source = document.getElementById('logintemplate').innerHTML;
var template = Handlebars.compile(source);
var message = document.getElementById('message').innerHTML;
var messageTemplate = Handlebars.compile(message);
var sendForm = document.getElementById('sendForm').innerHTML;
var sendFormTemplate = Handlebars.compile(sendForm);
var profileSource = document.getElementById('profileTemplate').innerHTML;
var profile = Handlebars.compile(profileSource);
var usersSource = document.getElementById('usersTemplate').innerHTML;
var usersTemplate = Handlebars.compile(usersSource);
var dropzoneSource = document.getElementById('dropzoneTemplate').innerHTML;
var dropzoneTemplate = Handlebars.compile(dropzoneSource);

Handlebars.registerHelper('tooltip', function(message) {

    var result = '<div class="panel panel-danger"><div class="panel-heading"><div class="panel-title">Ошибка!!!</div></div><div class="panel-body">'+message+'</div></div>';

    return new Handlebars.SafeString(result);
});
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
var connection;
var files;
var host = 'localhost:5000'; // Здесь можно указать любой адресс сервера - будет применено ко всему коду
window.onload = function () {
    // Проверяем - если уже были в чате, то берем данные из localStorage, если нет - выводим форму
    if (localStorage.getItem('name') == null) {
        loginform.innerHTML = template(); // hbs - выводим форму
    } else {
        register(localStorage.getItem('name'), localStorage.getItem('login'));
    }
};
function register(name, login) {
    if (login.match(/^[a-zA-Z0-9]+$/)) { // Проверяем логин
        if (name.length >= 2) {
            connection = new WebSocket('ws://' + host);
            connection.onmessage = function (e) {
                //пришло сообщение от сервер, надо его обработать
                var res = JSON.parse(e.data);
                switch (res.op) {
                    case 'token':
                        localStorage.setItem('name', name);
                        localStorage.setItem('login', login);
                        localStorage.setItem('token', res.token);
                        loginform.innerHTML = ""; // убираем форму
                        showMessages(res.messages); // выводим сообщения, полученные от сервера
                        sendWrap.innerHTML = sendFormTemplate(); // hbs - выводим форму отправки сообщения
                        // далее выводим профайл пользователя и список юзеров при помощи hbs
                        document.getElementById('profile').innerHTML = profile({name: name, login: login, host:host});
                        res.users.forEach(function (e) {
                            var newUser = document.createElement('div');
                            newUser.dataset.login = e.login;
                            newUser.innerHTML = usersTemplate({users: [{host:host,login: e.login, name: e.name, date: new Date().getTime()}]});
                            document.getElementById('users').appendChild(newUser);
                        });
                        break;
                    case 'message':
                        showMessages([res]); // выводим сообщения
                        break;
                    case 'user-change-photo':
                        var photos = document.getElementsByClassName('photos');
                        for (var i = 0; i < photos.length; i++) {
                            if (photos[i].dataset.login == res.user.login) {
                                photos[i].src = 'http://'+host+'/photos/' + res.user.login + '?' + new Date().getTime();
                            }
                        }
                        break;
                    case 'user-enter':
                        var newUser = document.createElement('div');
                        newUser.dataset.login = res.user.login;
                        newUser.innerHTML = usersTemplate({users: [{host:host,login: res.user.login, name: res.user.name, date:new Date().getTime()}]});
                        document.getElementById('users').appendChild(newUser);
                        break;
                    case 'user-out':
                        var users = document.getElementById('users').childNodes;
                        for (var y = 0; y < users.length; y++) {
                            if (users[y].dataset.login == res.user.login) {

                                document.getElementById('users').removeChild(users[y]);
                            }
                        }
                        break;
                    case 'error':
                        if (res.sourceOp == 'reg') {
                            loginform.innerHTML = template({tool: true, message: res.error.message});
                        }
                        break;
                }
            };
            connection.onerror = function (y) {
                //ошибка соединения
                console.log(y);

            };
            connection.onclose = function (e) {
                //соединение было закрыто
                console.log(e);
                localStorage.removeItem('token');
            };
            connection.onopen = function (e) {
                var res = {
                    op: 'reg',
                    data: {
                        name: name,
                        login: login
                    }
                };
                connection.send(JSON.stringify(res));
            };
        }
    } else {
        loginform.innerHTML = template({tool: true, message:'Логин должен содержать только цифры и буквы'});
    }
}