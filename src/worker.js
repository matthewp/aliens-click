importScripts('https://unpkg.com/theda@1.0.1/theda.umd.js');
importScripts('./api.js');

class IndexViewModel {
  constructor(species = [], filter = '') {
    this.species = species;
    this.filter = filter;

    Object.defineProperty(this, 'allSpecies', {
      enumerable: false,
      value: species
    });
  }

  getState() {
    return Object.assign({}, this);
  }

  setFilter(query) {
    let q = query.toLowerCase();
    this.filter = q;

    let species = this.allSpecies;
    this.species = species.filter(s => s.title.toLowerCase().includes(q));
  }

  async loadSpecies() {
    if(!this.species.length) {
      let species = await api.list();
      this.species = species;
    }
  }
}

theda.provide(IndexViewModel);

class ArticleViewModel {
  constructor(data = null) {
    if(data) {
      this.articleId = Number(Object.keys(data.detail.items)[0]);
    } else {
      this.articleId = null;
    }

    this.data = data;
  }

  async loadArticle(article) {
    let id = Number(article);
    if(isNaN(id) || id === this.articleId) {
      return this.data;
    }

    this.articleId = id;
    let data = this.data = await api.article(id);
    return data;
  }

  getState() {
    return Object.assign({}, this);
  }
}

theda.provide(ArticleViewModel);
