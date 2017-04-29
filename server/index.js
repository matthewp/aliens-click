const api = require('./api');

const compression = require('compression');
const compile = require('./handlebars-compile');
const express = require('express');
const stringValue = require('./string-value');
const templates = require('./templates');
const thumbnail = require('./thumbnail');
const { first } = require('./utils');
const {
  header,
  footer
} = require('./view-common');
const app = express();

const indexView = compile('partials/index.handlebars');
const articleView = compile('partials/article.handlebars');

const speciesListStyle = stringValue(__dirname + '/../src/SpeciesList.css');
const articlePageStyle = stringValue(__dirname + '/../src/ArticlePage.css');

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
  let width = req.query.width;
  api.article(id, width).then(result => res.send(result));
});

app.get('/',
header(),
function(req, res, next){
  api.list()
  .then(species => {
    species.forEach(specie => {
      specie.tn = thumbnail(specie);
    });
    let html = indexView({
      page: 'index',
      species,
      filter: '',
      styles: speciesListStyle
    });
    res.write(html);
    next();
  })
  .catch(next);
},
footer());

app.get('/article/:id',
header(),
function(req, res, next){
  let id = req.params.id;

  api.article(id, '300')
  .then(data => {
    let intro = data.article.sections[0];
    let item = first(data.detail.items);
    let html = articleView({
      page: 'article',
      id,
      intro,
      data,
      thumbnail: thumbnail(item)
    });
    res.write(html);
    next();
  })
  .catch(next);
},
footer());

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
