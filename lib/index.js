const api = require('./api');
const assert = require('assert');

const express = require('express');
const app = express();
const fs = require('fs');

const staticFunction = require('../functions/static/main.js');
const listAlienFunction = require('../functions/list-aliens/main.js');
const alienFunction = require('../functions/alien/main.js');

app.get('/', makeHandler(staticFunction.handle));
app.get('/article/:id', makeHandler(staticFunction.handle));
app.get('/api/aliens', makeHandler(listAlienFunction.handle));
app.get('/api/article/:id', makeHandler(alienFunction.handle));
app.get('/service-worker-registration.js', static('service-worker-registration.js'));
app.get('/service-worker.js', static('service-worker.js'));

function static(publicPath) {
  let pth = __dirname + '/../public/' + publicPath;
  return function(req, res) {
    let stream = fs.createReadStream(pth);
    res.writeHead(200, {
      'content-type': 'text/javascript'
    });
    stream.pipe(res);
  };
}

function makeCallback(res) {
  let cb = function(err, response){
    cb.wasCalled = true;
    setTimeout(() => {
      if(err) {
        res.writeHead(500);
        res.end(err.message || err);
      } else {
        assert.ok(response.statusCode);
        res.writeHead(response.statusCode, response.headers || {});
        res.end(response.body);
      }
    });
  };
  return cb;
}

function makeHandler(route) {
  return function(req, res){
    let h = req.headers;
    let e = {
      headers: {
        Cookie: h.cookie
      },
      httpMethod: req.method,
      queryStringParameters: req.query,
      pathParameters: req.params || {}
    };
    let ctx = {
    };

    function callCallback() {
      let cb = makeCallback(res);
      let p = route(e, ctx, cb);
      if(p && p.then) {
        p.then(function(val) {
          if(!cb.wasCalled) {
            cb(null, val);
          }
        }, function(err) {
          if(!cb.wasCalled) {
            cb(err);
          }
        });
      }
    }

    if(req.method === 'POST') {
      e.body = '';
      req.on('data', data => e.body += data.toString());
      req.on('end', callCallback);
    } else {
      callCallback();
    }
  };
}


/*
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
    req.appState = { filter: '', species };
    species.forEach(specie => {
      specie.tn = thumbnail(specie);
    });
    let html = indexView({
      page: 'index',
      species,
      filter: '',
      styles: speciesListStyle
    });
    res.write(minify(html));
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
    req.appState = data;
    let intro = data.article.sections[0];
    let item = first(data.detail.items);
    let html = articleView({
      page: 'article',
      id,
      intro,
      data,
      thumbnail: thumbnail(item),
      styles: articlePageStyle
    });
    res.write(minify(html));
    next();
  })
  .catch(next);
},
footer());

function filterSpecies(species, query){
  query = query.toLowerCase();
  return species.filter(specie => specie.title.toLowerCase().indexOf(query) !== -1);
}


app.get('/search',
header(),
function(req, res, next){
  let q = req.query.q;

  api.list()
  .then(species => {
    req.appState = { filter: q, species };
    species = filterSpecies(species, q);
    species.forEach(specie => {
      specie.tn = thumbnail(specie);
    });
    let html = indexView({
      page: 'index',
      species,
      filter: q,
      styles: speciesListStyle
    });
    res.write(minify(html));
    next();
  })
  .catch(err => {
    res.end(err);
  });
},
footer());

app.get('/styles.css', function(req, res){
  res.type('text/css').end(mainCSS);
})
*/

app.use('/assets', express.static(__dirname + '/../public'));

const port = process.env.PORT || 2087;
app.listen(port);
console.log(`Server running on http://localhost:${port}`);
