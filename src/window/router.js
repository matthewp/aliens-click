
export default class {
  constructor() {
    this.pageSelect = document.querySelector('page-select');
    
    var root = document.body;
    root.addEventListener('click', this);
    window.addEventListener('popstate', this);
    this.originalState = {
      page: 'index'
    }
  }

  handleEvent(ev) {
    if(ev.type === 'click') {
      this.handleClick(ev);
    } else if(ev.type === 'popstate') {
      this.handlePopState(ev);
    }
  }
  
  handleClick(ev) {
    var paths = ev.composedPath();
    for(var i = 0, len = paths.length; i < len; i++) {
      let el = paths[i];
      if(el.localName === 'a') {
        if(/article\//.test(el.pathname)) {
          ev.preventDefault();
          this.goToArticle(el.pathname);
        } else if(el.pathname === '/') {
          ev.preventDefault();
          this.goToIndex();
        }
      }
    }
  }

  handlePopState(ev) {
    let state = ev.state || this.originalState;
    if(state.page === 'index') {
      this.showIndex();
    } else if(state.page === 'article') {
      this.showArticle(state.id);
    }
  }

  goToArticle(pth) {
    let id = Number(pth.split("/").pop());
    this.showArticle(id);
    let state = { page: 'article', id };
    history.pushState(state, 'Article', pth);
  }

  showArticle(id) {
    this.pageSelect.page = 'article';
    this.pageSelect.articleId = id;
  }

  goToIndex() {
    this.showIndex();
    history.pushState({ page: 'index' }, 'Aliens app!', '/');
  }

  showIndex() {
    this.pageSelect.page = 'index';
  }
}