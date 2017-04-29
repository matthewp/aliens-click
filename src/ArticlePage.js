import * as api from './api.js';
import fritz, { h, Component } from 'fritz';
import Loading from './Loading.js';
import SpeciesArticle from './SpeciesArticle.js';
import styles from './ArticlePage.css';

class ArticlePage extends Component {
  static get props() {
    return {
      article: { attribute: true }
    };
  }

  get article() {
    return this._article;
  }

  set article(val) {
    this._article = Number(val);
  }

  loadArticle() {
    const id = this.article;
    if(isNaN(id)) {
      return;
    }

    api.article(id).then(data => {
      this.data = data;
      this.update();
    });
  }

  render() {
    if(!this.data) {
      this.loadArticle();;
    }

    return (
      <section>
        <style>{styles}</style>
        {
          this.data ? 
          <SpeciesArticle data={this.data} /> :
          <Loading></Loading>
        }
      </section>
    );
  }
}

fritz.define('article-page', ArticlePage);