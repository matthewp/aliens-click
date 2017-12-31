import { connect } from 'https://unpkg.com/theda@1.0.0/theda.js';

const worker = new Worker('./src/worker.js');
const api = connect(worker);

const { ArticleViewModel, IndexViewModel } = api;

export {
  api as default,

  ArticleViewModel,
  IndexViewModel
}
