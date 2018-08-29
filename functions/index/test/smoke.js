const handle = require('../main.js').handle;

handle({}, {}, function(err, response){
  if(err) {
    console.error(err);
  } else {
    console.log(response.body);
  }
});
