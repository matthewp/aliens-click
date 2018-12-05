const api = require('../../../lib/api.js');

exports.handle = async function(e) {
  let { id } = e.pathParameters;
  let { width } = e.queryStringParameters || {};

  let data = await api.article(id, width);

  let json = JSON.stringify(data);

  let response = {
    isBase64Encoded: false,
    statusCode: 200,
    body: json,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-length': Buffer.byteLength(json)
    }
  };

  return response;
};