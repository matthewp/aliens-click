import '../page-select.js';

let prototype = {
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
  },

  goToArticle(pth) {
    let id = Number(pth.split('/').pop());
    let ps = this.pageSelect;
    ps.setAttribute('page', 'article');
    ps.setAttribute('article-id', id);
    history.pushState(null, 'Article', pth);
  },

  goToIndex() {
    let ps = this.pageSelect;
    ps.setAttribute('page', 'index');
    ps.removeAttribute('article-id');
    history.pushState(null, 'Aliens app!', '/');
  }
};

function startRouter() {
  let router = Object.create(prototype, {
    pageSelect: {
      value: document.querySelector('page-select')
    }
  });

  let root = document.body;
  root.addEventListener('click', router);
}

export { startRouter }
