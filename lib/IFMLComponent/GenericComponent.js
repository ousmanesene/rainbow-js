class GenericComponent {
    constructor(vm, model) {
        this.vm = vm;
        this.model = model;
        this.rainbowTemplate = new RainbowTemplate(this.model);
        this.components = {};
    }

    getViewChildren(id) {
	let children = [];

        this.model.relations.forEach((relation) => {
            if (relation.type === "hierarchy" && relation.parent === id) {
                let element = this.getElementById(relation.child);
                if (typeof element !== 'undefined' && element.type === "ifml.Event") {
                    this.components[element.attributes.name] = new EventComponent(this.vm, this.model);
		    children.push(this.components[element.attributes.name].buildEventComponent(element));
		}
                else if (typeof element !== 'undefined' && element.type === "ifml.ViewComponent") {
                    this.components[element.attributes.name] = new ViewComponent(this.vm, this.model);
		    children.push(this.components[element.attributes.name].buildViewComponent(element));
		}
                else if (typeof element !== 'undefined' && element.type === "ifml.ViewContainer") {
                    this.components[element.attributes.name] = new ViewContainerComponent(this.vm, this.model);
		    children.push(this.components[element.attributes.name].buildViewContainer(element));
		}
                else {
                    console.log(`UnHandled ${element.type}`);
		}
            }
        });

	return children;
    }

    getElementById(id) {
        let condition = element => element.id === id;
	let filtered = this.model.elements.filter(condition);

        return filtered[0];
    }
}
