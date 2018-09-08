import fritz, { html, Component } from 'fritz';

class PageSelect extends Component {
  constructor() {
    super();
  }

  static get props() {
    return {
      page: { attribute: true },
      articleId: { attribute: true }
    };
  }

  render({page = 'index', articleId}) {
    if(page === 'index') {
      return html`<index-page></index-page>`;
    }

    return html`<article-page article=${articleId}></article-page>`;
  }
}

fritz.define('page-select', PageSelect);