function User(helper, content, modalOptions, websocket){
    this.helper = helper;
    this.content = content;
    this.modalOptions = modalOptions;
    this.credentials =  null;
    
    this.websocket = websocket;
}

User.prototype.login = function() {
    $('#loginForm .alert').remove();
    $('#loginForm .loader').remove();
        
    $('#loginForm').prepend('<div class="loader"></div>');
        
    this.credentials = {
        'method': 'login-user',
        'username': $('#username').val(),
        'password': $('#password').val()
    };
        
    this.websocket.send(JSON.stringify(this.credentials));
};

User.prototype.loginResponse = function(data) {
    $('#loginForm .loader').remove();
        
    var alert = this.helper.createAlert(data.status, data.message);
        
    $('#loginForm').prepend(alert);
    if(data.user) {
        $('span.username').html(data.user.username);
    }
    if(data.status == 'success') {
        this.content.subscribe();
        $('#loginForm').prepend('<div class="loader"></div>');
        window.setTimeout(function() {
            $('#loginModal').modal('hide');
        }, 2000);
    }
};

User.prototype.registerResponse = function() {
    $('#signupForm .alert').remove();
    $('#signupForm .loader').remove();
        
    var data = {
        'method': 'register-user',
        'username': $('#username').val(),
        'password': $('#password').val(),
        'age': $('#age').val(),
        'sex': $('#sex').val()
    };
        
    this.websocket.send(JSON.stringify(data));
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

User.prototype.showLoginForm = function(callback) {
    $('#loginModal').modal('hide');
    $('#signupModal').modal('hide');
        
    $("#loginFormTemplate").Chevron("render", {
        }, function(result){
            $('#modal').html(result);
            $('#loginModal').modal(this.modalOptions);
                
            if(callback) {
                callback();
            }
        });  
};
    
User.prototype.showSignupForm = function() {
    $('#loginModal').modal('hide');
    $('#signupModal').modal('hide');
        
    $("#signupFormTemplate").Chevron("render", {
        }, function(result){
            $('#modal').html(result);
            $('#signupModal').modal(this.modalOptions);
        });  
};