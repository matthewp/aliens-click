
export default class {
  constructor() {
    this.pageSelect = document.querySelector('page-select');
    
    var root = document.body;
    root.addEventListener('click', this);
  }

  handleEvent(ev) {
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

  goToArticle(pth) {
    let id = Number(pth.split("/").pop());
    this.pageSelect.page = 'article';
    this.pageSelect.articleId = id;
    history.pushState(null, 'Article', pth);
  }

  goToIndex() {
    this.pageSelect.page = 'index';
    history.pushState(null, 'Aliens app!', '/');
  }
}