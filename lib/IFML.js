class IFML {
    constructor(model, _class, api) {
        this.initialized = false;
        this._class = _class;
        this.api = api;
        this.vm = new this._class();
        this.rainbowVM = null;
        this.model = model;
        this.components = {};
        this.eventsToRegister = [];
        window.onhashchange = () => {this.locationHashChanged()};
        this.locationHashChanged();
    }

    locationHashChanged() {
        this.vm.eventsToRegister = [];
        if (location.hash === '') {
            this.generateFromModel(true, '');
        }
        else {
            this.generateFromModel(false, location.hash);
        }

        if (this.initialized) {
            this.rainbowVM.rebind();
        }
        else {
            this.rainbowVM = new RainbowVM('vm', this.vm, 'vm', null, this.api);
            this.rainbowVM.addCollectionListeners(() => {this.locationHashChanged();});
            this.initialized = true;
        }
    }

    generateFromModel(defaultView, id) {
        this.model.elements.forEach((element) => {
            if (element.type === "ifml.ViewContainer" && (element.attributes.default === defaultView || element.id === id)) {
                this.components[element.attributes.name] = new ViewContainerComponent(this.vm, this.model);
                this.components[element.attributes.name].buildMainContainer(element);
                this.manageEvents();
            }
        });
    }

    manageEvents() {
        this.vm.eventsToRegister.forEach((eventId) => {
            let body = document.getElementsByTagName("body")[0];
            let domElement = body.querySelectorAll('[event-id="' + eventId + '"]')[0];
            domElement.addEventListener("click", (ev) => {
                ev.stopPropagation();
                if (ev.target.tagName === "TD") {
                    let index = ev.target.parentNode.attributes['data-row-id'].value;
                    this.handleEvent(eventId, index);
                }
                else {
                    console.log(`Unhandled ev ${ev}`);
                }
            });
        });
    }

    handleEvent(eventId, index) {
        let sourceCondition = relation => relation.source === eventId && relation.type === "source";
        let sourceRelation = this.model.relations.filter(sourceCondition);

        if (sourceRelation.length > 0) {
            let flowCondition = relation2 => relation2.flow === sourceRelation[0].flow && relation2.type === "target";
            let targetRelation = this.model.relations.filter(flowCondition);
            if (targetRelation.length > 0) {
                let elementCondition = element => element.id === targetRelation[0].target;
                let elements = this.model.elements.filter(elementCondition);
                let bindings = this.getBindings(targetRelation[0].flow, index, elements[0]);
                if (elements[0].type === "ifml.Action") {
                    this.handleAction(elements[0], bindings);
		}
                else {
                    let collection = elements[0].attributes.collection;
                    this.vm.proxy[collection] = this.vm[collection][index];
                }
            }
        }
    }

    handleAction(element, index) {
        if (typeof this.vm[element.id] !== "undefined") {
            if (typeof this.vm[element.attributes.parameters[0]] === "object") {
                this.vm[element.id](index);
            }
            else {
                this.vm[element.id](element.attributes.parameters);
            }
        }
        else {
            console.log(`Unhandled action ${element.id}`);
        }
    }

    getBindings(flowId, index, element) {
        let condition = element => element.id === flowId;
	let filtered = this.model.elements.filter(condition);
        console.log(filtered);
        if (filtered[0].attributes.bindings.length > 0) {
            let output = filtered[0].attributes.bindings[0].output;
            let input = filtered[0].attributes.bindings[0].input;
            console.log(input);
            return this.vm[input][index];
        }
        return null;
    }
}
