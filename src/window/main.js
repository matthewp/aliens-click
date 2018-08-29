import './swap-shadow.js';
import fritz from 'fritz/window.js';
import Router from './router.js';

fritz.use(new Worker('/assets/app.js'));

const state = document.getElementById('state-from-server').dataset.state;
if(state) {
  fritz.state = JSON.parse(unescape(state));
}

new Router();
