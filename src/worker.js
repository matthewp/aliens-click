importScripts('https://unpkg.com/theda@1.0.0/theda.umd.js');
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
}

theda.provide(IndexViewModel);

class ArticleViewModel {
  constructor() {
    this.data = null;
  }

  async loadArticle(article) {
    let id = Number(article);
    if(isNaN(id)) {
      return;
    }

    let data = this.data = await api.article(id);
    return data;
  }
}

theda.provide(ArticleViewModel);
