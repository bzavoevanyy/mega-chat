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