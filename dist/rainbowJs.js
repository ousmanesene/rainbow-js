"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function RainbowDom(name, vm, vmId, withElements) {
    "use strict";

    var self = this;
    var capture = false;
    var loopVal = "";
    var tools = new RainbowTools();

    var bindSelectNode = function bindSelectNode(parentNode, key) {
        var parentNodeName = parentNode.nodeName.toLowerCase();
        if (parentNodeName === "select" && self.vm[key].selectedIndex !== "undefined") {
            var index = self.vm[key].selectedIndex;

            if (typeof parentNode.childNodes[index] !== "undefined") {
                parentNode.childNodes[index].selected = "selected";
            }
        }
    };

    var createRainbowContext = function createRainbowContext(parentNode, cloneList, arr) {
        for (var h = 0; h < arr.length; h += 1) {
            new RainbowVM("with", arr[h], self.vmId, cloneList[h]);
            for (var i = 0; i < cloneList[h].length; i += 1) {
                parentNode.appendChild(cloneList[h][i]);
            }
        }
        capture = false;
        loopVal = "";
    };

    var bindLoopNode = function bindLoopNode(parentNode, defaultNode, arr, key) {
        var cloneList = tools.getClones(defaultNode, arr.length);

        tools.removeChildrenNode(parentNode);
        createRainbowContext(parentNode, cloneList, arr);
        bindSelectNode(parentNode, key);
    };

    var replaceTokenPositions = function replaceTokenPositions(arr, i) {
        var position = null;

        for (var j = 0; j < arr[i].tokenPositions.length; j += 1) {
            position = arr[i].tokenPositions[j];
            arr[i].parts[position] = processInnerParts(String(arr[i].defaultParts[position]));
        }

        return position;
    };

    var shouldBindLoop = function shouldBindLoop(arr, i, position, infos) {
        var _infos = _slicedToArray(infos, 3);

        var key = _infos[0];
        var type = _infos[1];
        var prop = _infos[2];

        if (type === "with") {
            if (Array.isArray(arr[i].parts[position])) {
                bindLoopNode(arr[i].node, arr[i].defaultNode, arr[i].parts[position], key);
            }
        } else {
            tools.setProp(arr, i, prop);
        }
    };

    var replaceParts = function replaceParts(key, type, prop) {
        var arr = self.observableList[type][key];
        var position = null;
        var infos = [key, type, prop];

        for (var i = 0; i < arr.length; i += 1) {
            position = replaceTokenPositions(arr, i);
            shouldBindLoop(arr, i, position, infos);
        }
    };

    var bindTextNode = function bindTextNode(mInfo) {
        for (var i = 0; i < mInfo.infos.length; i += 1) {
            var key = mInfo.infos[i].property;
            if (typeof self.vm[key] !== "undefined") {
                if (typeof self.observableList.text[key] === "undefined") {
                    self.observableList.text[key] = [];
                }
                self.observableList.text[key].push(mInfo);
                replaceParts(key, "text", "nodeValue");
            }
        }
    };

    var bindInputTextNode = function bindInputTextNode(mInfo) {
        var key = mInfo.infos[0].property;
        if (typeof self.vm[key] !== "undefined") {
            if (typeof self.observableList.input[key] === "undefined") {
                self.observableList.input[key] = [];
            }
            self.observableList.input[key].push(mInfo);
            replaceParts(key, "input", "value");
        }
    };

    var bindInputRadioNode = function bindInputRadioNode(mInfo) {
        var key = mInfo.infos[0].property;
        if (typeof self.vm[key] !== "undefined") {
            if (typeof self.observableList.input[key] === "undefined") {
                self.observableList.input[key] = [];
            }
            self.observableList.input[key].push(mInfo);
            replaceParts(key, "input", "checked");
        }
    };

    var bindInputCheckboxNode = function bindInputCheckboxNode(mInfo) {
        var key = mInfo.infos[0].property;
        if (typeof self.vm[key] !== "undefined") {
            if (typeof self.observableList.input[key] === "undefined") {
                self.observableList.input[key] = [];
            }
            self.observableList.input[key].push(mInfo);
            replaceParts(key, "input", "checked");
        }
    };

    var bindWith = function bindWith(node, str) {
        var key = str.replace("{{#", "").replace("}}", "");
        var parentNode = node.parentNode;
        parentNode.removeChild(parentNode.lastChild);
        parentNode.removeChild(parentNode.firstChild);
        var mInfo = tools.getMustacheInfo("{{" + key + "}}", parentNode, "{{" + key + "}}");
        var k = mInfo.infos[0].property;
        if (self.vm[k] !== "undefined") {
            if (typeof self.observableList.with[k] === "undefined") {
                self.observableList.with[k] = [];
            }
            self.observableList.with[k].push(mInfo);
            replaceParts(k, "with", "with");
        } else {
            node.parentNode.style.visibility = "hidden";
        }
    };

    var getTextElementToBind = function getTextElementToBind(text, node) {
        if (text.indexOf("{{#") !== -1) {
            capture = true;
            loopVal = text.replace("#", "/");
            bindWith(node, text);
        } else if (!capture) {
            bindTextNode(tools.getMustacheInfo(text, node, node.nodeValue));
        }
    };

    var getInputNodeToBind = function getInputNodeToBind(mInfo) {
        var nodeType = tools.getAttributeValue(mInfo.node, "type");

        if (nodeType === "text" || nodeType === "password" || nodeType === "email") {
            bindInputTextNode(mInfo);
        } else if (nodeType === "checkbox") {
            bindInputCheckboxNode(mInfo);
        } else if (nodeType === "radio") {
            bindInputRadioNode(mInfo);
        }
    };

    var getElementToBind = function getElementToBind(node, k1) {
        var matches = tools.getMatches(node, k1, "elementsTobind");

        if (matches !== null && k1 === "value") {
            getInputNodeToBind(tools.getMustacheInfo(matches[0], node, node.value));
        } else if (matches !== null && k1 === "nodeValue") {
            getTextElementToBind(matches[0], node);
        }
    };

    var shouldCapture = function shouldCapture(node) {
        if (node.nodeName === "#text") {
            getElementToBind(node, "nodeValue");
        } else if (node.nodeName === "INPUT" && !capture) {
            getElementToBind(node, "value");
        }
    };

    var getAllElementsToBind = function getAllElementsToBind(nodeList) {
        for (var i = 0; i < nodeList.length; i += 1) {
            shouldCapture(nodeList[i]);
            if (!capture) {
                getAllElementsToBind(nodeList[i].childNodes);
            }
        }
    };

    var isAttributeValueOf = function isAttributeValueOf(element, cAttr, nodeName, attrK, attrV) {
        if (cAttr.nodeName === nodeName && cAttr[attrK] === attrV) {
            getAllElementsToBind(element.childNodes);
        }
    };

    var loopOnAttributes = function loopOnAttributes(el, nodeName, attrK, attrV) {
        for (var i = 0; i < el.attributes.length; i += 1) {
            isAttributeValueOf(el, el.attributes[i], nodeName, attrK, attrV);
        }
    };

    var loopOnVmBindElements = function loopOnVmBindElements(vmBindElements) {
        for (var i = 0; i < vmBindElements.length; i += 1) {
            if (self.name === "with") {
                getAllElementsToBind(vmBindElements[i].childNodes);
            } else {
                loopOnAttributes(vmBindElements[i], "vm.bind", "value", name);
            }
        }
        setObservables();
    };

    var processMustache = function processMustache(element, key, context) {
        var myVar = self.vm;
        var value = tools.getContextValue(context);
        var nodeName = context.nodeName.toLowerCase();
        var max = element.infos.length;
        for (var i = 0; i < max; i += 1) {
            var result = null;
            var obj = element.infos[i];
            var prop = obj.property;
            var type = obj.type;
            var pType = _typeof(myVar[prop]);

            if (pType !== "undefined" && pType === "function" && pType === type) {
                result = myVar[prop](key, value);
                if (result !== null) {
                    value = result;
                }
            } else if (pType === "object" && type === "property" && nodeName === "select" && i + 1 >= max) {
                myVar.selectedIndex = value;
            } else if (pType === "object" && type === "property") {
                myVar = myVar[prop];
            } else if (pType !== "undefined" && type === "property") {
                myVar[prop] = value;
            } else if (pType !== "undefined" && type === "array") {
                myVar = myVar[prop];
            }

            if (i + 1 >= max) {
                self.proxy[key] = self.vm[key];
            }
        }
    };

    var processInnerParts = function processInnerParts(str, j) {
        var myVar = self.vm;
        var result = str;
        var pattern = /\w+|\[|\]/gi;
        var parts = str.match(pattern);
        var _capture = false;

        if (typeof j === "undefined") {
            j = 0;
        }

        for (var i = j; i < parts.length; i += 1) {
            var value = parts[i];

            if (parts[i] === "[" && !_capture) {
                _capture = true;
                value = processInnerParts(str, i + 1);
                result = myVar[value];
                myVar = result;
            } else if (parts[i] === "]") {
                _capture = false;
                if (j > 0) {
                    break;
                }
            } else if (!_capture) {
                if (typeof myVar[value] !== "undefined") {
                    result = myVar[value];
                    myVar = result;
                } else if (j > 0) {
                    result = value;
                }
            }
        }

        return result;
    };

    var setObservables = function setObservables() {
        for (var key1 in self.observableList.input) {
            setOnInputChange(key1);
        }
        for (var key2 in self.observableList.with) {
            setOnWithChange(key2);
        }
    };

    var setOnInputChange = function setOnInputChange(key) {
        var elements = self.observableList.input[key];

        for (var i = 0; i < elements.length; i += 1) {
            var node = elements[i].node;
            var currentElement = elements[i];
            setEventListeners(node, currentElement, key);
        }
    };

    var setOnWithChange = function setOnWithChange(key) {
        var elements = self.observableList.with[key];

        for (var i = 0; i < elements.length; i += 1) {
            var node = elements[i].node;
            var currentElement = elements[i];
            setEventListeners(node, currentElement, key);
        }
    };

    var setEventListeners = function setEventListeners(node, currentElement, key) {
        node.addEventListener("change", function (e) {
            e.preventDefault();
            processMustache(currentElement, key, this);
            var type = tools.getAttributeValue(this, "type");
            if (type === "radio") {
                for (var i = 0; i < self.observableList.input[key].length; i += 1) {
                    var element = self.observableList.input[key][i];
                    processMustache(element, key, element.node);
                }
            }
        });
    };

    var changeDomElements = function changeDomElements(key, oVal) {
        if (typeof self.observableList.text[key] !== "undefined") {
            replaceParts(key, "text", "nodeValue");
        } else if (typeof self.observableList.input[key] !== "undefined") {
            var elements = self.observableList.input[key];
            for (var i = 0; i < elements.length; i += 1) {
                var nodeType = tools.getAttributeValue(elements[i].node, "type");

                if (nodeType === "input") {
                    replaceParts(key, "input", "value");
                } else if (nodeType === "checkbox") {
                    replaceParts(key, "input", "checked");
                } else if (nodeType === "radio") {
                    replaceParts(key, "input", "checked");
                }
            }
        } else if (typeof self.observableList.with[key] !== "undefined") {
            replaceParts(key, "with", "with");
        }
    };

    var setOnDataChange = function setOnDataChange() {
        self.proxy = new Proxy(self.vm, handler);
        self.vm.proxy = self.proxy;
    };

    var handler = {
        set: function set(obj, k, v) {
            if (typeof obj[k] !== "function") {
                var oVal = obj[k];
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
    self.observableList = { "input": {}, "text": {}, "with": {} };

    self.getAllMatchingVM = function () {
        if (self.name === "with") {
            loopOnVmBindElements(withElements);
        } else {
            loopOnVmBindElements(tools.getAllElementsWithAttribute("vm.bind"));
        }
    };

    setOnDataChange();

    return self;
}
"use strict";

function RainbowRequest(api, proxy, id) {
    "use strict";

    var self = this;
    var httpRequest = new XMLHttpRequest();

    var canDoRequest = function canDoRequest() {
        if (!httpRequest) {
            throw "Giving up :( Cannot create an XMLHTTP instance)";
        }
    };

    var processKeys = function processKeys() {
        if (typeof self.currentObject !== "undefined" && typeof self.currentObject.key !== "undefined" && self.result.trim() !== "") {
            var prop = self.currentObject.key;
            console.log("prop:", prop);
            var json = JSON.parse(self.result);
            self.proxy[prop] = json[prop];
        } else {
            console.log("no keys to process");
        }
    };

    var doRequest = function doRequest() {
        httpRequest.onreadystatechange = alertContents;
        httpRequest.open(self.currentObject.method, self.currentObject.url);
        send();
        //httpRequest.setRequestHeader(JSON.stringify(self.headers));
    };

    var alertContents = function alertContents() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            self.result = httpRequest.responseText;
            console.log(self.result);
            processKeys();
            launchCallback();
        }
    };

    var send = function send() {
        if (typeof data !== "undefined") {
            httpRequest.send(encodeURIComponent(JSON.stringify(data)));
        } else {
            httpRequest.send();
        }
    };

    var launchCallback = function launchCallback() {
        if (typeof self.currentObject !== "undefined" && typeof self.currentObject.callback === "function") {
            self.currentObject.callback();
        }
    };

    self.api = api;
    self.id = id;
    self.proxy = proxy;
    self.result = null;
    self.currentObject = null;
    self.headers = { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" };

    self.ajax = function (i) {
        try {
            if (i in self.api) {
                self.currentObject = self.api[i];
                canDoRequest();
                doRequest();
            }
        } catch (e) {
            self.result = e;
        }
    };

    return self;
}
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function RainbowTools() {
    "use strict";

    var self = this;

    self.pattern = {
        elementsTobind: /[\{]{2}[#|/]*[\w_]+\d*(\[\d*|(.)*\])*(\.[^\.][\w_]*\d*|\(\)(?=\.|[\}]{2}|\[)|(\[\d*|(.)*\])*)*[\}]{2}/gi,
        mustacheInfo: /\w+|\(\)|\[|\]|\d/gi,
        replaceParts: /\w+[[^\S]*[^[\}]]*|\(\)|\[|\]|\d|\{\{|\}\}/gi
    };

    self.isElementAttributeNull = function (matchingElements, element, attribute) {
        if (element.getAttribute(attribute) !== null) {
            matchingElements.push(element);
        }
    };

    self.getAllElementsWithAttribute = function (attribute) {
        return self.loopOnAllElements(document.getElementsByTagName("*"), attribute);
    };

    self.loopOnAllElements = function (allElements, attribute) {
        var matchingElements = [];

        for (var i = 0, n = allElements.length; i < n; i += 1) {
            self.isElementAttributeNull(matchingElements, allElements[i], attribute);
        }

        return matchingElements;
    };

    self.getMustacheInfo = function (str, node, textValue) {
        var result = { "node": node, "infos": [] };
        var parts = self.getReplaceParts(textValue);

        result.defaultNode = self.copyNode(node, 1)[0];
        result.parts = parts;
        result.defaultParts = self.toNewArray(parts);
        result.tokenPositions = self.getTokenPositionsInParts(str, parts);
        result.infos = self.getMustacheTokenType(str.match(self.pattern.mustacheInfo));

        return result;
    };

    self.getMustacheTokenType = function (matches) {
        var result = [];

        for (var i = 0; i < matches.length; i += 1) {
            var token = matches[i];
            var next = matches[i + 1];
            if (next === "()") {
                result.push({ "type": "function", "property": token });
                i += 1;
            } else if (next === "[") {
                result.push({ "type": "array", "property": token });
                i += 1;
            } else if (token !== "]") {
                result.push({ "type": "property", "property": token });
            }
        }

        return result;
    };

    self.getTokenPositionsInParts = function (search, parts) {
        var result = [];
        var _capture = false;

        for (var i = 0; i < parts.length; i += 1) {
            if (parts[i] === "{{") {
                _capture = true;
            } else if (parts[i] === "}}") {
                _capture = false;
            } else if (_capture) {
                result.push(i);
            }
        }
        return result;
    };

    self.getReplaceParts = function (text) {
        return text.match(self.pattern.replaceParts);
    };

    self.getContextValue = function (context) {
        var result = null;
        var nodeType = self.getAttributeValue(context, "type").toLowerCase();
        var nodeName = context.nodeName.toLowerCase();

        if (nodeType === "text" || nodeType === "password" || nodeType === "email") {
            result = context.value;
        } else if (nodeType === "checkbox") {
            result = context.checked;
        } else if (nodeType === "radio") {
            result = context.checked;
        } else if (nodeName === "select") {
            result = context.selectedIndex;
        }

        return result;
    };

    self.getMatches = function (node, k1, k2) {
        return node[k1].match(self.pattern[k2]);
    };

    self.getAttributeValue = function (node, attr) {
        var result = "";

        for (var i = 0; i < node.attributes.length; i += 1) {
            var attrInfo = node.attributes[i];

            if (attrInfo.nodeName === attr) {
                result = attrInfo.nodeValue;
                break;
            }
        }

        return result;
    };

    self.getClones = function (parentNode, n, remove) {
        var result = [];

        for (var i = 0; i < n && typeof parentNode.childNodes !== "undefined"; i += 1) {
            result.push(parentNode.cloneNode(true).childNodes);
        }
        if (typeof remove !== "undefined") {
            self.removeChildrenNode(parentNode);
        }

        return result;
    };

    self.copyNode = function (parentNode, n, remove) {
        var result = [];

        for (var i = 0; i < n; i += 1) {
            result.push(parentNode.cloneNode(true));
        }
        if (typeof remove !== "undefined") {
            self.removeChildrenNode(parentNode);
        }

        return result;
    };

    self.removeChildrenNode = function (parentNode) {
        while (parentNode.firstChild) {
            parentNode.removeChild(parentNode.firstChild);
        }
    };

    self.toNewArray = function (arr) {
        var result = [];

        for (var i = 0; i < arr.length; i += 1) {
            result.push(arr[i]);
        }

        return result;
    };

    self.localPush = function (id, obj) {
        var seen = [];
        var neoObj = self.copyObject(obj, "proxy");
        var value = JSON.stringify(neoObj, function (key, val) {
            if ((typeof val === "undefined" ? "undefined" : _typeof(val)) === "object") {
                if (seen.indexOf(val) >= 0) {
                    return;
                }
                seen.push(val);
            }
            return val;
        });

        if (typeof Storage !== "undefined") {
            localStorage.setItem(id, value);
        }
    };

    self.localPull = function (id, key) {
        var result = {};

        if (typeof Storage !== "undefined") {
            var tmp = JSON.parse(localStorage.getItem(id));

            if (typeof key === "undefined") {
                result = tmp;
            } else if (typeof tmp[key] !== "undefined") {
                result = tmp[key];
            }
        }

        return result;
    };

    self.getStringWhithoutBrackets = function (arr) {
        var result = arr.join("");

        result = result.replace("{{", "");
        result = result.replace("}}", "");

        return result;
    };

    self.setProp = function (arr, i, prop) {
        var value = self.getStringWhithoutBrackets(arr[i].parts);
        if (prop === "checked") {
            if (value === "true") {
                arr[i].node[prop] = true;
            } else {
                arr[i].node[prop] = false;
            }
        } else {
            arr[i].node[prop] = value;
        }
    };

    self.copyObject = function (obj, ignore) {
        var result = {};

        for (var prop in obj) {
            if (prop !== ignore) {
                result[prop] = obj[prop];
            }
        }

        return result;
    };

    return self;
}
"use strict";

function RainbowVM(name, vm, vmId, withElements, api) {
    "use strict";

    var self = this;
    var tools = new RainbowTools();
    var dom = new RainbowDom(name, vm, vmId, withElements);

    self.name = name;
    self.vm = vm;
    self.vmId = vmId;
    self.api = api;
    self.proxy = dom.proxy;
    self.keys = dom.keys;
    self.observableList = dom.observableList;
    dom.getAllMatchingVM();

    self.getAPI = function () {
        if (typeof self.api !== "undefined" && self.api !== null) {
            var request = new RainbowRequest(self.api, self.proxy, self.name);
            for (var i = 0; i < self.api.length; i++) {
                request.ajax(i);
            }
            console.log("ok");
        }
    };

    self.getAPI();

    return self.vm;
}
//# sourceMappingURL=rainbowJs.js.map
