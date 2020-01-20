class ViewComponent extends GenericComponent {
    constructor(vm, model) {
        super(vm, model);
    }

    buildViewComponent(element) {
        let markup;
        let children = this.getViewChildren(element.id);

        if (element.attributes.hasOwnProperty('stereotype') && element.attributes.stereotype === "list") {
            markup = this.rainbowTemplate.getViewComponentTableMarkup(element, children, this.vm);
        }
        else if (element.attributes.hasOwnProperty('stereotype') && element.attributes.stereotype === "details") {
            markup = this.rainbowTemplate.getViewComponentDetailsMarkup(element, children);
        }

        return markup;
    }
}
