import './swap-shadow.js';
import fritz from 'fritz/window.js';
import Router from './router.js';

fritz.use(new Worker('/app.js'));

new Router();