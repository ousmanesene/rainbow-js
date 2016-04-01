function RainbowDom(name, vm, vmId, withElements){
    "use strict";
    let self = this;
    let capture = false;
    let loopVal = "";
    let tools = new RainbowTools();
    
    let bindSelectNode = function(parentNode, key){
        let parentNodeName = parentNode.nodeName.toLowerCase();
        if (parentNodeName === "select" && self.vm[key].selectedIndex !== "undefined"){
            let index = self.vm[key].selectedIndex;
            
            if (typeof parentNode.childNodes[index] !== "undefined"){
                parentNode.childNodes[index].selected="selected";
            }
        }
    };
    
    let createRainbowContext = function(parentNode, cloneList, arr){
        for (let h = 0; h < arr.length; h += 1){
            new RainbowVM("with", arr[h], self.vmId, cloneList[h]); 
            for (let i = 0; i < cloneList[h].length; i += 1){
                parentNode.appendChild(cloneList[h][i]);
            }
        }
        capture = false;
        loopVal = "";
    };
    
    let bindLoopNode = function(parentNode, defaultNode, arr, key){
        let cloneList = tools.getClones(defaultNode, arr.length);
        
        tools.removeChildrenNode(parentNode);
        createRainbowContext(parentNode, cloneList, arr);
        bindSelectNode(parentNode, key);
    };
    
    let replaceTokenPositions = function(arr, i){
        let position = null;
        
        for (let j = 0; j < arr[i].tokenPositions.length; j += 1){
            position = arr[i].tokenPositions[j];
            arr[i].parts[position] = processInnerParts(String(arr[i].defaultParts[position]));
        }
        
        return position;
    };
    
    let shouldBindLoop = function(arr, i, position, infos){
        let [key, type, prop] = infos;
        if (type === "with"){
            if (Array.isArray(arr[i].parts[position])){
                bindLoopNode(arr[i].node, arr[i].defaultNode, arr[i].parts[position], key);
            }
        }
        else {
            tools.setProp(arr, i, prop);
        }
    };
    
    let replaceParts = function(key, type, prop){
        let arr = self.observableList[type][key];
        let position = null;
        let infos = [key, type, prop];
        
        for (let i = 0; i < arr.length; i += 1){
            position = replaceTokenPositions(arr, i);
            shouldBindLoop(arr, i, position, infos);
        }
    };
    
    let bindTextNode = function(mInfo){
        for (let i = 0; i < mInfo.infos.length; i += 1){
            let key = mInfo.infos[i].property;
            if (typeof self.vm[key] !== "undefined"){
                if (typeof self.observableList.text[key] === "undefined"){
                    self.observableList.text[key] = [];
                }
                self.observableList.text[key].push(mInfo);
                replaceParts(key, "text", "nodeValue");
            }
        }
    };
    
    let bindInputTextNode = function(mInfo){
        let key = mInfo.infos[0].property;
        if (typeof self.vm[key] !== "undefined"){
            if (typeof self.observableList.input[key] === "undefined"){
                self.observableList.input[key] = [];
            }
            self.observableList.input[key].push(mInfo);
            replaceParts(key, "input", "value");
        }
    };
    
    let bindInputRadioNode = function(mInfo){
        let key = mInfo.infos[0].property;
        if (typeof self.vm[key] !== "undefined"){
            if (typeof self.observableList.input[key] === "undefined"){
                self.observableList.input[key] = [];
            }
            self.observableList.input[key].push(mInfo);
            replaceParts(key, "input", "checked");
        }
    };
    
    let bindInputCheckboxNode = function(mInfo){
        let key = mInfo.infos[0].property;
        if (typeof self.vm[key] !== "undefined"){
            if (typeof self.observableList.input[key] === "undefined"){
                self.observableList.input[key] = [];
            }
            self.observableList.input[key].push(mInfo);
            replaceParts(key, "input", "checked");
        }
    };
    
    let bindWith = function(node, str){
        let key = str.replace("{{#", "").replace("}}", "");
        let parentNode = node.parentNode;
        parentNode.removeChild(parentNode.lastChild);
        parentNode.removeChild(parentNode.firstChild);
        let mInfo = tools.getMustacheInfo("{{" + key + "}}", parentNode, "{{" + key + "}}");
        let k = mInfo.infos[0].property;
        if (self.vm[k] !== "undefined"){
            if (typeof self.observableList.with[k] === "undefined"){
                self.observableList.with[k] = [];
            }
            self.observableList.with[k].push(mInfo);
            replaceParts(k, "with", "with");
        }
        else{
            node.parentNode.style.visibility = "hidden";
        }
    };
    
    let getTextElementToBind = function(text, node){
        if (text.indexOf("{{#") !== -1){
            capture = true;
            loopVal = text.replace("#", "/");
            bindWith(node, text);
        }
        else if (!capture){
            bindTextNode(tools.getMustacheInfo(text, node, node.nodeValue));
        }
    };
    
    let getInputNodeToBind = function(mInfo){
        let nodeType = tools.getAttributeValue(mInfo.node, "type");
        
        if (nodeType === "text" || nodeType === "password" || nodeType === "email"){
            bindInputTextNode(mInfo);
        }
        else if (nodeType === "checkbox"){
            bindInputCheckboxNode(mInfo);
        }
        else if (nodeType === "radio"){
            bindInputRadioNode(mInfo);
        }
    };
    
    let getElementToBind = function(node, k1){
        let matches = tools.getMatches(node, k1, "elementsTobind");
        
        if (matches !== null && k1 === "value"){
            getInputNodeToBind(tools.getMustacheInfo(matches[0], node, node.value));
        }
        else if (matches !== null && k1 === "nodeValue"){
            getTextElementToBind(matches[0], node);
        }
    };
    
    let shouldCapture = function(node){
        if (node.nodeName === "#text"){
            getElementToBind(node, "nodeValue");
        }
        else if (node.nodeName === "INPUT" && !capture){
            getElementToBind(node, "value");
        }
    };
    
    let getAllElementsToBind = function(nodeList){
        for (let i = 0; i < nodeList.length; i += 1){
            shouldCapture(nodeList[i]);
            if (!capture){
                getAllElementsToBind(nodeList[i].childNodes);
            }
        }
    };
    
    let isAttributeValueOf = function(element, cAttr, nodeName, attrK, attrV){
        if (cAttr.nodeName === nodeName && cAttr[attrK] === attrV){
            getAllElementsToBind(element.childNodes);
        }
    };
    
    let loopOnAttributes = function(el, nodeName, attrK, attrV){
        for (let i = 0; i < el.attributes.length; i += 1){
            isAttributeValueOf(el, el.attributes[i], nodeName, attrK, attrV);
        }
    };
    
    let loopOnVmBindElements = function(vmBindElements){
        for (let i = 0; i < vmBindElements.length; i += 1){
            if (self.name === "with"){
                getAllElementsToBind(vmBindElements[i].childNodes);
            }
            else {
                loopOnAttributes(vmBindElements[i], "vm.bind", "value", name);
            }
        }
        setObservables();
    };
    
    let processMustache = function(element, key, context){
        let myVar = self.vm;
        let value = tools.getContextValue(context);
        let nodeName = context.nodeName.toLowerCase();
        let max = element.infos.length;
        for (let i = 0; i < max; i += 1){
            let result = null;
            let obj = element.infos[i];
            let prop = obj.property;
            let type = obj.type;
            let pType = typeof myVar[prop];
            
            if (pType !== "undefined" && pType === "function" && pType === type){
                result = myVar[prop](key, value);
                if (result !== null){
                    value = result;
                }
            }
            else if (pType === "object" && type === "property" && nodeName === "select" && (i + 1) >= max){
                myVar.selectedIndex = value;
            }
            else if (pType === "object" && type === "property"){
                myVar = myVar[prop];
            }
            else if (pType !== "undefined" && type === "property"){
                myVar[prop] = value;
            }
            else if (pType !== "undefined" && type === "array"){
                myVar = myVar[prop];
            }
            
            if ((i + 1) >= max){
                self.proxy[key] = self.vm[key];
            }
        }
    };
    
    let processInnerParts = function(str, j){
        let myVar = self.vm;
        let result = str;
        let pattern = /\w+|\[|\]/gi;
        let parts = str.match(pattern);
        let _capture = false;
        
        if (typeof j === "undefined"){
            j = 0;
        }
        
        for (let i = j; i < parts.length; i += 1){
            let value = parts[i];
            
            if (parts[i] === "[" && !_capture){
                _capture = true;
                value = processInnerParts(str, i + 1);
                result = myVar[value];
                myVar = result;
            }
            else if (parts[i] === "]"){
                _capture = false;
                if (j > 0){
                    break;
                }
            }
            else if (!_capture){
                if (typeof myVar[value] !== "undefined"){
                    result = myVar[value];
                    myVar = result;
                }
                else if (j > 0){
                    result = value;
                }
            }
        }
        
        return result;
    };
    
    let setObservables = function(){
        for (let key1 in self.observableList.input){
            setOnInputChange(key1);
        }
        for (let key2 in self.observableList.with){
            setOnWithChange(key2);
        }
    };
    
    let setOnInputChange = function(key){
        let elements = self.observableList.input[key];
        
        for (let i = 0; i < elements.length; i += 1){
            let node = elements[i].node;
            let currentElement = elements[i];
            setEventListeners(node, currentElement, key);
        }
    };
    
    let setOnWithChange = function(key){
        let elements = self.observableList.with[key];
        
        for (let i = 0; i < elements.length; i += 1){
            let node = elements[i].node;
            let currentElement = elements[i];
            setEventListeners(node, currentElement, key);
        }
    };
    
    let setEventListeners = function(node, currentElement, key){
        node.addEventListener("change", function(e) {
            e.preventDefault();
            processMustache(currentElement, key, this);
            let type = tools.getAttributeValue(this, "type");
            if (type === "radio"){
                for (let i = 0; i < self.observableList.input[key].length; i += 1){
                    let element = self.observableList.input[key][i];
                    processMustache(element, key, element.node);
                }
            }
        });
    };
    
    let changeDomElements = function(key, oVal){
        if (typeof self.observableList.text[key] !== "undefined"){
            replaceParts(key, "text", "nodeValue");
        }
        else if (typeof self.observableList.input[key] !== "undefined"){
            let elements = self.observableList.input[key];
            for (let i = 0; i < elements.length; i += 1){
                let nodeType = tools.getAttributeValue(elements[i].node, "type");
                
                if (nodeType === "input"){
                    replaceParts(key, "input", "value");
                }
                else if (nodeType === "checkbox"){
                    replaceParts(key, "input", "checked");
                }
                else if (nodeType === "radio"){
                    replaceParts(key, "input", "checked");
                }
            }
        }
        else if (typeof self.observableList.with[key] !== "undefined"){
            replaceParts(key, "with", "with");
        }
    };
    
    let setOnDataChange = function(){
        self.proxy = new Proxy(self.vm, handler);
        self.vm.proxy = self.proxy;
    };
    
    let handler = {
        set: function(obj, k, v){
            if (typeof obj[k] !== "function"){
                let oVal = obj[k];
                obj[k] = v;
                tools.localPush(self.vmId, obj);
                changeDomElements(k, oVal);
            }
            return true;
        }
    };
    
    self.name = name;
    self.vm = vm;
    self.vmId = vmId;
    self.proxy = null;
    self.keys = Object.keys(self.vm);
    self.observableList = {"input":{}, "text":{}, "with":{}};
    
    self.getAllMatchingVM = function(){
        if (self.name === "with"){
            loopOnVmBindElements(withElements);
        }
        else {
            loopOnVmBindElements(tools.getAllElementsWithAttribute("vm.bind"));
        }
    };
    
    setOnDataChange();
    
    return self;
}