function User(helper){
    this.helper = helper;
    this.credentials =  null;
}

/**
 * Login an existing user.
 */
User.prototype.login = function(websocket) {
    $('#loginForm .alert').remove();
    $('#loginForm .loader').remove();
        
    $('#loginForm').prepend('<div class="loader"></div>');
        
    this.credentials = {
        'method': 'login-user',
        'username': $('#username').val(),
        'password': $('#password').val()
    };
    
    if(websocket.status == 'connected') {
        websocket.send(this.credentials);
    } else {
        var alert = this.helper.createAlert('error', 'Keine Anmeldung möglich, es besteht keine Verbindung zum Server.');
        $('#loginForm').prepend(alert);
        $('#loginForm .loader').remove();
    }
};

User.prototype.loginResponse = function(data, tv, websocket) {
    $('#loginForm .loader').remove();
    var alert = this.helper.createAlert(data.status, data.message);

    $('#loginForm').prepend(alert);
    if(data.status == 'success') {
        tv.subscribe(websocket);
        
        $('#loginForm').prepend('<div class="loader"></div>');
        window.setTimeout(function() {
            $('#loginModal').modal('hide');
        }, 2000);
    }
};

/**
 * Register a new user in the system.
 */
User.prototype.register = function(websocket) {
    $('#signupForm .alert').remove();
    $('#signupForm .loader').remove();
        
    var data = {
        'method': 'register-user',
        'username': $('#username').val(),
        'password': $('#password').val(),
        'age': $('#age').val(),
        'sex': $('#sex').val()
    };
    
    if(websocket.status == 'connected') {
        websocket.send(data);
    } else {
        var alert = this.helper.createAlert('error', 'Keine Registrierung möglich, es besteht keine Verbindung zum Server.');
        $('#signupForm').prepend(alert);
        $('#signupForm .loader').remove();
    }
};

User.prototype.registerResponse = function(data) {
    $('#loginForm .loader').remove();
        
    var alert = this.helper.createAlert(data.status, data.message);
        
    if(data.status == 'success') {
        $('#signupModal').modal('hide');
        this.showLoginForm(function() {
            $('#loginForm').prepend(alert);
        })   
            
    } else {
        $('#signupForm').prepend(alert);

    }
};

User.prototype.showLoginForm = function(modalOptions) {
    $('.modal').modal('hide');
        
    $('#loginFormTemplate').Chevron('render', {}, function(result){
        $('#modal').html(result);
        $('#loginModal').modal(this.modalOptions);
    });  
};
    
User.prototype.showSignupForm = function(modalOptions) {
    $('.modal').modal('hide');
        
    $('#signupFormTemplate').Chevron('render', {}, function(result){
        $('#modal').html(result);
        $('#signupModal').modal(this.modalOptions);
    });  
};