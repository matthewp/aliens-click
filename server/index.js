const api = require('./api');
const compression = require('compression');
const express = require('express');
const templates = require('./templates');
const idomToString = require('fritz/to-string');
const app = express();

const {
  index: indexTemplate,
  search: searchTemplate,
  article: articleTemplate
} = templates;

app.use(compression());

app.get('/api/aliens', function(req, res){
  api.list().then(json => res.send(json));
});

app.get('/api/article/:id', function(req, res){
  let id = req.params.id;
  api.article(id).then(result => res.send(result));
});

app.get('/', function(req, res){
  api.list()
  .then(species => {
    let bc = indexTemplate(species, { species });
    let html = idomToString(bc);
    res.type('html').end(html);
  })
  .catch(err => {
    res.status(500).end(err);
  });
});

app.get('/article/:id', function(req, res){
  let id = req.params.id;

  api.article(id)
  .then(data => {
    let bc = articleTemplate(data, { articleData: data });
    let html = idomToString(bc);
    res.type('html').end(html);
  })
  .catch(err => {
    console.log(err);
    res.status(500).end(err);
  });
});

app.get('/search', function(req, res){
  let q = req.query.q;

  api.list()
  .then(species => {
    let bc = searchTemplate(species, q, { species });
    let html = idomToString(bc);
    res.type('html').end(html);
  })
  .catch(err => {
    console.log(err);
    res.status(500).end(err);
  });
});

app.use(express.static(__dirname + '/..'));

const port = process.env.PORT || 8080;
app.listen(port);
console.log(`Server running on http://localhost:8080`);
