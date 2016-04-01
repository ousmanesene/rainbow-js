function RainbowVM(name, vm, vmId, withElements, api){
    "use strict";
    let self = this;
    let tools = new RainbowTools();
    let dom = new RainbowDom(name, vm, vmId, withElements);
    
    self.name = name;
    self.vm = vm;
    self.vmId = vmId;
    self.api = api;
    self.proxy = dom.proxy;
    self.keys = dom.keys;
    self.observableList = dom.observableList;
    dom.getAllMatchingVM();
    
    self.getAPI = function(){
        if (typeof self.api !== "undefined" && self.api !== null){
            let request = new RainbowRequest(self.api, self.proxy, self.name);
            for (let i = 0; i < self.api.length; i++){
                request.ajax(i);
            }
            console.log("ok");
        }
    };
    
    self.getAPI();
    
    return self.vm;
}