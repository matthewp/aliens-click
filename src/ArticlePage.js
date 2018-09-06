import * as api from './api.js';
import fritz, { h, Component } from 'fritz';
import Loading from './Loading.js';
import SpeciesArticle from './SpeciesArticle.js';
import styles from './ArticlePage.css';
import { onMatchingUpdate } from './DataUpdate.js';

class ArticlePage extends Component {
  constructor() {
    super();

    this.unregisterUpdate = onMatchingUpdate(/\/api\/article/, data => {
      this.setState({ data });
    });
  }

  static get props() {
    return {
      article: { attribute: true }
    };
  }
  
  componentWillUnmount() {
    this.unregisterUpdate();
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