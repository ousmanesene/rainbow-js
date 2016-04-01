function RainbowTools(){
    "use strict";
    let self = this;
    
    self.pattern = {
        elementsTobind: /[\{]{2}[#|/]*[\w_]+\d*(\[\d*|(.)*\])*(\.[^\.][\w_]*\d*|\(\)(?=\.|[\}]{2}|\[)|(\[\d*|(.)*\])*)*[\}]{2}/gi,
        mustacheInfo: /\w+|\(\)|\[|\]|\d/gi,
        replaceParts: /\w+[[^\S]*[^[\}]]*|\(\)|\[|\]|\d|\{\{|\}\}/gi
    };
    
    self.isElementAttributeNull = function(matchingElements, element, attribute){
        if (element.getAttribute(attribute) !== null){
            matchingElements.push(element);
        }
    };
    
    self.getAllElementsWithAttribute = function(attribute){
        return self.loopOnAllElements(document.getElementsByTagName("*"), attribute);
    };
    
    self.loopOnAllElements = function(allElements, attribute){
        let matchingElements = [];
        
        for (let i = 0, n = allElements.length; i < n; i += 1){
            self.isElementAttributeNull(matchingElements, allElements[i], attribute);
        }
        
        return matchingElements;
    };
    
    self.getMustacheInfo = function(str, node, textValue){
        let result = {"node": node, "infos":[]};
        let parts = self.getReplaceParts(textValue);
        
        result.defaultNode = self.copyNode(node, 1)[0];
        result.parts = parts;
        result.defaultParts = self.toNewArray(parts);
        result.tokenPositions = self.getTokenPositionsInParts(str, parts);
        result.infos = self.getMustacheTokenType(str.match(self.pattern.mustacheInfo));
        
        return result;
    };
    
    self.getMustacheTokenType = function(matches){
        let result = [];
        
        for (let i = 0; i < matches.length; i += 1){
            let token = matches[i];
            let next = matches[i + 1];
            if (next === "()"){
                result.push({"type": "function", "property": token});
                i += 1;
            }
            else if (next === "["){
                result.push({"type": "array", "property": token});
                i += 1;
            }
            else if (token !== "]"){
                result.push({"type": "property", "property": token});
            }
        }
        
        return result;
    };
    
    self.getTokenPositionsInParts = function(search, parts){
        let result = [];
        let _capture = false;
        
        for (let i = 0; i < parts.length; i += 1){
            if (parts[i] === "{{"){
                _capture = true;
            }
            else if (parts[i] === "}}"){
                _capture = false;
            }
            else if (_capture){
                result.push(i);
            }
        }
        return result;
    };
    
    self.getReplaceParts = function(text){
        return text.match(self.pattern.replaceParts);
    };
    
    self.getContextValue = function(context){
        let result = null;
        let nodeType = self.getAttributeValue(context, "type").toLowerCase();
        let nodeName = context.nodeName.toLowerCase();
        
        if (nodeType === "text" || nodeType === "password" || nodeType === "email"){
            result = context.value;
        }
        else if (nodeType === "checkbox"){
            result = context.checked;
        }
        else if (nodeType === "radio"){
            result = context.checked;
        }
        else if (nodeName === "select"){
            result = context.selectedIndex;
        }
        
        return result;
    };
    
    self.getMatches = function(node, k1, k2){
        return node[k1].match(self.pattern[k2]);
    };
    
    self.getAttributeValue = function(node, attr){
        let result = "";
        
        for (let i = 0; i < node.attributes.length; i += 1){
            let attrInfo = node.attributes[i];
            
            if (attrInfo.nodeName === attr){
                result = attrInfo.nodeValue;
                break;
            }
        }
        
        return result;
    };
    
    self.getClones = function(parentNode, n, remove){
        let result = [];
        
        for (let i = 0; i < n && typeof parentNode.childNodes !== "undefined"; i += 1){
            result.push(parentNode.cloneNode(true).childNodes);
        }
        if (typeof remove !== "undefined"){
            self.removeChildrenNode(parentNode);
        }
        
        return result;
    };
    
    self.copyNode = function(parentNode, n, remove){
        let result = [];
        
        for (let i = 0; i < n; i += 1){
            result.push(parentNode.cloneNode(true));
        }
        if (typeof remove !== "undefined"){
            self.removeChildrenNode(parentNode);
        }
        
        return result;
    };
    
    self.removeChildrenNode = function(parentNode){
        while (parentNode.firstChild) {
            parentNode.removeChild(parentNode.firstChild);
        }
    };
    
    self.toNewArray = function(arr){
        let result = [];
        
        for (let i = 0; i < arr.length; i += 1){
            result.push(arr[i]);
        }
        
        return result;
    };
    
    self.localPush = function(id, obj){
        let seen = [];
        let neoObj = self.copyObject(obj, "proxy");
        let value = JSON.stringify(neoObj, function(key, val) {
            if (typeof val === "object") {
                if (seen.indexOf(val) >= 0){
                    return;
                }
                seen.push(val);
            }
            return val;
        })
        
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem(id, value); 
        }
    };
    
    self.localPull = function(id, key){
        let result = {};
        
        if (typeof(Storage) !== "undefined") {
            let tmp = JSON.parse(localStorage.getItem(id));
            
            if (typeof key === "undefined"){
                result = tmp;
            }
            else if (typeof tmp[key] !== "undefined"){
                result = tmp[key];
            }
        }
        
        return result;
    };
    
    self.getStringWhithoutBrackets = function(arr){
        let result = arr.join("");
        
        result = result.replace("{{", "");
        result = result.replace("}}", "");
        
        return result;
    };
    
    self.setProp = function(arr, i, prop){
        let value = self.getStringWhithoutBrackets(arr[i].parts);
        if (prop === "checked"){
            if (value === "true"){
                arr[i].node[prop] = true;
            }
            else {
                arr[i].node[prop] = false;
            }
        }
        else{
            arr[i].node[prop] = value;
        }
    };
    
    self.copyObject = function(obj, ignore){
        let result = {};
        
        for (let prop in obj){
            if (prop !== ignore){
                result[prop] = obj[prop];
            }
        }
        
        return result;
    };
    
    return self;
}