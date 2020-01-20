class RainbowTemplate {
    constructor(model) {
        this.model = model;
    }


    getLink(id) {
        let sourceCondition = relation => relation.source === id && relation.type === "source";
        let sourceRelation = this.model.relations.filter(sourceCondition);

        if (sourceRelation.length > 0) { 
            let flowCondition = relation2 => relation2.flow === sourceRelation[0].flow && relation2.type === "target";
            let targetRelation = this.model.relations.filter(flowCondition);
        
            return '#/'+targetRelation[0].target;
        }
        
        return '';
    }

    getSelectionMarkup(element) {
        return `event-id="${element.id}"`;
    }

    getButtonMarkup(element) {
        return `<a class="mdc-button" name="${element.attributes.name}" href="${this.getLink(element.id)}">
		  <span class="mdc-button__label">${element.attributes.name}</span>
		</a>`;
    }

    getViewComponentTableMarkup(element, children, vm) {
        console.log(element);
        return table.default(element, children, vm);
    }

    getViewComponentDetailsMarkup(element, children) {
        return `<div class="mdc-card mdc-card--outlined">
		  <h1>${element.attributes.name}</h1>
                  ${element.attributes.fields.map(field => `
		    <p>${field}: {{${element.attributes.collection}.${field}}}</p>
		  `).join('')}
		</div>`;
    }

    getViewContainerMarkup(element, children) {
        return `<div class="mdc-layout-grid" id="${element.id}" name="${element.attributes.name}">
		  <div class="mdc-layout-grid__inner">
		    ${children.map(child =>
                        `<div class="mdc-layout-grid__cell">${child}</div>`
                    ).join('')}
		  </div>
		</div>`;
    }
}
