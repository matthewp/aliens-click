let cache = new Map();

function loadStyles(rel) {
  let url = new URL(rel, location.href);
  if(cache.has(url)) {
    return cache.get(url);
  }

  let p = fetch(url).then(res => res.text()).then(src => {
    let el = document.createElement('style');
    el.textContent = src;
    return el;
  })
  cache.set(url, p);
  return p;
}

export default loadStyles;
