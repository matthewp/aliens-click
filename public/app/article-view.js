import sectionView from './section-view.js';

const template = document.createElement('template');
template.innerHTML = /* html */ `
  <div class="species-article">
    <header>
      <h1 class="title"></h1>
    </header>
    <article>
      <figure>
        <img />
      </figure>

      <div class="sections"></div>
    </article>
  </div>
`;

function clone() {
  return document.importNode(template.content, true);
}

function init() {
  /* DOM variables */
  let frag = clone();
  let titleNode = frag.querySelector('.title');
  let imgNode = frag.querySelector('img');
  let sectionsNode = frag.querySelector('.sections');

  /* State variables */
  let intro, item, article;

  /* DOM update functions */
  function setTitleNode(value) {
    titleNode.textContent = value;
  }

  function setImgNode(value) {
    imgNode.src = value;
  }

  function setSectionsNode(article) {
    for(let i = 0; i < article.sections.length; i++) {
      let section = article.sections[i];
      let updateSection = sectionView();
      let frag = updateSection({ index: i, section });
      sectionsNode.appendChild(frag);
    }
  }

  /* State update functions */
  function setData(data) {
    article = data.article;
    intro = data.article.sections[0];
    item = first(data.detail.items);
    
    setTitleNode(intro.title);
    setImgNode(thumbnail());
    setSectionsNode(article);
    dispatchTitle(item.title);
  }

  /* Logic functions */
  function first(obj) {
    let key = Object.keys(obj)[0];
    return obj[key];
  }

  function thumbnail(width, height) {
    let tn = item.thumbnail || '';
    tn = tn.replace('http:', '');
    return tn;
  }

  /* Event dispatchers */
  function dispatchTitle(value) {
    let ev = new CustomEvent('title', {
      bubbles: true,
      detail: value
    });
    titleNode.dispatchEvent(ev);
  }

  /* Initialization */
  function update(data = {}) {
    if(data.data) setData(data.data);
    return frag;
  }

  return update;
}

export default init;