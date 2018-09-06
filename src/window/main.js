import './swap-shadow.js';
import fritz from 'fritz/window.js';
import Router from './router.js';

const worker = new Worker('/assets/app.js');

fritz.use(worker);

if(navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener('message', event => {
    worker.postMessage(event.data);
  });
}

new Router();
