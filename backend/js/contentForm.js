function ContentForm(helper){
    this.helper = helper;
    this.content = [];
    this.type = 'contentFreetextTemplate';
    this.data = [];
    this.websocket = null;
    this.channel = 'hurz';
    
}

ContentForm.prototype.render = function(websocket, channelList) {
    this.websocket = websocket;
    //  this.channelList = channelList;
    console.log('render me');
    
    var context = this;
    $("#contentHeaderTemplate").Chevron("render", {}, function(resultHeader){
        $("#contentFooterTemplate").Chevron("render", {}, function(resultFooter){
            $("#" + context.type).Chevron("render", context.data, function(result){
                $('#content-form').html(resultHeader + result + resultFooter);
                context.initValidation();
            });
        });
    });
}

ContentForm.prototype.initValidation = function() {
    var context = this;
    $("input,select,textarea").not("[type=submit]").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function(form, event, errors) {
            context.errorContentForm(form, event, errors);
        },
        submitSuccess: function(form, event) {
            context.storeContentForm(form, event);
        }
    });
            
    $('.input-datetime').datetimepicker({
        language: 'de',
        format: 'dd.MM.yyyy hh:mm:ss'
    });
}

ContentForm.prototype.errorContentForm = function(form, event, errors) {
    this.helper.alert('block', 'Bitte fülle alle Pflichtfelder aus.', '#contentTextForm');

    event.preventDefault();
}

ContentForm.prototype.storeContentForm = function(form, event) {
    var context = this;
    
    var data = $('.contentForm input, .contentForm select, .contentForm textarea').serializeArray();
    var doc = this.helper.prepareCouchData(data);

    if(doc.type == 'content' && doc.category == 'freetext') {
        doc.startDate = this.helper.dateToArr(new Date(this.helper.formatDate(doc.startDate)));
        doc.endDate = this.helper.dateToArr(new Date(this.helper.formatDate(doc.endDate)));
    }
    doc.channel = this.channel;

    $.couch.db("persad").saveDoc(doc, {
        success: function(data) {
            var data = {
                'method': 'channel-content-updated',
                'channel': context.channel
            };

            context.websocket.send(JSON.stringify(data));
            
            context.helper.alert('success', 'Der Zusatzcontent wurde erfolgreich hinzugefügt.', '#contentTextForm');
            
        //  updateContentList(doc.channel);
        },
        error: function(status) {
            context.helper.alert('error', 'Der Zusatzinhalt konnte nicht hinzugefügt werden.', '#contentTextForm');
        }
    });

    event.preventDefault();
}