import listItemView from './list-item-view.js';
import keyboardNav from './keyboard-nav.js';

const template = document.createElement('template');
template.innerHTML = /* html */ `
  <div id="index-page">
    <h1>Aliens</h1>

    <form action="/search">
      <input type="text" name="q" placeholder="Search species"
        class="alien-search">
    </form>
    <ul class="species"></ul>
  </div>
`;

function clone() {
  return document.importNode(template.content, true).firstElementChild;
}

function init() {
  /* DOM variables */
  let root = clone();
  let inputNode = root.querySelector('input');
  let speciesNode = root.querySelector('.species');

  /* DOM views */
  let updateKeyboardNav;

  /* State variables */
  let species, speciesMap, filter = '';
  let filteredList;

  /* DOM update functions */
  function setSpeciesNode(value) {
    while(speciesNode.firstChild) {
      speciesNode.removeChild(speciesNode.firstChild);
    }
    speciesMap = new Map();
    for(let item of value) {
      let itemUpdate = listItemView();
      speciesNode.appendChild(itemUpdate({ item }));
      speciesMap.set(item.id, itemUpdate);
    }

    if(!updateKeyboardNav) {
      updateKeyboardNav = keyboardNav.call(speciesNode);
    }
    updateKeyboardNav({
      list: speciesNode,
      listMap: speciesMap,
      count: species.length
    });
  }
  
  function filterSpeciesNode(filter) {
    filteredList = [];
    for(let specie of species) {
      let visible = specie.title.toLowerCase().includes(filter);
      let itemUpdate = speciesMap.get(specie.id);
      itemUpdate({ visible });
      if(visible) {
        filteredList.push(itemUpdate.node);
      }
    }
    updateKeyboardNav({
      list: filteredList,
      count: filteredList.length
    });
  }

  function setInputActive() {
    inputNode.focus();
  }

  /* State update functions */
  function setSpecies(value) {
    if(species !== value) {
      species = value;
      setSpeciesNode(value);
    }
  }

  function setFilter(value) {
    if(filter !== value) {
      filter = value;
      filterSpeciesNode(value);
    }
  }

  /* Event listeners */
  function onInputKeyUp(ev) {
    setFilter(ev.target.value);
  }

  function onMakeInputActive() {
    setInputActive();
  }

  /* Initialization */
  inputNode.addEventListener('keyup', onInputKeyUp);
  root.addEventListener('make-input-active', onMakeInputActive);

  function disconnect() {
    inputNode.removeEventListener('keyup', onInputKeyUp);
    root.removeEventListener('make-input-active', onMakeInputActive);

    if(updateKeyboardNav) {
      updateKeyboardNav.disconnect();
    }
  }

  function update(data = {}) {
    if(data.list) {
      setSpecies(data.list);
    }

    return root;
  }
  
  update.disconnect = disconnect;

  return update;
}

export default init;