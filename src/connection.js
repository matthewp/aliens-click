import { connect } from 'https://unpkg.com/theda@1.0.1/theda.js';

const addr = document.getElementById('worker-address').dataset.workerAddress;

const worker = new Worker(addr);
const api = connect(worker);

const { ArticleViewModel, IndexViewModel } = api;

export {
  api as default,

  ArticleViewModel,
  IndexViewModel
}
