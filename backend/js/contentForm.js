function ContentForm(helper, contentTypes){
    this.helper = helper;
    this.content = [];
    this.contentTypes = contentTypes;
    this.type = 'freetext';
    this.data = [];
    this.websocket = null;
    this.channel;   
}

ContentForm.prototype = {
    set contentType(contentType) {
        this.contentTypeChanged(contentType);
    }
}

ContentForm.prototype.render = function(websocket) {
    this.websocket = websocket;
    
    var context = this;
    $("#contentHeaderTemplate").Chevron("render", {contentTypes: context.contentTypes}, function(resultHeader){
        $("#contentFooterTemplate").Chevron("render", {}, function(resultFooter){
            $('#content' + context.helper.ucfirst(context.type) + 'Template').Chevron("render", context.data, function(result){
                $('#content-form').html(resultHeader + result + resultFooter);
                context.initValidation();
                $('#contentType').val(context.type);
            });
        });
    });
}

ContentForm.prototype.renderCustomPart = function() {
    var context = this;
    $('#content' + context.helper.ucfirst(context.type) + 'Template').Chevron("render", context.data, function(result){
        $('#custom-form').html(result);
        context.initValidation();
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

    if(doc.type == 'content') {
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
            context.render(context.websocket);
            
            $(window).trigger('hashchange');
        },
        error: function(status) {
            context.helper.alert('error', 'Der Zusatzinhalt konnte nicht hinzugefügt werden.', '#contentTextForm');
        }
    });

    event.preventDefault();
}

ContentForm.prototype.contentTypeChanged = function(contentType) {
    this.type = contentType;
    this.renderCustomPart();
}