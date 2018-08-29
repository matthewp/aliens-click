const handler = require('../main.js').handle;

handler({}, {}, function(err, result){
  if(err) {
    console.error(err);
  } else {
    console.log(result);
  }
});
