function RainbowVM(name, vm, vmId, withElements, api){
    "use strict";
    let self = this;
    let tools = new RainbowTools();
    
    self.name = name;
    self.vm = vm;
    self.vmId = vmId;
    self.api = api;
    self.api.collectionListeners = [];
    self.api.callbacks = vm.callbacks;

    self.vm.rebind = () => {
        let dom = new RainbowDom(name, vm, vmId, withElements);
        self.proxy = dom.proxy;
        self.keys = dom.keys;
        self.observableList = dom.observableList;
        dom.getAllMatchingVM();
    };
    
    self.vm.addCollectionListeners = (handler) => {
        self.api.collectionListeners.push(handler);
    };
    
    self.vm.getAPI = function(){
        if (typeof self.api !== "undefined" && self.api !== null){
            let request = new RainbowRequest(self.api, self.proxy, self.name);
            for (let i = 0; i < self.api.length; i++){
                request.ajax(i);
            }
        }
    };

    self.vm.rebind();
    self.vm.getAPI();
    
    return self.vm;
}
