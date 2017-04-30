const fs = require('fs');

module.exports = function(pth){
  return fs.readFileSync(pth, 'utf8');
};