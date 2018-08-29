import './swap-shadow.js';
import fritz from 'fritz/window.js';
import Router from './router.js';

fritz.use(new Worker('/assets/app.js'));

new Router();
