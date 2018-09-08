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
app.use('/assets', express.static(__dirname + '/../public'));

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

const port = process.env.PORT || 2087;
app.listen(port);
console.log(`Server running on http://localhost:${port}`);
