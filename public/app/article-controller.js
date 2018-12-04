import articleView from './article-view.js';

function init(root) {
  let updateArticle = articleView();

  async function loadArticle() {
    let match = /\/article\/(.+)/.exec(location.pathname);
    let id = Number(match[1]);

    let res = await fetch(`/api/article/${id}?width=300`);
    let data = await res.json();
    updateArticle({ data });
  }
  
  /* Event listeners */
  function onTitle(ev) {
    document.title = ev.detail;
  }

  /* Initialization stuff */
  let frag = updateArticle();
  root.appendChild(frag);
  root.addEventListener('title', onTitle);
  
  loadArticle();

  function disconnect() {
    // Nothing to teardown for this page at this time.
  }

  return disconnect;
}

export default init;