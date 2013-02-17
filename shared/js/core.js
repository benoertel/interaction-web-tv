/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

function App(config, callback) {
    this.config = config;
    this.callback = callback;

    this.scriptsToLoad = config.scripts.length + config.stylesheets.length + config.templates.length;
    this.scriptsLoaded = 0;
   
    this.loadScripts(config.scripts);
    this.loadStylesheets(config.stylesheets);
    this.loadTemplates(config.templates);
};

App.prototype.loadScripts = function(scripts) {
    for (var i in scripts) {
        var app = this;

        $.getScript(scripts[i]).done(function(script, textStatus) {
            app.scriptLoaded();
        }).fail(function(jqxhr, settings, exception) {
            console.log(jqxhr);
        });
    }
};

App.prototype.loadStylesheets = function(stylesheets) {
    for (var i in stylesheets) {
        $("head").append($('<link rel="stylesheet" href="' + stylesheets[i] + '" type="text/css" media="screen" />'));
        this.scriptLoaded();
    }
};

App.prototype.loadTemplates = function(templates) {
    for (var i in templates) {
        $("head").append($('<link rel="template" href="' + templates[i].location + '" type="text/css" id="' + templates[i].id + '" />'));
        this.scriptLoaded();
    }
};

App.prototype.scriptLoaded = function() {
    this.scriptsLoaded++;
    if(this.scriptsToLoad == this.scriptsLoaded) {
        this.callback();
    }
}