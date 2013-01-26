$(document).ready(function() {
    
    var bookmarks = [];
    var tvId = null;
    var websocket = null;
    var receiveUpdates = true;
    var latestData = null;
    var credentials = null;
    
    var modalOptions = {
        keyboard: false,
        show: true,
        backdrop: 'static'
    }
    
    init();
    setupWebsocket();
    showLoginForm();
    
    window.addEventListener("offline", function(e) {
        updateWebsocketStatus('disconnected');
        updateTvStatus('unavailable');
    })
 
    window.addEventListener("online", function(e) {
        setupWebsocket();
    });

    $('a[rel=tooltip]').tooltip();
    $('a[rel=popover]').popover();
    
    function init() {
        tvId = $.cookie('tvId');
        loadBookmarks(false);
        contentChanged();
    }
    
    function showLoginForm(callback) {
        $('#loginModal').modal('hide');
        $('#signupModal').modal('hide');
        
        $("#loginFormTemplate").Chevron("render", {
            }, function(result){
                $('#modal').html(result);
                $('#loginModal').modal(modalOptions);
                
                if(callback) {
                    callback();
                }
            });  
    }
    
    function showSignupForm() {
        $('#loginModal').modal('hide');
        $('#signupModal').modal('hide');
        
        $("#signupFormTemplate").Chevron("render", {
            }, function(result){
                $('#modal').html(result);
                $('#signupModal').modal(modalOptions);
            });  
    }
    
    $(document).on('click', 'button[data-action], a[data-action]', function(){
        var action = $(this).attr('data-action');

        if(action == 'signup') {
            showSignupForm();
        } else if(action == 'login') {
            showLoginForm();
        } else if(action == 'settings') {
            showSettings();
        } else if(action == 'toggle-updates') {
            toggleReceiveUpdates();
        } else if(action == 'update-settings') {
            updateSettings();
        } else if(action == 'register-user') {
            registerUser();
        } else if(action == 'login-user') {
            loginUser();
        } else if(action == 'bookmark') {
            addBookmark(latestData);
        } else if(action == 'toggle-delete-bookmarks') {
            toggleDeleteBookmarks();
        } else if(action == 'delete-bookmark') {
            deleteBookmark($(this).attr('data-id'));
        }
    });
    
    $(document).on('keypress', 'form', function(e) {
        if (e.which == 13) {
            $(this).parent().next('.modal-footer').children('.btn-success').click();
            return false;
        }
    });
   
    function showSettings(){
        $("#settingsTemplate").Chevron("render", {
            tvId: tvId
        }, function(result){
            $('#modal').html(result);
            $('#settingsModal').modal(modalOptions);
        });
    }
    
    function setupWebsocket() {
        websocket = new WebSocket(websocketUri);

        websocket.onopen = onWebsocketOpen;
        websocket.onerror = onWebsocketError;
        websocket.onclose = onWebsocketClose;
        websocket.onmessage = onWebsocketMessage;
    }
    
    function onWebsocketOpen(event) {
        updateWebsocketStatus('connected');
        if(credentials) {
            websocket.send(JSON.stringify(credentials));
        }
    }
    
    function onWebsocketClose(event) {
        updateWebsocketStatus('disconnected');
        updateTvStatus('unavailable');
        window.setTimeout(function() {
            setupWebsocket()
        }, 5000);
    }
    
    function onWebsocketError(event) {
        alert('error');
    }
    
    function onWebsocketMessage(message) {
        var json = JSON.parse(message.data);

        if(json.method == 'channel-changed') {
            channelChanged(json);
        } else if(json.method == 'content-changed') {
            contentChanged(json.data);
        } else if(json.method == 'login-user-response') {
            loginUserResponse(json);
        } else if(json.method == 'register-user-response') {
            registerUserResponse(json);
        } else if(json.method == 'subscribe-response') {
            subscribeResponse(json);
        } else if(json.method == 'tv-disconnected') {
            tvDisconnected(json);
        }
    }
    
    function updateWebsocketStatus(status) {
        if(status == 'connected') {
            $('#websocket-status i').removeClass('gicon-ws-signal-off');
            $('#websocket-status i').addClass('gicon-ws-signal-on');
            $('#websocket-status').attr('data-status', 'connected');
            $('#websocket-status').attr('data-original-title', 'connection established');
            
        } else if(status == 'disconnected') {
            $('#websocket-status i').removeClass('gicon-ws-signal-on');
            $('#websocket-status i').addClass('gicon-ws-signal-off');
            $('#websocket-status').attr('data-status', 'disconnected');
            $('#websocket-status').attr('data-original-title', 'no connection');
        }
    }
    
    function updateTvStatus(status) {
        if(status == 'available') {
            $('#tv-status i').removeClass('gicon-tv-signal-off');
            $('#tv-status i').addClass('gicon-tv-signal-on');
            $('#tv-status').attr('data-status', 'available');
            $('#tv-status').attr('data-original-title', 'tv is available');
            
        } else if(status == 'unavailable') {
            $('#tv-status i').removeClass('gicon-tv-signal-on');
            $('#tv-status i').addClass('gicon-tv-signal-off');
            $('#tv-status').attr('data-status', 'unavailable');
            $('#tv-status').attr('data-original-title', 'tv is not available');
        }
    }
    
    function toggleReceiveUpdates() {        
        if(!receiveUpdates) {
            $('#live-updates i').removeClass('gicon-play');
            $('#live-updates i').addClass('gicon-pause');
            $('#live-updates').attr('data-original-title', 'receiving live updates');
            receiveUpdates = true;
            
            channelChanged(latestData);
        } else {
            $('#live-updates i').removeClass('gicon-pause');
            $('#live-updates i').addClass('gicon-play');
            $('#live-updates').attr('data-original-title', 'no live updates');
            receiveUpdates = false;
        }
    }
    
    function channelChanged(data) {
        console.log('channel changed');
        
        updateTvStatus('available');
        if(receiveUpdates){
            $('#current-channel').html(data.channel);
            contentChanged(latestData);
        }
    }
    
    function contentChanged(data) {
        console.log('content changed');
        if(data) {
            latestData = data;
        }
        $("#contentFreetextTemplate").Chevron("render", {
            'data': data 
        }, function(result){
            $('#content').html(result);       
        });
    }
    
    function tvDisconnected() {
        updateTvStatus('unavailable');
    }
    
    function subscribe() {
        var data = {
            'method': 'subscribe',
            'tvId': tvId
        };
        
        websocket.send(JSON.stringify(data));
    }
    
    function subscribeResponse(data) {
        if(data.status == 'success'){
            channelChanged(data.tv);
            updateTvStatus('available');
        }
    }
    
    function updateSettings() {
        tvId = $('#tvId').val();

        $.cookie('tvId', tvId, {
            expires: 365
        });
        
        subscribe();
    }
    
    /**
     * User registration and login 
     */
    function registerUser() {
        $('#signupForm .alert').remove();
        $('#signupForm .loader').remove();
        
        var data = {
            'method': 'register-user',
            'username': $('#username').val(),
            'password': $('#password').val(),
            'age': $('#age').val(),
            'sex': $('#sex').val()
        };
        
        websocket.send(JSON.stringify(data));
    }
    
    function registerUserResponse(data) {
        $('#loginForm .loader').remove();
        
        var alert = createAlert(data.status, data.message);
        
        if(data.status == 'success') {
            $('#signupModal').modal('hide');
            showLoginForm(function() {
                $('#loginForm').prepend(alert);
            })   
            
        } else {
            $('#signupForm').prepend(alert);

        }
    }
    
    function loginUser() {
        $('#loginForm .alert').remove();
        $('#loginForm .loader').remove();
        
        $('#loginForm').prepend('<div class="loader"></div>');
        
        credentials = {
            'method': 'login-user',
            'username': $('#username').val(),
            'password': $('#password').val()
        };
        
        websocket.send(JSON.stringify(credentials));
    }
    
    function loginUserResponse(data) {
        console.log(data);
        $('#loginForm .loader').remove();
        
        var alert = createAlert(data.status, data.message);
        
        $('#loginForm').prepend(alert);
        if(data.user) {
            $('span.username').html(data.user.username);
        }
        if(data.status == 'success') {
            subscribe();
            $('#loginForm').prepend('<div class="loader"></div>');
            window.setTimeout(function() {
                $('#loginModal').modal('hide');
            }, 2000);
        }
    }
    
    // ###############
    // ## bookmarks ##
    // ###############
    
    function addBookmark(data) {
        for(var idx in bookmarks) {
            if(bookmarks[idx].id == data._id) {
                alert('already on your list');
                return;
            }
        }
        
        bookmarks.push({
            'id': data._id,
            'link': data.extLink,
            'title': data.title,
            'image': data.thumb
        });
        $.totalStorage('bookmarks', bookmarks);
        loadBookmarks(false);
    }
    
    function loadBookmarks(displayActions) {
        bookmarks = $.totalStorage('bookmarks');
        if(!bookmarks) {
            bookmarks = [];
        }
        
        console.log(bookmarks);
        $("#bookmarksTemplate").Chevron("render", {
            'bookmarks': bookmarks
        }, function(result){
            $('#bookmarks').html(result);
            if(displayActions) {
                        $('#bookmarks .show').show();
            }
        });  
    }
    
    function toggleDeleteBookmarks() {
        console.log('toggle it');
        $('#bookmarks .remove').toggle();
        
        return false;
    }
    
    function deleteBookmark(id) {
        console.log(bookmarks);
        for(var idx in bookmarks) {
            if(bookmarks[idx].id == id) {
                bookmarks.splice(idx, 1);;
                break;
            }
        }
        $.totalStorage('bookmarks', bookmarks);
        loadBookmarks(true);

        return false;
    }
    
    /**
     * Prepare couch db list data for mustache.
     */
    function prepareData(data) {
        data.formatted = {
            'start': parseHourMin(data.startDate),
            'duration': calcDuration(data.startDate, data.endDate, 'min')
        }
        
        return data;
    }
    
    function createAlert(type, text) {
        var classes = 'alert ';
        
        if(type == 'error') {
            classes += ' alert-error';
        } else if(type == 'success') {
            classes += 'alert-success';
        }
        
        return '<div class="' + classes + '">' + text + '</div>';
    }
    
    function parseHourMin(date) {
        return pad(date[3], 2) + ':' + pad(date[4], 2);
    }
    
    function calcDuration(start, end, unit) {
        var diff = Math.abs(new Date(parseDate(start)) - new Date(parseDate(end)));
        
        if(unit == 'min') {
            return Math.floor((diff/1000)/60);
        }
        
        return null;
    }
    
    function parseDate(date) {
        var dateTime = date.split(' ');
        var datePart = dateTime[0].split('-');
        
        return datePart[0] + '/' + datePart[1] + '/' + datePart[2] + ' ' + dateTime[1];        
    }
});