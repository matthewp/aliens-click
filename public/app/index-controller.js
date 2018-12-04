import indexView from './index-view.js';

function init(root) {
  let updateIndex = indexView();

  async function loadSpecies() {
    let list = await fetch('/api/aliens').then(res => res.json());
    updateIndex({ list });
  }

  /* Initialization stuff */
  let frag = updateIndex();
  root.appendChild(frag);
  
  loadSpecies();

  function disconnect() {
    updateIndex.disconnect();
  }

  return disconnect;
}

export default init;