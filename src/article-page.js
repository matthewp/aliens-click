import { render, html } from './lit-html.js';
import { initialState } from './initial-state.js';
import { ensureShadow, upgradeStyles } from './mixins.js';
import { ArticleViewModel } from './connection.js';
import './window/swap-shadow.js';
import './loading-indicator.js';

const BaseElement = upgradeStyles(ensureShadow());

class ArticlePage extends BaseElement {
  static get stylesUrl() {
    return '/src/article-page.css';
  }

  constructor() {
    super();

    this.vm = new ArticleViewModel();
  }

  connectedCallback() {
    super.connectedCallback();
    this.update();
  }

  async update() {
    let articleId = this.getAttribute('article-id')
    let state = await this.vm.loadArticle(articleId);
    let result = this.render({styles: this._styles, ...state});
    render(result, this.shadowRoot);
  }

  render({data, styles}) {
    return html`
      ${styles}

      ${
        data ? html`
          <species-article :data=${data}></species-article>
        ` : html`
          <loading-indicator></loading-indicator>
        `
      }
    `;
  }
}

customElements.define('article-page', ArticlePage);
