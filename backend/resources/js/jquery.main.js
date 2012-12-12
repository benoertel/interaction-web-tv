$(document).ready(function(){
    $.couch.urlPrefix = "http://192.168.1.9:2013/couch";

    $(window).bind('hashchange', hashChanged);
    init();
   
    function init() {
        hashChanged();
        updateChannelList();
        showForm('contentTextTemplate');

    }
    
    function hashChanged() {
        var formData = [];
        
        $.each(window.location.hash.replace("#", "").split("&"), function (i, urlParam) {
            urlParam = urlParam.split("=");
            formData[urlParam[0]] = urlParam[1]; 
        });
        
        updateShowList(formData.channel);
        updateContentList(formData.channel);
    }
    
    /**
     * Sync the list of channels with the database.
     */
    function updateChannelList() {
        $.couch.db("persad").openDoc("channelList", {
            success: function(data) {
                $("#channelListTemplate").Chevron("render", {
                    'channels': data.channels
                }, function(result){
                    $('#channel-list').html(result);
                    
                    // re-calculate the width based on the added channels
                    var sum = 0;
                    $('#channel-list ul li').each( function(){
                        sum += $(this).width() + 3;
                    });

                    $('#channel-list ul').width(sum);
                });
                
            },
            error: function(status) {
                alert(status);
            }
        });
    }
    
    /**
     * Load the shows for a specific channel.
     */
    function updateShowList(channel) {
        $.couch.db("persad").view("show/by-channel", {
            'key': channel,
            
            success: function(data) {
                var dataList = prepareListData(data);

                $("#showListTemplate").Chevron("render", {
                    'shows': dataList
                }, function(result){
                    $('#show-list').html(result);
                });
            },
            error: function(status) {
                console.log(status);
            }
        });
    }
    
    /**
     * Load the additional content for a specific channel.
     */
    function updateContentList(channel) {
        $.couch.db("persad").view("content/by-channel", {
            'key': channel,
            
            success: function(data) {
                var dataList = prepareListData(data);

                $("#contentListTemplate").Chevron("render", {
                    'contents': dataList
                }, function(result){
                    $('#content-list').html(result);
                });
            },
            error: function(status) {
                console.log(status);
            }
        });
    }

    function showForm(type, data) {
        $("#" + type).Chevron("render",
            data
            , function(result){
                $('#content-form').html(result);
                initValidation();
            });
            
        
    }
    
    /**
     * Valiate a submitted form and persist it to the database.
     */
    function initValidation() {
        $("input,select,textarea").not("[type=submit]").jqBootstrapValidation({
            preventSubmit: true,
            submitError: errorContentForm,
            submitSuccess: storeContentForm
        });
    }
  
    function errorContentForm(form, event, errors) {
        console.log('error');
        
        event.preventDefault();
    }
    
    function storeContentForm(form, event) {
        var data = $('.contentForm input, .contentForm select, .contentForm textarea').serializeArray();
        var doc = prepareCouchData(data);

        $.couch.db("persad").saveDoc(doc, {
            success: function(data) {
                alert('saved');
            },
            error: function(status) {
                alert(status);
            }
        });

        event.preventDefault();
    }
    
    /**
     * Prepare couch db list data for mustache.
     */
    function prepareListData(data) {
        var dataList = [];
         
        $.each(data.rows, function(index, value) { 
            dataList.push(value.value);
        });
         
        return dataList;
    }
    
    /**
     * Prepare form data to match the couchdb json format.
     */
    function prepareCouchData(data) {
        var doc = {};
        
        $.each(data, function(index, value) { 
            doc[value.name] = value.value;
        });
        
        return doc;
    }
    
});