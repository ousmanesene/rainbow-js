class ViewContainerComponent extends GenericComponent {
    constructor(vm, model) {
        super(vm, model);
    }

    buildMainContainer(element) {
        let children = this.getViewChildren(element.id);
        let body = document.getElementsByTagName("body")[0];
        body.innerHTML =  this.rainbowTemplate.getViewContainerMarkup(element, children);
    }

    buildViewContainer(element) {
        let children = this.getViewChildren(element.id);
        return this.rainbowTemplate.getViewContainerMarkup(element, children);
    }
}
