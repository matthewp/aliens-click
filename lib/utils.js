const htmlMinifier = require('html-minifier');

exports.first = function(obj){
  let key = Object.keys(obj)[0];
  return obj[key];
};

exports.minifyHtml = function(src){
  return htmlMinifier.minify(src, {
    collapseWhitespace: true
  });
};