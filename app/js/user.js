function User(helper, modalOptions){
    this.helper = helper;
    this.credentials =  null;
}

User.prototype.login = function(websocket) {
    $('#loginForm .alert').remove();
    $('#loginForm .loader').remove();
        
    $('#loginForm').prepend('<div class="loader"></div>');
        
    this.credentials = {
        'method': 'login-user',
        'username': $('#username').val(),
        'password': $('#password').val()
    };
        
    websocket.send(this.credentials);
};

User.prototype.loginResponse = function(data, tv, websocket) {
    $('#loginForm .loader').remove();
    var alert = this.helper.createAlert(data.status, data.message);
        
    $('#loginForm').prepend(alert);
    if(data.user) {
        $('span.username').html(data.user.username);
    }
    if(data.status == 'success') {
        tv.subscribe(websocket);
        $('#loginForm').prepend('<div class="loader"></div>');
        window.setTimeout(function() {
            $('#loginModal').modal('hide');
        }, 2000);
    }
};

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
        
    websocket.send(data);
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
        
    $("#loginFormTemplate").Chevron("render", {}, function(result){
        $('#modal').html(result);
        $('#loginModal').modal(this.modalOptions);
    });  
};
    
User.prototype.showSignupForm = function(modalOptions) {
    $('.modal').modal('hide');
        
    $("#signupFormTemplate").Chevron("render", {}, function(result){
        $('#modal').html(result);
        $('#signupModal').modal(this.modalOptions);
    });  
};