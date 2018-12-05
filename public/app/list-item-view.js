const template = document.createElement('template');
template.innerHTML = /* html */ `
  <li class="specie">
    <a class="specie-link">
      <figure></figure>
      <span class="specie-title"></span>
    </a>
  </li>
`;

function clone() {
  return document.importNode(template.content, true);
}

function init() {
  /* DOM variables */
  let frag = clone();
  let specieNode = frag.firstElementChild;
  let linkNode = frag.querySelector('.specie-link');
  let figureNode = frag.querySelector('figure');
  let titleNode = frag.querySelector('.specie-title');

  /* State variables */
  let item, visible = true;

  /* DOM update functions */
  function setLinkNode(value) {
    linkNode.href = value;
  }

  function setFigureNode(value) {
    if(value) {
      let img = document.createElement('img');
      img.src = value;
      figureNode.appendChild(img);
    }
  }

  function setTitleNode(value) {
    titleNode.textContent = value;
  }

  function setSpecieNode(value) {
    specieNode.style.display = value ? '' : 'none';
  }

  /* State update functions */
  function setItem(value) {
    if(item !== value) {
      item = value;
      setLinkNode(itemUrl());
      setFigureNode(thumbnail());
      setTitleNode(item.title);
    }
  }

  function setVisible(value) {
    if(visible !== value) {
      visible = value;
      setSpecieNode(value);
    }
  }

  /* View logic functions */
  function thumbnail(width, height) {
    let tn = item.thumbnail || '';
    tn = tn.replace('http:', '');
    return tn;
  }

  function itemUrl() {
    return `/article/${item.id}`;
  }

  /* Initialization */

  function update(data = {}) {
    if(data.item) setItem(data.item);
    if(data.visible != null) setVisible(data.visible);
    return frag;
  }

  update.node = specieNode;

  return update;
}

export default init;