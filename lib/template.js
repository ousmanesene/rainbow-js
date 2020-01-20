let table = [];
table['default'] = (element, children, vm) => {return `<h1>${element.attributes.name}</h1>
                <div class="mdc-data-table">
		  <table class="mdc-data-table__table" aria-label="Dessert calories" 
                    ${children.map(child => `${child}`).join('')}
                  >
		    <thead>
		      <tr class="mdc-data-table__header-row">
                        ${element.attributes.fields.map(field => `
			  <th class="mdc-data-table__header-cell" role="columnheader" scope="col">${field}</th>
                        `).join('')}
		      </tr>
		    </thead>
		    <tbody class="mdc-data-table__content">
                      ${vm[element.attributes.collection].map((row, index) => `
		        <tr data-row-id="${index}" class="mdc-data-table__row">
                          ${element.attributes.fields.map(field => `
			    <td class="mdc-data-table__cell">${row[field]}</td>
                          `).join('')}
		        </tr>
                      `).join('')}
		    </tbody>
		  </table>
		</div>`;};
