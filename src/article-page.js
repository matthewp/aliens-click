import { render, html } from './lit-html.js';
import { getInitialStateOnce } from './initial-state.js';
import { ensureShadow, upgradeStyles } from './mixins.js';
import { ArticleViewModel } from './connection.js';
import speciesArticle from './species-article.js';
import './window/swap-shadow.js';
import './loading-indicator.js';

const BaseElement = upgradeStyles(ensureShadow());

class ArticlePage extends BaseElement {
  static get stylesUrl() {
    return '/src/article-page.css';
  }

  constructor() {
    super();

    this.vm = new ArticleViewModel(getInitialStateOnce());
  }

  connectedCallback() {
    super.connectedCallback();
    this.articleChanged();
  }

  async articleChanged() {
    let articleId = this.getAttribute('article-id');
    await this.vm.loadArticle(articleId);
    this.update();
  }

  async update() {
    let state = await this.vm.getState();
    let result = this.render({styles: this._styles, ...state});
    render(result, this.shadowRoot);
  }

  render({data, styles}) {
    return html`
      ${styles}

      ${
        data ? speciesArticle(data) : html`
          <loading-indicator></loading-indicator>
        `
      }
    `;
  }
}

customElements.define('article-page', ArticlePage);
