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