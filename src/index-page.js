import { IndexViewModel } from './connection.js';
import { render, html } from './lit-html.js';
import { getInitialStateOnce } from './initial-state.js';
import { ensureShadow, upgradeStyles } from './mixins.js';
import './window/swap-shadow.js';

const BaseElement = upgradeStyles(ensureShadow());

class IndexPage extends BaseElement {
  static get stylesUrl() {
    return '/src/species-list.css';
  }

  constructor() {
    super();

    let state = getInitialStateOnce();
    let { filter, species } = state || {};
    this.vm = new IndexViewModel(species, filter);
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadSpecies();
  }

  async loadSpecies() {
    await this.vm.loadSpecies();
    return this.update();
  }

  handleEvent(ev) {
    switch(ev.type) {
      case 'keyup':
        this.vm.setFilter(ev.target.value);
        this.update();
        break;
    }
  }

  async update() {
    let state = await this.vm.getState();
    let result = this.render({styles: this._styles, ...state});
    render(result, this.shadowRoot);
  }

  render({filter, species, styles}) {
    return html`
      ${styles}
      <h1>Aliens</h1>

      <form action="/search">
        <input type="text" value="${filter}" name="q" on-keyup=${this}
          placeholder="Search species" class="alien-search" />
      </form>
      <ul class="species">
        ${species.map(specie => (
          html`
            <li class="specie">
              <a href="/article/${specie.id}">
                <figure>
                  ${specie.tn ? html`
                    <img src="${specie.tn}" />
                  ` : ''}
                </figure>
                <span class="specie-title">${specie.title}</span>
              </a>
            </li>
          `
        ))}
      </ul>
    `;
  }
}

customElements.define('index-page', IndexPage);
