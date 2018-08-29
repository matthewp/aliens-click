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

  loadArticle() {
    const id = Number(this.props.article);
    if(isNaN(id)) {
      return;
    }

    api.article(id).then(data => {
      this.setState({data})
    });
  }

  render({}, {data}) {
    if(!data) {
      this.loadArticle();
    }

    return (
      <section>
        <style>{styles}</style>
        {
          data ? 
          <SpeciesArticle data={data} /> :
          <Loading></Loading>
        }
      </section>
    );
  }
}

fritz.define('article-page', ArticlePage);