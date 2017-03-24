import fritz, { h, Component } from 'fritz';
//import indexRoute from './index.js';
//import articleRoute from './article.js';

import IndexPage from './index.js';
//import ArticlePage from './article.js';

class AliensClick extends Component {
  constructor() {
    super();
    this.page = 'index';
  }

  render() {
    if(this.page === 'index') {
      return <index-page></index-page>;
    } else {
      return <article-page></article-page>;
    }
  }
}

fritz.define('aliens-click', AliensClick);

/*
const app = fritz();

app
  .configure(indexRoute)
  .configure(articleRoute);
*/

/**
 * Color scheme
 * https://coolors.co/fefffe-e5fcf5-b3dec1-210124-750d37
 */
