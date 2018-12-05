const api = require('../../../lib/api.js');

exports.handle = async function() {
  let data = await api.list();
  
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
