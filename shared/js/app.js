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
        $.getScript(scripts[i]);
        this.scriptLoaded();
    }
};

App.prototype.loadStylesheets = function(stylesheets) {
    for (var i in stylesheets) {
        if (document.createStyleSheet){
            document.createStyleSheet(stylesheets[i]);
        }
        else {
            $("head").append($('<link rel="stylesheet" href="' + stylesheets[i] + '" type="text/css" media="screen" />'));
        }
            
                    this.scriptLoaded();
    }
};

App.prototype.loadTemplates = function(templates) {
    for (var i in templates) {
        this.scriptLoaded();
    }
};

App.prototype.scriptLoaded = function() {
    this.scriptsLoaded++;
    
    if(this.scriptsToLoad == this.scriptsLoaded) {
        this.callback();
    } else {
        console.log('need to go');
    }
}