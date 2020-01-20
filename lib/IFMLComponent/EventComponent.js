class EventComponent extends GenericComponent {
    constructor(vm, model) {
        super(vm, model);
        this.eventsToRegister = [];
    }

    buildEventComponent(element) {
        let markup;

        if (element.attributes.hasOwnProperty('stereotype') && element.attributes.stereotype === "selection") {
            markup = this.rainbowTemplate.getSelectionMarkup(element);
	    this.vm.eventsToRegister.push(element.id);
        }
        else {
            markup = this.rainbowTemplate.getButtonMarkup(element);
        }

        return markup;
    }
}
