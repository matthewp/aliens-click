
const main = document.querySelector('main');

let disconnect;
function teardown() {
  if(disconnect) {
    disconnect();
  }

  while(main.firstChild) {
    main.removeChild(main.firstChild);
  }
}

async function route() {
  let src;
  if(location.pathname === '/') {
    src = './index-controller.js';
  } else {
    src = './article-controller.js';
  }
  let {default:init} = await import(src);

  teardown();
  disconnect = init(main);
}

route();

document.addEventListener('click', function(ev) {
  let anchor = ev.target.nodeName === 'A' ?
    ev.target : ev.target.closest('a');

  if(anchor) {
    let url = anchor.pathname;
    if(url === '/' || /\/article\/(.+)/.test(url)) {
      ev.preventDefault();
      history.pushState(url, null, url);
      route();
    }
  }
});

window.addEventListener('popstate', function(ev) {
  if(ev.state) {
    route();
  }
});