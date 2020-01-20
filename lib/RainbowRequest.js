function RainbowRequest(api, proxy, id){
    "use strict";
    let self = this;
    let httpRequest = new XMLHttpRequest();
    
    let canDoRequest = function(){
        if (!httpRequest) {
            throw("Giving up :( Cannot create an XMLHTTP instance)");
        }
    };
    
    let processKeys = function(){
        if (typeof self.currentObject !== "undefined" && typeof self.currentObject.key !== "undefined" && self.result.trim() !== ""){
            let prop = self.currentObject.key;
            let json = JSON.parse(self.result);
            self.api.callbacks[prop](json[prop]);
            self.api.collectionListeners.forEach((handler) => {handler();});
        }
        else {
            console.log("no keys to process");
        }
    };
    
    let doRequest = function(){
        httpRequest.onreadystatechange = alertContents;
        httpRequest.open(self.currentObject.method, self.currentObject.url);
        send();
        //httpRequest.setRequestHeader(JSON.stringify(self.headers));
    };
    
    let alertContents = function() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            self.result = httpRequest.responseText;
            processKeys();
            launchCallback();
        }
    };
    
    let send = function(){
        if (typeof data !== "undefined"){
            httpRequest.send(encodeURIComponent(JSON.stringify(data)));
        }
        else{
            httpRequest.send();
        }
    };
    
    let launchCallback = function(){
        if (typeof self.currentObject !== "undefined" && typeof self.currentObject.callback === "function"){
            self.currentObject.callback();
        }
    };
    
    self.api = api;
    self.id = id;
    self.proxy = proxy;
    self.result = null;
    self.currentObject = null;
    self.headers = {"Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"};
    
    self.ajax = function(i){
        try{
            if (i in self.api){
                self.currentObject = self.api[i];
                canDoRequest();
                doRequest();
            }
        }
        catch(e){
            self.result = e;
        }
    };
    
    
    return self;
}
