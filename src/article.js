import { h } from 'fritz';
import Layout from './layout.js';
import Loading from './loading.js';
import * as api from './api.js';
import { article as articleTemplate } from './templates.js';

export default function(){
  const app = this;

  function details(req, res, next) {
    if(!req.articleData) {
      api.article(req.params.id).then(data => {
        req.articleData = data;
        next();
      }, next);
    } else {
      next();
    }
  }

  app.get('/article/:id',
  function(req, res, next) {
    if(app.state.articleData) {
      req.articleData = app.state.articleData;
      delete app.state.articleData;
    }
    next();
  },
  function(req, res, next){
    if(!req.articleData) {
      res.push(<Layout><Loading /></Layout>);
    }
    next();
  },
  details,
  function(req, res){
    let data = req.articleData;
    let intro = data.article.sections[0];

    res.push(articleTemplate(data));
  });
}
