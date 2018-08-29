import fritz, { h, Component } from 'fritz';

class PageSelect extends Component {
  static get props() {
    return {
      page: { attribute: true },
      articleId: { attribute: true }
    };
  }

  render({page = 'index', articleId}) {
    if(page === 'index') {
      return <index-page></index-page>;
    }

    return <article-page article={articleId}></article-page>
  }
}

fritz.define('page-select', PageSelect);