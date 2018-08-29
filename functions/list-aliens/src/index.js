const api = require('aliens-app/lib/api.js');

exports.handle = function(e, ctx, cb) {
  api.list().then(data => {
    let json = JSON.stringify(data);
    cb(null, {
      isBase64Encoded: false,
      statusCode: 200,
      body: json,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'content-length': Buffer.byteLength(json)
      }
    });
  })
  .catch(err => {
    cb(err);
  });
};
